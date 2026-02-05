import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * Platinum Handshake Endpoint
 * - Verifies subdomain
 * - Creates Tenant
 * - Links Profile
 * - Syncs JWT Claims
 */
export async function POST(request: Request) {
    try {
        const { schoolName, subdomain, tierId } = await request.json()
        const supabase = createClient()

        // 1. Auth Check
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 })
        }

        // 2. Global Registry Check (Subdomain uniqueness)
        const { data: existing } = await supabase
            .from('tenants')
            .select('id')
            .eq('slug', subdomain)
            .single()

        if (existing) {
            return NextResponse.json({ error: "Subdomain already registered" }, { status: 409 })
        }

        // 3. Provision Tenant
        const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .insert({
                name: schoolName,
                slug: subdomain,
                type: 'school',
                subscription_tier: tierId || 'starter',
                is_active: true,
                sms_balance: 0,
                pilot_ends_at: tierId === 'pilot'
                    ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
                    : null,
                theme_config: {
                    primary: '#00F5FF',
                    bg: '#0A0A0B'
                }
            })
            .select()
            .single()

        if (tenantError) {
            return NextResponse.json({ error: tenantError.message }, { status: 500 })
        }

        // 4. Link & Elevate Profile
        // This will trigger the JWT sync via the on_profile_update_jwt_sync trigger
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                tenant_id: tenant.id,
                role: 'admin'
            })
            .eq('id', user.id)

        if (profileError) {
            return NextResponse.json({ error: "Failed to elevate profile" }, { status: 500 })
        }

        // 5. Success - Return redirect path
        return NextResponse.json({
            success: true,
            tenantId: tenant.id,
            subdomain: tenant.slug,
            redirectUrl: `/${tenant.slug}/dashboard/admin?welcome=true`
        })

    } catch (error: any) {
        console.error("[Provisioning API Error]:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
