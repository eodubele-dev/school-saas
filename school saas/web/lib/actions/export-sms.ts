'use server'

import { createClient } from '@/lib/supabase/server'

export async function exportSMSReport() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: "Profile not found" }

    // Fetch all SMS logs
    const { data: logs, error } = await supabase
        .from('sms_transactions')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('sent_at', { ascending: false })

    if (error) return { success: false, error: error.message }
    if (!logs || logs.length === 0) return { success: false, error: "No SMS logs found" }

    // Convert to CSV
    const headers = ['Date', 'Recipient', 'Phone', 'Type', 'Status', 'Cost', 'Content']
    const rows = logs?.map((log: any) => [
        new Date(log.sent_at).toLocaleString(),
        log.recipient_name,
        log.recipient_phone,
        log.message_type,
        log.status,
        log.cost,
        `"${(log.message_content || '').replace(/"/g, '""')}"` // Escape quotes
    ]) || []

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n')

    const now = new Date()
    return {
        success: true,
        csv: csvContent,
        filename: `sms_ledger_${now.getFullYear()}_${now.getMonth() + 1}.csv`
    }
}
