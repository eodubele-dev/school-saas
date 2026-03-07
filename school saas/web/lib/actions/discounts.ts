'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface DiscountRule {
    id: string
    tenant_id: string
    name: string
    description: string | null
    trigger_count: number
    discount_type: 'percentage' | 'flat'
    discount_value: number
    target_rule: 'cheapest_child' | 'all_after_trigger' | 'all_children'
    is_active: boolean
    created_at: string
}

export type CreateDiscountRuleData = Omit<DiscountRule, 'id' | 'tenant_id' | 'created_at'>

export async function getDiscountRules() {
    const supabase = createClient()

    // Auth and Tenant ID check
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
        return { success: false, error: 'Unauthorized' }
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', userData.user.id)
        .single()

    if (!profile?.tenant_id) {
        return { success: false, error: 'Tenant not found' }
    }

    const { data, error } = await supabase
        .from('tenant_discount_rules')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching discount rules:", error)
        return { success: false, error: error.message }
    }

    return { success: true, data: data as DiscountRule[] }
}

export async function createDiscountRule(ruleData: CreateDiscountRuleData) {
    const supabase = createClient()

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData?.user) {
        return { success: false, error: 'Unauthorized' }
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id, role')
        .eq('id', userData.user.id)
        .single()

    if (!profile?.tenant_id || !['admin', 'superadmin', 'bursar'].includes(profile.role)) {
        return { success: false, error: 'Unauthorized or Tenant not found' }
    }

    const { data, error } = await supabase
        .from('tenant_discount_rules')
        .insert({
            ...ruleData,
            tenant_id: profile.tenant_id
        })
        .select()
        .single()

    if (error) {
        console.error("Error creating discount rule:", error)
        return { success: false, error: error.message }
    }

    revalidatePath('/[domain]/dashboard/bursar/config')
    return { success: true, data: data as DiscountRule }
}

export async function toggleDiscountRule(id: string, is_active: boolean) {
    const supabase = createClient()

    // Auth Check
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
        .from('tenant_discount_rules')
        .update({ is_active })
        .eq('id', id)

    if (error) {
        console.error("Error toggling discount rule:", error)
        return { success: false, error: error.message }
    }

    revalidatePath('/[domain]/dashboard/bursar/config')
    return { success: true }
}

export async function deleteDiscountRule(id: string) {
    const supabase = createClient()

    // Auth Check
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
        .from('tenant_discount_rules')
        .delete()
        .eq('id', id)

    if (error) {
        console.error("Error deleting discount rule:", error)
        return { success: false, error: error.message }
    }

    revalidatePath('/[domain]/dashboard/bursar/config')
    return { success: true }
}
