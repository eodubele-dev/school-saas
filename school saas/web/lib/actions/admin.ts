'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getAdminStats() {
    const supabase = createClient()
    
    // 1. Total Schools
    const { count: schoolCount } = await supabase
        .from('tenants')
        .select('*', { count: 'exact', head: true })

    // 2. Total SMS Balance across platform
    const { data: tenants } = await supabase
        .from('tenants')
        .select('sms_balance')
    
    const totalSmsBalance = tenants?.reduce((acc, t) => acc + (t.sms_balance || 0), 0) || 0

    // 3. Recent Transactions (last 24h)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count: recentTrxCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .gt('created_at', twentyFourHoursAgo)

    return {
        schoolCount: schoolCount || 0,
        totalSmsBalance,
        recentTrxCount: recentTrxCount || 0,
        success: true
    }
}

export async function getAllTenants() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('tenants')
        .select('id, name, slug, sms_balance, created_at')
        .order('created_at', { ascending: false })

    if (error) return { success: false, error: error.message }
    return { success: true, data }
}

export async function adjustSmsBalance(tenantId: string, amount: number, reason: string) {
    const supabase = createClient()

    // 1. Get current balance
    const { data: tenant } = await supabase
        .from('tenants')
        .select('sms_balance, name')
        .eq('id', tenantId)
        .single()

    if (!tenant) return { success: false, error: "Tenant not found" }

    const newBalance = (tenant.sms_balance || 0) + amount

    // 2. Update balance
    const { error: updateError } = await supabase
        .from('tenants')
        .update({ sms_balance: newBalance })
        .eq('id', tenantId)

    if (updateError) return { success: false, error: updateError.message }

    // 3. Log the adjustment as a transaction
    await supabase.from('transactions').insert({
        tenant_id: tenantId,
        amount: 0, // Manual adjustment has no Naira value in this context
        method: 'manual',
        status: 'success',
        reference: `ADJ-${Date.now()}`,
        paystack_metadata: {
            type: 'manual_adjustment',
            reason,
            adjustment_amount: amount,
            previous_balance: tenant.sms_balance,
            new_balance: newBalance
        }
    })

    revalidatePath('/super-admin')
    return { success: true, newBalance }
}
