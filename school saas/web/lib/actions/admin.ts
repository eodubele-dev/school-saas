'use server'

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getAdminStats() {
    const supabase = createAdminClient()
    
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
        .is('student_id', null)
        .gt('created_at', twentyFourHoursAgo)

    // 4. Total Platform Revenue (all time successful, not student fees)
    const { data: revenueData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'success')
        .is('student_id', null)

    const totalRevenue = revenueData?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0

    return {
        schoolCount: schoolCount || 0,
        totalSmsBalance,
        recentTrxCount: recentTrxCount || 0,
        totalRevenue,
        success: true
    }
}

export async function getAllTenants(page = 1, limit = 10) {
    const supabase = createAdminClient()
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
        .from('tenants')
        .select('id, name, slug, sms_balance, created_at, is_active', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

    if (error) return { success: false, error: error.message }
    return { success: true, data, count, totalPages: Math.ceil((count || 0) / limit) }
}

export async function getRevenueStats(range: '7d' | '30d' | '90d' = '30d') {
    const supabase = createAdminClient()
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
        .from('transactions')
        .select('created_at, amount')
        .eq('status', 'success')
        .is('student_id', null)
        .gte('created_at', startDate)
        .order('created_at', { ascending: true })

    if (error) return { success: false, error: error.message }

    // 1. Group by date
    const grouped = data?.reduce((acc: any, curr: any) => {
        const date = curr.created_at.split('T')[0]
        acc[date] = (acc[date] || 0) + (Number(curr.amount) || 0)
        return acc
    }, {})

    // 2. Fill in gaps to ensure a smooth chart line
    const chartData = []
    const now = new Date()
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        
        chartData.push({
            date: dateStr,
            amount: grouped[dateStr] || 0
        })
    }

    return { success: true, data: chartData }
}

export async function adjustSmsBalance(tenantId: string, amount: number, reason: string) {
    const supabase = createAdminClient()

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

export async function toggleTenantActiveStatus(tenantId: string, currentStatus: boolean) {
    const supabase = createAdminClient()
    const newStatus = !currentStatus
    
    const { data, error } = await supabase
        .from('tenants')
        .update({ is_active: newStatus })
        .eq('id', tenantId)
        .select('is_active')
        .single()

    if (error) return { success: false, error: error.message }

    revalidatePath('/super-admin')
    return { success: true, newStatus: data.is_active }
}
