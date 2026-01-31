'use server'

import { createClient } from '@/lib/supabase/server'

export interface BillingRecord {
    id: string
    student: { full_name: string; class: { name: string } }
    total_fees: number
    amount_paid: number
    balance: number
    status: 'paid' | 'partial' | 'owing'
}

export async function getDebtorStudents(session: string, term: string) {
    const supabase = createClient()

    // Fetch students with balance > 0
    const { data, error } = await supabase
        .from('billing')
        .select(`
            id,
            total_fees,
            amount_paid,
            balance,
            status,
            student:students (
                full_name,
                class:classes (name)
            )
        `)
        .eq('session', session)
        .eq('term', term)
        .gt('balance', 0)
        .order('balance', { ascending: false })

    if (error) {
        console.error("Billing Error:", error)
        return []
    }

    // Mapping to clean structure
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((record: any) => ({
        id: record.id,
        studentName: record.student?.full_name || "Unknown",
        className: record.student?.class?.name || "N/A",
        totalFees: record.total_fees,
        amountPaid: record.amount_paid,
        balance: record.balance,
        status: record.status
    }))
}

export async function generatePaystackLink(studentName: string, amount: number, email: string = "parent@example.com") {
    // In a real app, you would call Paystack API here
    // For demo/prototype: Generate a direct payment page URL
    // const response = await paystack.transaction.initialize({ ... })

    // For now, return a mock URL or a generic Paystack payment page
    // Note: Use environment variable for public key if doing client-side, 
    // but here we are simulating an action that returns a link.

    return `https://paystack.com/pay/demo-school-fees?amount=${amount * 100}&email=${email}&ref=${Date.now()}`
}

/**
 * Fetch current billing details for a student
 */
export async function getStudentBilling(studentId: string, session: string, term: string) {
    const supabase = createClient()

    try {
        const { data, error } = await supabase
            .from('billing')
            .select('*')
            .eq('student_id', studentId)
            .eq('session', session)
            .eq('term', term)
            .single()

        if (error) {
            // Return default/empty if not found
            return {
                total_fees: 0,
                amount_paid: 0,
                balance: 0,
                status: 'paid',
                breakdown: {
                    tuition: 0,
                    bus: 0,
                    uniform: 0,
                    pta: 0
                }
            }
        }

        // Mock breakdown for now (store in JSONB later if needed)
        const breakdown = {
            tuition: data.total_fees * 0.7,
            bus: data.total_fees * 0.15,
            uniform: data.total_fees * 0.1,
            pta: data.total_fees * 0.05
        }

        return { ...data, breakdown }
    } catch {
        return null
    }
}

/**
 * Fetch Last 5 Payments
 */
export async function getPaymentHistory(studentId: string) {
    const supabase = createClient()

    try {
        // Need to join through billing to filter by student
        // Or if payments has student_id directly? 
        // Schema update script linked payments to BILLING_ID.
        // So we need to find billing records for this student first.

        // Let's assume we can fetch by billing IDs or join.
        // Simplified: Fetch all billing records for student, then payment ids.

        const { data: billings } = await supabase
            .from('billing')
            .select('id')
            .eq('student_id', studentId)

        if (!billings || billings.length === 0) return []

        const billingIds = billings.map(b => b.id)

        const { data: payments } = await supabase
            .from('payments')
            .select('*')
            .in('billing_id', billingIds)
            .order('date', { ascending: false })
            .limit(5)

        return payments || []

    } catch {
        return []
    }
}
