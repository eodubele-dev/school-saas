"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { logActivity } from "./audit"

/**
 * Transition the institution to a new subscription tier.
 * Handles the "ripple effect" via DB triggers to refresh all staff JWTs.
 */
export async function changeSubscriptionTier(targetTier: string) {
    const supabase = createClient()

    // 1. Authorization & Identity Verification
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Authentication required" }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, tenant_id')
        .eq('id', user.id)
        .single()

    if (profileError || !profile || profile.role !== 'admin') {
        return { success: false, error: "Authorization Failed: Only proprietors can modify institutional tiers." }
    }

    const tenantId = profile.tenant_id

    // Fetch current state for auditing
    const { data: tenant } = await supabase
        .from('tenants')
        .select('subscription_tier')
        .eq('id', tenantId)
        .single()

    const currentTier = (tenant?.subscription_tier || 'starter').toLowerCase()
    const normalizedTarget = targetTier.toLowerCase()

    if (currentTier === normalizedTarget) {
        return { success: true, message: "Instituiton is already on this tier." }
    }

    try {
        // 2. [Architecture] Mid-term Payment/Proration Logic
        // In production, this would initialize a Paystack/Monnify transaction
        // or verify a mid-term proration balance.

        // 3. Update Institutional Partitioning
        const updates: any = {
            subscription_tier: normalizedTarget,
            // Enable/Disable features based on tier if needed at tenant level
            // For now, these are generally controlled via JWT claims logic
        }

        // Special handling for Lagos Pilot
        if (normalizedTarget === 'pilot') {
            updates.pilot_ends_at = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        }

        const { error: updateError } = await supabase
            .from('tenants')
            .update(updates)
            .eq('id', tenantId)

        if (updateError) throw updateError

        // 4. Record to Forensic Audit Log
        await logActivity(
            'Financial',
            'SUBSCRIPTION_CHANGE',
            `Transitioned institutional tier from ${currentTier} to ${normalizedTarget}`,
            'tenant',
            tenantId,
            { old_tier: currentTier },
            { new_tier: normalizedTarget }
        )

        // 5. Trigger Real-time UI Sync
        revalidatePath('/', 'layout')
        revalidatePath('/[domain]', 'layout')

        return {
            success: true,
            message: `Access levels updated to ${targetTier}.`,
            isUpgrade: normalizedTarget === 'platinum' || (currentTier === 'starter' && normalizedTarget === 'pilot')
        }

    } catch (error: any) {
        console.error("[changeSubscriptionTier] Critical Failure:", error)
        return { success: false, error: "System failed to transition tier: " + error.message }
    }
}
