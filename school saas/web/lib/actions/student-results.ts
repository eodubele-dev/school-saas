'use server'

import { createClient } from '@/lib/supabase/server'

// --- Actions ---

export async function checkFeeStatus(term: string, session: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // Get Student ID
    // Demo: Assuming the auth user is linked to a student profile or is a parent
    // For specific student lookup, usually we'd pass studentID if parent has multiple
    // Here we assume 1-to-1 or "current" student context
    const { data: student } = await supabase.from('students').select('id, tenant_id').limit(1).single()

    if (!student) return { success: false, error: "Student not found" }

    // Check Billing
    const { data: billing } = await supabase
        .from('billing')
        .select('status, balance, total_fees')
        .eq('student_id', student.id)
        .eq('term', term)
        .eq('session', session)
        .single()

    // Default to 'owing' if no record found (strict mode) or 'paid' if lax?
    // STRICT MODE: If no billing record exists, assume unpaid or administrative error.
    // For DEMO: If no record, let's assume 'paid' to show the UI, unless specifically seeded as owing.
    if (!billing) {
        // Fallback for demo if no billing data seeded
        return { success: true, isPaid: true, balance: 0 }
    }

    const isPaid = billing.status === 'paid' || billing.balance <= 0

    return {
        success: true,
        isPaid,
        balance: billing.balance,
        total: billing.total_fees
    }
}

export async function getTermResults(term: string, session: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

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

    // Mock mapping logic
    const stats = [
        { subject: 'Mathematics', A: 0, fullMark: 100 },
        { subject: 'English', A: 0, fullMark: 100 },
        { subject: 'Science', A: 0, fullMark: 100 },
        { subject: 'Arts', A: 0, fullMark: 100 },
        { subject: 'Social', A: 0, fullMark: 100 },
    ]

    // Fill with real data if available, else random/mock for visualization if grades empty
    // ... logic ...

    // Simplified return for the component to handle
    return { success: true }
}
