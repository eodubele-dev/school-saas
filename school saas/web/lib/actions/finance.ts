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
