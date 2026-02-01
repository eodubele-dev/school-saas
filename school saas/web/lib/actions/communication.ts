'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
        if (!profile) return { success: false, error: "Unauthorized" }

        const { data: attendance, error } = await supabase
            .from('student_attendance')
            .select(`
                *,
                student:students(full_name, parent_id)
            `)
            .eq('date', today)
            .eq('status', 'absent')
            .eq('tenant_id', profile.tenant_id)

        if (error) throw error

        // Enrich with parent details (mocked or actual join if parent linked)
        // Ideally, we'd join 'profiles' via 'parent_id' to get phone numbers.
        // For MVP, we'll fetch parent profiles separately if needed or rely on a simpler structure.

        return { success: true, data: attendance }
    } catch (error) {
        console.error("Fetch absentees error:", error)
        return { success: false, error: "Failed to fetch absentees" }
    }
}

/**
 * 2. Send Bulk SMS (Termii Stub)
 * Sends SMS to a list of recipients.
 */
export async function sendBulkSMS(recipients: { phone: string, name: string }[], message: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // In a real app, we'd limit this to 50/100 per batch or use a queue.
    const results = []

    // Simulate Termii API Call
    // const response = await fetch('https://api.ng.termii.com/api/sms/send', ...)

    for (const recipient of recipients) {
        // Mock success
        const status = 'sent'
        const cost = 2.50 // Mock cost per SMS

        // Log to DB
        await supabase.from('message_logs').insert({
            tenant_id: (await supabase.from('profiles').select('tenant_id').eq('id', user?.id).single()).data?.tenant_id,
            sender_id: user?.id,
            recipient_phone: recipient.phone,
            recipient_name: recipient.name,
            message_content: message,
            channel: 'sms',
            status: status,
            cost: cost,
            provider_ref: `MOCK_REF_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
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
    audienceType: 'class' | 'student',
    audienceId: string,
    message: string
) {
    const supabase = createClient()

    // Logic to resolve audience to list of parents
    // Fetch students in class -> Get Parents -> Get Phones
    // Then call sendBulkSMS or WhatsApp stub

    // Stub for now:
    console.log(`Sending ${channel} to ${audienceType} ${audienceId}: ${message}`)

    return { success: true, message: `Broadcast queued for ${channel}` }
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
            parent:profiles!parent_id(full_name, photo_url),
            staff:profiles!staff_id(full_name, photo_url),
            messages:chat_messages(content, is_read, created_at)
        `)
        .or(`staff_id.eq.${user.id},parent_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false })

    if (error) {
        console.error("Get threads error:", error)
        return { success: false, error: "Failed to load chats" }
    }

    // Process to get last message preview
    const processed = threads.map(t => ({
        id: t.id,
        partner: t.staff.id === user.id ? t.parent : t.staff,
        lastMessage: t.messages?.[0], // Assuming we limit or sort. Best to use a separate query or limit in real app.
        unreadCount: t.messages?.filter((m: any) => !m.is_read && m.sender_id !== user.id).length || 0
    }))

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
