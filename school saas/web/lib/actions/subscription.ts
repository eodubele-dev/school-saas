'use server'
// Sync ID: 2026-04-20-SYNC-FORCE

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

/**
 * Upgrade a tenant's plan from within the dashboard.
 * Requires a verified Paystack transaction.
 */
export async function upgradeTenantPlan(data: {
    plan: string,
    transactionReference: string,
    subdomain: string
}) {
    console.log('[upgradeTenantPlan] START for:', data.subdomain, 'to', data.plan)
    
    try {
        const adminClient = createAdminClient()
        
        // --- 1. VERIFY PAYMENT ---
        const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
        if (!SECRET_KEY) throw new Error("PAYSTACK_CONFIG_ERROR: Platform secret key is missing.")

        const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${data.transactionReference}`, {
            headers: { Authorization: `Bearer ${SECRET_KEY}` }
        })
        
        const verifyData = await verifyRes.json()
        
        if (!verifyRes.ok || !verifyData.status || verifyData.data.status !== 'success') {
            throw new Error("PAYMENT_VERIFICATION_FAILED: The provided transaction could not be verified.")
        }

        // Verify amount (Naira to Kobo)
        const paidAmount = verifyData.data.amount / 100
        const expectedAmount = data.plan === 'starter' ? 20000
                            : data.plan === 'professional' ? 50000
                            : data.plan === 'platinum' ? 150000
                            : 0
        
        if (paidAmount < expectedAmount) {
            throw new Error(`INSUFFICIENT_PAYMENT: Expected ₦${expectedAmount}, but received ₦${paidAmount}.`)
        }

        // --- 2. IDENTIFY TENANT ---
        const { data: tenant, error: tenantError } = await adminClient
            .from('tenants')
            .select('id, theme_config')
            .eq('slug', data.subdomain)
            .single()

        if (tenantError || !tenant) {
            throw new Error("TENANT_NOT_FOUND: The specified school domain does not exist.")
        }

        // --- 3. UPDATE TENANT RECORD ---
        // Calculate SMS Units if upgrading to a plan that includes initial credit (e.g., Pilot)
        let smsCredit = 0
        if (data.plan === 'pilot') {
            smsCredit = 2000 // ₦10,000 / ₦5.00
        }

        const { error: updateError } = await adminClient
            .from('tenants')
            .update({
                subscription_tier: data.plan,
                is_active: true,
                sms_balance: (Number((tenant as any).sms_balance) || 0) + smsCredit,
                pilot_ends_at: data.plan === 'pilot'
                    ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
                    : null,
                theme_config: {
                    ...(tenant.theme_config as any),
                    features: {
                        ...((tenant.theme_config as any)?.features || {}),
                        ai_enabled: data.plan === 'platinum' || data.plan === 'pilot'
                    }
                }
            })
            .eq('id', tenant.id)

        if (updateError) {
            throw new Error("PLAN_UPDATE_FAILED: " + updateError.message)
        }

        console.log('[upgradeTenantPlan] SUCCESS. Revalidating paths.')
        revalidatePath(`/${data.subdomain}/admin/settings/pricing`)
        
        return { success: true, message: `Plan successfully upgraded to ${data.plan}.` }

    } catch (error: any) {
        console.error("Plan Upgrade Error:", error)
        return { success: false, error: error.message || "An internal error occurred during the upgrade." }
    }
}

/**
 * Modernized version of the legacy changeSubscriptionTier. 
 * Resolves tenant from user context if not explicitly provided.
 */
export async function changeSubscriptionTier(plan: string, transactionReference?: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile?.tenant_id) return { success: false, error: "Tenant context missing" }

    // Resolve subdomain (slug)
    const { data: tenant } = await createAdminClient().from('tenants').select('slug').eq('id', profile.tenant_id).single()
    if (!tenant) return { success: false, error: "Tenant not found" }

    if (!transactionReference) {
        return { success: false, error: "PAYMENT_REQUIRED: Reference missing." }
    }

    return await upgradeTenantPlan({
        plan,
        transactionReference,
        subdomain: tenant.slug
    })
}
