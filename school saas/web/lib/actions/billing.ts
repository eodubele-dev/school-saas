"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function upgradeTenantTier(tier: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    // Get current tenant from user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id, role')
        .eq('id', user.id)
        .single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'owner')) {
        return { success: false, error: "Unauthorized access" }
    }

    // Update tenant tier
    const { error } = await supabase
        .from('tenants')
        .update({ tier: tier.toLowerCase() })
        .eq('id', profile.tenant_id)

    if (error) {
        console.error("[upgradeTenantTier] Error updating tier:", error)
        return { success: false, error: error.message }
    }

    // Log the event
    await supabase.from('audit_logs').insert({
        tenant_id: profile.tenant_id,
        actor_id: user.id,
        action: 'UPGRADE_TIER',
        category: 'System',
        entity_type: 'TENANT',
        entity_id: profile.tenant_id,
        metadata: { new_tier: tier }
    })

    revalidatePath('/', 'layout')

    return { success: true }
}
