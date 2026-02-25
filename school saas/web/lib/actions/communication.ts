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
                    parent:profiles!parent_id(full_name, phone, phone_number)
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
 * Optimized for parallel processing and bulk logging.
 */
export async function sendBulkSMS(recipients: { phone: string, name: string }[], message: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    try {
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
        if (!profile?.tenant_id) return { success: false, error: "Tenant context missing" }

        const { data: tenant } = await supabase.from('tenants').select('sms_balance').eq('id', profile.tenant_id).single()
        let currentBalance = Number(tenant?.sms_balance) || 0
        const SMS_COST = SMS_CONFIG.UNIT_COST

        const results: any[] = []
        const messageLogs: any[] = []
        let queuedCount = 0

        // Process in batches to avoid timeouts
        const BATCH_SIZE = 5
        for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
            const batch = recipients.slice(i, i + BATCH_SIZE)

            if (currentBalance < (SMS_COST * batch.length)) {
                batch.forEach(r => results.push({ phone: r.phone, status: 'skipped_insufficient_funds' }))
                break
            }

            const batchResults = await Promise.all(batch.map(async (recipient) => {
                const smsRes = await sendSMS(recipient.phone, message)
                return { ...recipient, success: smsRes.success, smsData: smsRes.data }
            }))

            for (const res of batchResults) {
                const status = res.success ? 'sent' : 'failed'
                if (res.success) {
                    currentBalance -= SMS_COST
                    queuedCount++
                    messageLogs.push({
                        tenant_id: profile.tenant_id,
                        sender_id: user.id,
                        recipient_phone: res.phone,
                        recipient_name: res.name,
                        message_content: message,
                        channel: 'sms',
                        status: status,
                        cost: SMS_COST,
                        provider_ref: (res.smsData as any)?.message_id
                    })
                }
                results.push({ phone: res.phone, status })
            }
        }

        // Final bulk updates
        if (queuedCount > 0) {
            await supabase.from('tenants').update({ sms_balance: currentBalance }).eq('id', profile.tenant_id)
            if (messageLogs.length > 0) {
                await supabase.from('message_logs').insert(messageLogs)
            }
        }

        return { success: true, results }
    } catch (error) {
        console.error("[SEND_BULK_SMS] Error:", error)
        return { success: false, error: "Communication service failure" }
    }
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
                .select('full_name, phone, phone_number')
                .eq('tenant_id', profile.tenant_id)
                .eq('role', 'parent')

            recipients = (parents || [])
                .filter(p => p.phone || p.phone_number)
                .map(p => ({ phone: (p.phone || p.phone_number)!, name: p.full_name || 'Parent' }))
        } else if (audienceType === 'class') {
            const { data: students } = await supabase
                .from('students')
                .select(`
                    full_name,
                    parent:profiles!parent_id(full_name, phone, phone_number)
                `)
                .eq('class_id', audienceId)
                .eq('tenant_id', profile.tenant_id)

            recipients = (students || []).map(s => {
                const parent = Array.isArray(s.parent) ? s.parent[0] : s.parent
                const phone = (parent as any)?.phone || (parent as any)?.phone_number
                return {
                    phone: phone,
                    name: (parent as any)?.full_name || 'Parent'
                }
            }).filter(p => p.phone)
        } else if (audienceType === 'staff') {
            const { data: staff } = await supabase
                .from('profiles')
                .select('full_name, phone, phone_number')
                .eq('tenant_id', profile.tenant_id)
                .eq('role', 'teacher')

            recipients = (staff || [])
                .filter(s => s.phone || s.phone_number)
                .map(s => ({ phone: (s.phone || s.phone_number)!, name: s.full_name || 'Staff' }))
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
            parent:profiles!parent_id(id, full_name, avatar_url),
            staff:profiles!staff_id(id, full_name, avatar_url),
            messages:chat_messages(content, is_read, sender_id, created_at)
        `)
        .or(`staff_id.eq.${user.id},parent_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false })

    if (error) {
        console.error("[CHAT_DEBUG] Get threads error:", error)
        return { success: false, error: `Failed to load chats: ${error.message}` }
    }

    // Process to get last message preview
    const processed = (threads || []).map(t => {
        const staff = Array.isArray(t.staff) ? t.staff[0] : t.staff
        const parent = Array.isArray(t.parent) ? t.parent[0] : t.parent

        const isStaff = (staff as any)?.id === user.id
        const partner = isStaff ? parent : staff

        // Ensure we get the actual latest message from the joined array
        const sortedMessages = [...(t.messages || [])].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )

        return {
            id: t.id,
            partner: partner,
            lastMessage: sortedMessages[0],
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

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (!profile) return { success: false, error: "Unauthorized" }

    let query = supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role')
        .eq('tenant_id', profile.tenant_id)
        .order('full_name')

    // If user is parent, fetch teachers/staff
    if (profile.role === 'parent') {
        query = query.in('role', ['teacher', 'admin', 'proprietor'])
    } else {
        // If user is staff, fetch parents
        query = query.eq('role', 'parent')
    }

    const { data: recipients, error } = await query

    if (error) return { success: false, error: "Failed to load recipients" }
    return { success: true, data: recipients }
}

/**
 * 7. Get or Create Chat Channel
 */
export async function getOrCreateChannel(partnerId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (!profile) return { success: false, error: "Unauthorized" }

    // Determine who is who based on initiator
    let staffId, parentId

    if (profile.role === 'parent') {
        parentId = user.id
        staffId = partnerId
    } else {
        staffId = user.id
        parentId = partnerId
    }

    // Check if exists
    const { data: existing } = await supabase
        .from('chat_channels')
        .select('id')
        .eq('staff_id', staffId)
        .eq('parent_id', parentId)
        .maybeSingle()

    if (existing) return { success: true, channelId: existing.id }

    // Create new
    const { data: created, error } = await supabase
        .from('chat_channels')
        .insert({
            tenant_id: profile.tenant_id,
            staff_id: staffId,
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

/**
 * 12. Get Unread Message Count
 * Returns the total number of unread messages for the current user.
 */
export async function getUnreadMessageCount() {
    try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, count: 0 }

        // Count messages in channels where the user is a participant but not the sender
        const { data: channels } = await supabase
            .from('chat_channels')
            .select('id')
            .or(`staff_id.eq.${user.id},parent_id.eq.${user.id}`)

        if (!channels || channels.length === 0) return { success: true, count: 0 }

        const channelIds = channels.map(c => c.id)

        const { count, error } = await supabase
            .from('chat_messages')
            .select('id', { count: 'exact', head: true })
            .eq('is_read', false)
            .neq('sender_id', user.id)
            .in('channel_id', channelIds)

        if (error) {
            console.error("[CHAT] Unread count query error:", error)
            return { success: false, count: 0 }
        }

        return { success: true, count: count || 0 }
    } catch (error) {
        console.error("[CHAT] Unread count critical error:", error)
        return { success: false, count: 0, error: "Critical failure in unread count" }
    }
}

/**
 * 13. Get Chat Messages
 * Fetches the full message history for a specific channel.
 */
export async function getChatMessages(channelId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error("[CHAT] Fetch messages error:", error)
        return { success: false, error: "Failed to load messages" }
    }

    // Mark messages as read if recipient is current user
    const unreadIds = messages
        .filter(m => !m.is_read && m.sender_id !== user.id)
        .map(m => m.id)

    if (unreadIds.length > 0) {
        await supabase
            .from('chat_messages')
            .update({ is_read: true })
            .in('id', unreadIds)
    }

    return { success: true, data: messages }
}

/**
 * 14. Nudge Debtors
 * Identifies all students with outstanding balances for the current session/term
 * and sends personalized SMS reminders to their parents.
 * Optimized for performance and stability.
 */
export async function nudgeDebtors() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', user.id)
            .single()

        if (!profile?.tenant_id) return { success: false, error: "Tenant context missing" }

        // 1. Get Tenant Info & Balance
        const { data: tenant } = await supabase
            .from('tenants')
            .select('name, sms_balance')
            .eq('id', profile.tenant_id)
            .single()

        if (!tenant) return { success: false, error: "School profile not found" }

        // 2. Get Active Session
        const { data: session } = await supabase
            .from('academic_sessions')
            .select('session, term')
            .eq('tenant_id', profile.tenant_id)
            .eq('is_active', true)
            .maybeSingle()

        if (!session) return { success: false, error: "No active academic session found" }

        // 3. Identify Debtors (Students with balance > 0 in current session)
        // Query both phone and phone_number to be safe against schema variations
        const { data: debtors, error: debtorError } = await supabase
            .from('billing')
            .select(`
                balance,
                student:students(
                    full_name,
                    parent:profiles!parent_id(full_name, phone, phone_number)
                )
            `)
            .eq('tenant_id', profile.tenant_id)
            .eq('session', session.session)
            .eq('term', session.term)
            .gt('balance', 0)
            .limit(100) // Safety limit for single action

        if (debtorError) throw debtorError
        if (!debtors || debtors.length === 0) return { success: true, count: 0, message: "No outstanding balances found for this session." }

        // 4. Processing Logic
        let currentBalance = Number(tenant.sms_balance) || 0
        const SMS_COST = SMS_CONFIG.UNIT_COST
        let queuedCount = 0
        const messageLogs: any[] = []

        // Filter valid debtors with phones
        const validDebtors = debtors.filter(record => {
            const parent = record.student?.parent as any
            const phone = parent?.phone || parent?.phone_number
            return !!(phone && record.student?.full_name)
        })

        if (validDebtors.length === 0) return { success: true, count: 0, message: "No debtors with valid phone numbers found." }

        // Process in small parallel batches to avoid timeouts but respect concurrency
        const BATCH_SIZE = 5
        for (let i = 0; i < validDebtors.length; i += BATCH_SIZE) {
            const batch = validDebtors.slice(i, i + BATCH_SIZE)

            // Check if we still have enough wallet balance
            if (currentBalance < (SMS_COST * batch.length)) break

            const results = await Promise.all(batch.map(async (record) => {
                const parent = record.student?.parent as any
                const phone = parent?.phone || parent?.phone_number
                const studentName = record.student?.full_name
                const balance = record.balance

                if (!phone) return { success: false }

                const message = `Hello ${parent.full_name || 'Parent'}, this is a reminder regarding the outstanding balance of ₦${balance.toLocaleString()} for ${studentName} at ${tenant.name}. Please kindly settle at your earliest convenience.`

                const smsRes = await sendSMS(phone, message)
                return { success: smsRes.success, phone, name: parent.full_name, message, data: smsRes.data }
            }))

            for (const res of results) {
                if (res.success) {
                    currentBalance -= SMS_COST
                    queuedCount++
                    messageLogs.push({
                        tenant_id: profile.tenant_id,
                        sender_id: user.id,
                        recipient_phone: res.phone,
                        recipient_name: res.name || 'Parent',
                        message_content: res.message,
                        channel: 'sms',
                        status: 'sent',
                        cost: SMS_COST,
                        provider_ref: (res.data as any)?.message_id
                    })
                }
            }
        }

        // 5. Batch updates
        if (queuedCount > 0) {
            // Update Tenant Balance
            await supabase
                .from('tenants')
                .update({ sms_balance: currentBalance })
                .eq('id', profile.tenant_id)

            // Insert Logs in Bulk
            if (messageLogs.length > 0) {
                await supabase.from('message_logs').insert(messageLogs)
            }
        }

        return {
            success: true,
            count: queuedCount,
            totalDebtors: debtors.length,
            message: queuedCount === validDebtors.length
                ? `Successfully nudged ${queuedCount} debtors.`
                : `Processed ${queuedCount} of ${validDebtors.length} eligible debtors (stopped due to wallet balance or limit).`
        }

    } catch (error) {
        console.error("[NUDGE_DEBTORS] Critical Error:", error)
        return { success: false, error: "System failure during nudge processing." }
    }
}
