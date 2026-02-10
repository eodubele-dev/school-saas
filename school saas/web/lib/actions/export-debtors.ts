'use server'

import { createClient } from '@/lib/supabase/server'
import { getDebtorsList } from '@/lib/actions/collections'

export async function exportDebtorsReport() {
    const debtors = await getDebtorsList({ status: 'all' })

    if (!debtors || debtors.length === 0) {
        return { success: false, error: "No debtors found to export" }
    }

    // Convert to CSV
    const headers = ['Student Name', 'Admission No', 'Class', 'Parent Phone', 'Amount', 'Paid', 'Balance', 'Status', 'Term']
    const rows = debtors.map((d: any) => [
        d.studentName || 'Unknown',
        d.studentId || 'N/A',
        d.className || 'N/A',
        d.parentPhone || 'N/A',
        d.amount,
        d.paid,
        d.balance,
        d.status,
        d.term
    ])

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const now = new Date()
    return {
        success: true,
        csv: csvContent,
        filename: `debtors_list_${now.getFullYear()}_${now.getMonth() + 1}.csv`
    }
}
