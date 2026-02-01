'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CashCountInput {
    denomination: string // '1000', '500', etc
    bundles: number
    loose: number
}

/**
 * Start or Get Today's Session
 */
export async function getTodaysSession() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    const tenantId = profile?.tenant_id
    const today = new Date().toISOString().split('T')[0]

    // Check existing
    const { data: existing } = await supabase
        .from('reconciliation_sessions')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('date', today)
        .single()

    if (existing) return { success: true, session: existing }

    // Create New
    const { data: newSession, error } = await supabase
        .from('reconciliation_sessions')
        .insert({
            tenant_id: tenantId,
            bursar_id: user.id,
            date: today,
            status: 'open',
            // In a real app, we would calculate system_cash_total here by summing up 'transactions' where type='cash' and date=today
            system_cash_total: 154200.00, // Mock Value for Demo: ₦154,200 collected in system
            system_bank_total: 450000.00, // Mock Value
        })
        .select()
        .single()

    if (error) return { success: false, error: error.message }
    return { success: true, session: newSession }
}

/**
 * Submit Cash Count
 */
export async function submitCashCount(sessionId: string, counts: CashCountInput[]) {
    const supabase = createClient()

    // Calculate total
    let grandTotal = 0
    const records = counts.map(c => {
        const value = parseInt(c.denomination) * ((c.bundles * 100) + c.loose)
        grandTotal += value
        return {
            session_id: sessionId,
            denomination: c.denomination,
            bundle_count: c.bundles,
            loose_count: c.loose,
            total_value: value
        }
    })

    // Upsert logic would be detailed here, for now delete old counts for this session and insert new
    await supabase.from('cash_counts').delete().eq('session_id', sessionId)
    const { error } = await supabase.from('cash_counts').insert(records)

    if (error) return { success: false, error: error.message }

    // Update Session Total & Variance
    const { data: session } = await supabase.from('reconciliation_sessions').select('system_cash_total').eq('id', sessionId).single()
    const systemTotal = session?.system_cash_total || 0
    // Variance is generated column in schema, but we update physical_total

    await supabase.from('reconciliation_sessions').update({
        physical_cash_total: grandTotal,
        // variance will auto-calc in DB (or we calc in UI)
    }).eq('id', sessionId)

    revalidatePath('/dashboard/bursar/finance/reconciliation')
    return { success: true, physicalTotal: grandTotal, variance: systemTotal - grandTotal }
}

/**
 * Auto-Match Stub
 */
export async function autoMatchTransactions(sessionId: string) {
    // 1. Fetch Unmatched Bank Imports
    // 2. Fetch Unreconciled System Ledger items
    // 3. Fuzzy Match logic (Date +/- 1 day, Amount match)

    // Simulating "AI" Matching delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    return { success: true, matchesFound: 12, confidence: 0.98 }
}

/**
 * Close Day
 */
export async function closeDay(sessionId: string, varianceReason?: string) {
    const supabase = createClient()
    await supabase.from('reconciliation_sessions').update({
        status: 'closed',
        closed_at: new Date().toISOString(),
        variance_reason: varianceReason
    }).eq('id', sessionId)

    // Trigger Email Report (Stub)
    console.log("Sending Daily Financial Report to Principal...")

    revalidatePath('/dashboard/bursar/finance/reconciliation')
    return { success: true }
}
