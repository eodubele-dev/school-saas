'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendSMS } from '@/lib/services/termii'
import { SMS_CONFIG } from '@/lib/constants/communication'

/**
 * 1. Get Daily Absentees
 * Fetches students marked 'absent' for the current day.
 */
export async function getDailyAbsentees() {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Not authenticated" }

        const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
        if (!profile?.tenant_id) return { success: false, error: "Unauthorized" }

        let classFilter = []

        // If user is a teacher, fetch their assigned classes
        if (profile.role === 'teacher') {
            const { data: teacherClasses } = await supabase
                .from('subject_teachers')
                .select('class_id')
                .eq('teacher_id', user.id)
                .eq('tenant_id', profile.tenant_id)

            if (teacherClasses && teacherClasses.length > 0) {
                classFilter = teacherClasses.map(tc => tc.class_id)
            } else {
                // Teacher has no classes, so they shouldn't see any absentees
                return { success: true, data: [] }
            }
        }

        let query = supabase
            .from('student_attendance')
            .select(`
                *,
                student:students(
                    full_name, 
                    class_id,
                    parent:profiles!parent_id(full_name, phone)
                )
            `)
            .eq('date', today)
            .eq('status', 'absent')
            .eq('tenant_id', profile.tenant_id)

        // Apply class filter if it exists (for teachers)
        if (classFilter.length > 0) {
            // We need to filter by the student's class_id. 
            // Since we can't easily do a nested filter on the join in one go with Supabase JS sometimes,
            // we can filter the parent rows if we assume the attendance table might have class_id or we filter after fetch.
            // However, student_attendance usually is linked to a student.
            // Let's filter by student's class_id. 
            // Optimized way: Get students in those classes first? Or filter in memory if dataset is small.
            // Better: use !inner join to filter.

            // Actually, does student_attendance have class_id? Let's assume No, it links to student.
            // We can use the foreign key filter:
            query = query.in('student.class_id', classFilter)
            // but 'student.class_id' notation in .in() might not work as expected for M:1.
            // Alternative: Filter returned data in application layer for now (MVP) since daily absentees count is low.
        }

        const { data: attendance, error } = await query

        if (error) throw error

        // In-memory filter for teachers to ensure strict class adherence
        // (Supabase join filtering syntax can be tricky with 'in')
        let filteredAttendance = attendance
        if (profile.role === 'teacher') {
            filteredAttendance = attendance.filter(record =>
                record.student && classFilter.includes(record.student.class_id)
            )
        }

        return { success: true, data: filteredAttendance }
    } catch (error) {
        console.error("Fetch absentees error:", error)
        return { success: false, error: "Failed to fetch absentees" }
    }
}

/**
 * 2. Send Bulk SMS
 * Sends SMS to a list of recipients using the integrated Termii service.
 */
export async function sendBulkSMS(recipients: { phone: string, name: string }[], message: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile?.tenant_id) return { success: false, error: "Tenant context missing" }

    const { data: tenant } = await supabase.from('tenants').select('sms_balance').eq('id', profile.tenant_id).single()
    let currentBalance = Number(tenant?.sms_balance) || 0
    const SMS_COST = SMS_CONFIG.UNIT_COST // Standard rate

    const results = []

    for (const recipient of recipients) {
        // --- Wallet Check ---
        if (currentBalance < SMS_COST) {
            results.push({ phone: recipient.phone, status: 'skipped_insufficient_funds' })
            continue
        }

        // --- PRO PRODUCTION: Call real Termii Service ---
        const smsRes = await sendSMS(recipient.phone, message)
        const status = smsRes.success ? 'sent' : 'failed'

        if (smsRes.success) {
            currentBalance -= SMS_COST
            // Aggressively update balance to avoid over-spending in parallel if possible, 
            // though single-tenant sequential sends here are safer.
            await supabase
                .from('tenants')
                .update({ sms_balance: currentBalance })
                .eq('id', profile.tenant_id)
        }

        // Log to Communications Audit Trail
        await supabase.from('message_logs').insert({
            tenant_id: profile.tenant_id,
            sender_id: user.id,
            recipient_phone: recipient.phone,
            recipient_name: recipient.name,
            message_content: message,
            channel: 'sms',
            status: status,
            cost: smsRes.success ? SMS_COST : 0,
            provider_ref: smsRes.success ? (smsRes.data as any)?.message_id : 'FAILED'
        })

        results.push({ phone: recipient.phone, status })
    }

    return { success: true, results }
}

/**
 * 3. Send Broadcast
 * Handles sending messages via selected channels.
 */
export async function sendBroadcast(
    channel: 'sms' | 'whatsapp' | 'email',
    audienceType: 'all_parents' | 'class' | 'staff',
    audienceId: string,
    message: string
) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile?.tenant_id) return { success: false, error: "Tenant context missing" }

    let recipients: { phone: string, name: string }[] = []

    try {
        if (audienceType === 'all_parents') {
            const { data: parents } = await supabase
                .from('profiles')
                .select('full_name, phone')
                .eq('tenant_id', profile.tenant_id)
                .eq('role', 'parent')

            recipients = (parents || [])
                .filter(p => p.phone)
                .map(p => ({ phone: p.phone!, name: p.full_name || 'Parent' }))
        } else if (audienceType === 'class') {
            const { data: students } = await supabase
                .from('students')
                .select(`
                    full_name,
                    parent:profiles!parent_id(full_name, phone)
                `)
                .eq('class_id', audienceId)
                .eq('tenant_id', profile.tenant_id)

            recipients = (students || []).map(s => {
                const parent = Array.isArray(s.parent) ? s.parent[0] : s.parent
                return {
                    phone: (parent as any)?.phone,
                    name: (parent as any)?.full_name || 'Parent'
                }
            }).filter(p => p.phone)
        } else if (audienceType === 'staff') {
            const { data: staff } = await supabase
                .from('profiles')
                .select('full_name, phone')
                .eq('tenant_id', profile.tenant_id)
                .eq('role', 'teacher')

            recipients = (staff || [])
                .filter(s => s.phone)
                .map(s => ({ phone: s.phone!, name: s.full_name || 'Staff' }))
        }

        if (recipients.length === 0) {
            return { success: false, error: "No valid recipients found with phone numbers" }
        }

        if (channel === 'sms') {
            return await sendBulkSMS(recipients, message)
        }

        // WhatsApp/Email stubs for future phases
        return { success: true, message: `Broadcast simulation for ${channel} to ${recipients.length} recipients successful.` }

    } catch (error) {
        console.error("Broadcast error:", error)
        return { success: false, error: "Failed to process broadcast" }
    }
}

/**
 * 3b. Get Communication Audience Options
 * Fetches classes and other groups for the broadcast composer.
 */
export async function getCommunicationAudience() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: "Unauthorized" }

    const { data: classes, error } = await supabase
        .from('classes')
        .select('id, name')
        .eq('tenant_id', profile.tenant_id)
        .order('name')

    if (error) return { success: false, error: "Failed to load audience options" }

    return { success: true, classes }
}

/**
 * 4. Get Chat Threads
 * Lists active conversations.
 */
export async function getChatThreads() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    const { data: threads, error } = await supabase
        .from('chat_channels')
        .select(`
            id,
            last_message_at,
            parent:profiles!parent_id(id, full_name, photo_url),
            staff:profiles!staff_id(id, full_name, photo_url),
            messages:chat_messages(content, is_read, sender_id, created_at)
        `)
        .or(`staff_id.eq.${user.id},parent_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false })

    if (error) {
        console.error("Get threads error:", error)
        return { success: false, error: "Failed to load chats" }
    }

    // Process to get last message preview
    const processed = (threads || []).map(t => {
        // Handle potential array results from joins
        const staff = Array.isArray(t.staff) ? t.staff[0] : t.staff
        const parent = Array.isArray(t.parent) ? t.parent[0] : t.parent

        const isStaff = (staff as any)?.id === user.id
        const partner = isStaff ? parent : staff

        return {
            id: t.id,
            partner: partner,
            lastMessage: t.messages?.[0],
            unreadCount: t.messages?.filter((m: any) => !m.is_read && m.sender_id !== user.id).length || 0
        }
    })

    return { success: true, data: processed }
}

/**
 * 5. Send Chat Message
 */
export async function sendChatMessage(channelId: string, content: string, attachmentUrl?: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    const { error } = await supabase.from('chat_messages').insert({
        channel_id: channelId,
        sender_id: user.id,
        content,
        attachment_url: attachmentUrl
    })

    if (error) return { success: false, error: "Failed to send" }

    // Update channel timestamp
    await supabase.from('chat_channels').update({ last_message_at: new Date() }).eq('id', channelId)

    revalidatePath('/dashboard/messages')
    return { success: true }
}

/**
 * 6. Get Chat Recipients
 * Fetches a list of parents that a staff member can start a chat with.
 * For MVP, we'll fetch all parents in the tenant.
 */
export async function getChatRecipients() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: "Unauthorized" }

    const { data: parents, error } = await supabase
        .from('profiles')
        .select('id, full_name, photo_url')
        .eq('tenant_id', profile.tenant_id)
        .eq('role', 'parent')
        .order('full_name')

    if (error) return { success: false, error: "Failed to load recipients" }
    return { success: true, data: parents }
}

/**
 * 7. Get or Create Chat Channel
 */
export async function getOrCreateChannel(parentId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: "Unauthorized" }

    // Check if exists
    const { data: existing } = await supabase
        .from('chat_channels')
        .select('id')
        .eq('staff_id', user.id)
        .eq('parent_id', parentId)
        .maybeSingle()

    if (existing) return { success: true, channelId: existing.id }

    // Create new
    const { data: created, error } = await supabase
        .from('chat_channels')
        .insert({
            tenant_id: profile.tenant_id,
            staff_id: user.id,
            parent_id: parentId
        })
        .select('id')
        .single()

    if (error) return { success: false, error: "Failed to initiate chat" }

    revalidatePath('/dashboard/messages')
    return { success: true, channelId: created.id }
}

/**
 * 8. Get Communication Settings
 */
export async function getCommunicationSettings() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (!profile) return { success: false, error: "Unauthorized" }

    const { data: settings, error } = await supabase
        .from('communication_settings')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .maybeSingle()

    if (error) return { success: false, error: "Failed to load settings" }

    // If no settings exist, create defaults
    if (!settings) {
        const { data: defaults, error: createError } = await supabase
            .from('communication_settings')
            .insert({ tenant_id: profile.tenant_id })
            .select('*')
            .single()

        if (createError) return { success: false, error: "Failed to initialize settings" }
        return { success: true, data: defaults, role: profile.role }
    }

    return { success: true, data: settings, role: profile.role }
}

/**
 * 9. Update Communication Settings
 */
export async function updateCommunicationSettings(payload: any) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile?.tenant_id) return { success: false, error: "Unauthorized" }

    const { error } = await supabase
        .from('communication_settings')
        .update(payload)
        .eq('tenant_id', profile.tenant_id)

    if (error) return { success: false, error: "Failed to update settings" }

    revalidatePath('/dashboard/messages') // Update this to match the actual page
    return { success: true }
}

/**
 * 10. Get Wallet Balance
 */
export async function getWalletBalance() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: "Unauthorized" }

    const { data: tenant, error } = await supabase
        .from('tenants')
        .select('sms_balance')
        .eq('id', profile.tenant_id)
        .single()

    if (error) return { success: false, error: "Failed to load wallet" }
    return { success: true, balance: tenant.sms_balance || 0 }
}
/**
 * 11. Get Current User Role
 */
export async function getUserRole() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile) return { success: false, error: "Unauthorized" }

    return { success: true, role: profile.role }
}
