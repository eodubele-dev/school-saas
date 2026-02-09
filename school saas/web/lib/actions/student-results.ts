'use server'

import { createClient } from '@/lib/supabase/server'

// --- Actions ---

export async function checkFeeStatus(term: string, session: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // Get Student ID
    const { data: student } = await supabase.from('students').select('id, tenant_id').limit(1).single()

    if (!student) return { success: false, error: "Student not found" }

    // 1. Check Report Card Lock Status (Primary Source of Truth)
    // The 'unlock_results_on_payment' trigger updates this table.
    const { data: reportCard } = await supabase
        .from('student_report_cards')
        .select('is_locked')
        .eq('student_id', student.id)
        .eq('term', term)
        .eq('session', session)
        .single()

    // If explicitly unlocked, allow access
    if (reportCard && reportCard.is_locked === false) {
        return { success: true, isPaid: true, balance: 0 }
    }

    // 2. Fallback: Check Billing (Real-time check if trigger failed or pre-dates trigger)
    const invoiceTerm = `${session} ${term}`
    const { data: invoice } = await supabase
        .from('invoices')
        .select('status, amount, amount_paid')
        .eq('student_id', student.id)
        .eq('term', invoiceTerm)
        .single()

    if (!invoice) {
        // Fallback for demo if no billing data seeded
        return { success: true, isPaid: false, balance: 50000 } // Mock outstanding
    }

    const isPaid = invoice.status === 'paid' || (Number(invoice.amount) - Number(invoice.amount_paid) <= 0)

    return {
        success: true,
        isPaid,
        balance: Number(invoice.amount) - Number(invoice.amount_paid),
        total: invoice.amount
    }
}

export async function getTermResults(term: string, session: string) {
    const supabase = createClient()
    // const { data: { user } } = await supabase.auth.getUser()

    // Get Student
    const { data: student } = await supabase.from('students').select('id, class_id').limit(1).single()
    if (!student) return { success: false, error: "Student not found" }

    // Fetch Grades
    const { data: grades } = await supabase
        .from('student_grades')
        .select(`
            *,
            subject:subjects(name)
        `)
        .eq('student_id', student.id)
        .eq('term', term)
        .eq('session', session)
        .order('created_at', { ascending: true }) // Logic to order by subject?

    return { success: true, grades: grades || [] }
}

export async function getCognitiveStats(term: string, session: string) {
    // Return aggregated data for the Radar Chart
    // In a real app, subjects are tagged with categories (Science, Arts, etc.)
    // For demo, we mock or infer from subject names.

    const { grades } = await getTermResults(term, session)
    if (!grades) return { success: false, stats: [] }

    // Aggregate grades for Radar Chart
    // We Map typical subjects to cognitive domains or just show Subject Performance
    // Let's assume the Radar Chart shows "Academic Performance by Subject"

    if (!grades || grades.length === 0) {
        // Return empty stats structure to avoid crashing UI
        return { success: true, stats: [] }
    }

    // Transform grades to Recharts format: { subject: 'Math', A: 80, fullMark: 100 }
    // We take the 'total_score' or 'exam_score' + 'ca_score'
    const stats = grades.map((g: any) => ({
        subject: g.subject?.name?.substring(0, 10) || 'Subject', // Truncate for label
        A: g.total_score || 0,
        fullMark: 100
    })).slice(0, 6) // Limit to 6 for clean radar

    return { success: true, stats }
}
