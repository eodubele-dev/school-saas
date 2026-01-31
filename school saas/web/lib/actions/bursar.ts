'use server'

import { createClient } from '@/lib/supabase/server'

export interface FinancialStats {
    totalExpected: number
    totalReceived: number
    totalOutstanding: number
    paymentMethods: { method: string; amount: number }[]
}

export interface ClassRevenue {
    className: string
    amount: number
}

export async function getBursarStats(): Promise<FinancialStats> {
    const supabase = createClient()

    // In a real app with large data, use SQL aggregation or RPC
    // For MVP/Demo, fetch basic billing records
    const { data: billing } = await supabase.from('billing').select('total_fees, amount_paid, balance')

    // Mocking Payment Method data since it wasn't in the schema explicitly previously
    // Assuming a 'payments' table linked to billing would exist.
    // For now, returning mock splits for Paystack vs Cash

    if (!billing) {
        return {
            totalExpected: 0,
            totalReceived: 0,
            totalOutstanding: 0,
            paymentMethods: []
        }
    }

    const totalExpected = billing.reduce((acc: number, curr: { total_fees?: number }) => acc + (Number(curr.total_fees) || 0), 0)
    const totalReceived = billing.reduce((acc: number, curr: { amount_paid?: number }) => acc + (Number(curr.amount_paid) || 0), 0)
    const totalOutstanding = billing.reduce((acc: number, curr: { balance?: number }) => acc + (Number(curr.balance) || 0), 0)

    return {
        totalExpected,
        totalReceived,
        totalOutstanding,
        paymentMethods: [
            { method: 'Paystack (Online)', amount: totalReceived * 0.65 },
            { method: 'Cash / Transfer', amount: totalReceived * 0.35 }
        ]
    }
}

export async function getClassRevenueStats(): Promise<ClassRevenue[]> {
    const supabase = createClient()

    // Fetch billing with class relations
    // This is expensive without aggregation, but works for demo scale
    const { data } = await supabase
        .from('billing')
        .select(`
            amount_paid,
            student:students (
                class:classes (name)
            )
        `)

    const stats: Record<string, number> = {}

    data?.forEach((record: { amount_paid?: number; student?: { class?: { name?: string } } }) => {
        const className = record.student?.class?.name || 'Unassigned'
        const paid = Number(record.amount_paid) || 0
        if (!stats[className]) stats[className] = 0
        stats[className] += paid
    })

    // Convert to array
    return Object.entries(stats).map(([className, amount]) => ({ className, amount }))
}
