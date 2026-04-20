'use server'

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
        const newThemeConfig = {
            ...(tenant.theme_config as object),
            subscription_tier: data.plan,
            is_active: true,
            features: {
                ...((tenant.theme_config as any)?.features || {}),
                ai_enabled: data.plan === 'platinum'
            }
        }

        const { error: updateError } = await adminClient
            .from('tenants')
            .update({
                theme_config: newThemeConfig
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
