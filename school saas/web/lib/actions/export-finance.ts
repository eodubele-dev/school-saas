'use server'

import { createClient } from '@/lib/supabase/server'

export async function exportMonthlyFinanceReport() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: "Profile not found" }

    // Fetch transactions for current month
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
            id,
            date,
            amount,
            method,
            status,
            reference,
            student:students(full_name, admission_number)
        `)
        .eq('tenant_id', profile.tenant_id)
        .gte('date', startOfMonth)
        .order('date', { ascending: false })

    if (error) return { success: false, error: error.message }
    if (!transactions || transactions.length === 0) return { success: false, error: "No transactions found for this month" }

    // Convert to CSV
    const headers = ['Date', 'Student Name', 'Admission No', 'Amount', 'Method', 'Reference', 'Status']
    const rows = transactions?.map((t: any) => [
        new Date(t.date).toLocaleString(),
        t.student?.full_name || 'Unknown',
        t.student?.admission_number || 'N/A',
        t.amount,
        t.method,
        t.reference || '-',
        t.status
    ]) || []

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    return {
        success: true,
        csv: csvContent,
        filename: `finance_report_${now.getFullYear()}_${now.getMonth() + 1}.csv`
    }
}
