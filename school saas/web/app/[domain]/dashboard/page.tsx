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

    // Platinum Optimization: Try to read from JWT app_metadata first
    const appMeta = user.app_metadata || {}
    let role = appMeta.role || searchParams.role
    let schoolName = appMeta.schoolName
    let primaryColor = appMeta.primaryColor

    // Middleware might have injected headers if DB lookup happened there
    const headerList = headers()
    if (!schoolName) schoolName = headerList.get('x-school-name')

    // Fallback: If metadata missing (legacy session), fetch from DB
    if (!role) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
        role = profile?.role
    }

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
        />
    )
}
