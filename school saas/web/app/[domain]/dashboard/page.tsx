import { createClient } from "@/lib/supabase/server"
import { BentoDashboardLoader } from "@/components/dashboard/bento-loader"
import { headers } from "next/headers"

export default async function DashboardPage({
    params,
    searchParams
}: {
    params: { domain: string }
    searchParams: { role?: string }
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
        .select('role, tenant_id, tenants(name)')
        .eq('id', user.id)
        .single()

    const appMeta = user.app_metadata || {}

    // Role: DB > JWT > URL Param
    let role = profile?.role || appMeta.role || searchParams.role

    // School Name: DB > JWT > Header
    // @ts-ignore - Supabase types for joins can be tricky
    let schoolName = profile?.tenants?.name || appMeta.schoolName || headers().get('x-school-name')

    let primaryColor = appMeta.primaryColor
    let tier = appMeta.subscriptionTier || 'starter'
    let isPilot = appMeta.isPilot || false
    let smsBalance = appMeta.smsBalance || 0

    // Redundant fallback block removed since we fetched DB above

    if (!schoolName) {
        // Fallback branding (or if middleware skipped it?)
        schoolName = domain.charAt(0).toUpperCase() + domain.slice(1)
    }

    return (
        <BentoDashboardLoader
            user={user}
            role={role || 'guest'}
            schoolName={schoolName || domain}
            primaryColor={primaryColor || '#00F5FF'}
            tier={tier}
            isPilot={isPilot}
            smsBalance={smsBalance}
            subdomain={domain}
        />
    )
}
