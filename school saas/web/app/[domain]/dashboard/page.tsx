import { createClient } from "@/lib/supabase/server"
import { BentoDashboardLoader } from "@/components/dashboard/bento-loader"
import { headers } from "next/headers"

export default async function DashboardPage({
    params,
    searchParams
}: {
    params: { domain: string }
    searchParams: { role?: string, studentId?: string }
}) {
    const { domain } = params
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        // Should be handled by middleware, but safe guard
        return <div className="p-8 text-white">Access Denied: Please log in.</div>
    }

    // Platinum Optimization: Prioritize DB for Critical Data (Freshness), Fallback to JWT
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, tenant_id, tenants(name, logo_url, theme_config, sms_balance)')
        .eq('id', user.id)
        .single()

    const appMeta = user.app_metadata || {}

    // @ts-ignore - Supabase type joins
    const tenantData: any = profile?.tenants
    
    // Role: URL Param (Debug) > DB > JWT
    let role = searchParams.role || profile?.role || appMeta.role

    // School Branding: DB > JWT > Header
    let schoolName = tenantData?.name || appMeta.schoolName || headers().get('x-school-name')
    let logoUrl = tenantData?.logo_url || appMeta.logoUrl
    let primaryColor = tenantData?.theme_config?.primary || appMeta.primaryColor
    let smsBalance = tenantData?.sms_balance || 0

    const tier = tenantData?.theme_config?.subscription_tier || appMeta.subscriptionTier || 'starter'

    return (
        <BentoDashboardLoader
            user={user}
            role={role || 'guest'}
            schoolName={schoolName || domain}
            logoUrl={logoUrl}
            primaryColor={primaryColor || "#06b6d4"}
            smsBalance={smsBalance}
            subdomain={domain}
            studentId={searchParams.studentId}
            tier={tier}
        />
    )
}
