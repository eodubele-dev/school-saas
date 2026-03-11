import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BursarDashboard } from "@/components/dashboard/bursar-dashboard"
import { getBursarStats } from "@/lib/actions/finance"

export default async function BursarDashboardPage({ params }: { params: { domain: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect(`/${params.domain}/login`)

    const [{ data: profile }, { data: permission }] = await Promise.all([
        supabase.from('profiles').select('role, tenant_id').eq('id', user.id).single(),
        supabase.from('staff_permissions').select('can_view_financials').eq('staff_id', user.id).single()
    ])

    const hasAccess = ['admin', 'bursar', 'owner'].includes(profile?.role) || permission?.can_view_financials

    if (!hasAccess) {
        return (
            <div className="p-8 text-center text-red-500">
                Access Denied: Bursar only. <br />
                <span className="text-xs text-slate-500">Current Role: {profile?.role || 'None'}</span>
            </div>
        )
    }

    const stats = await getBursarStats()

    if (!stats) {
        return <div className="p-8 text-center text-slate-400">Unable to load bursar statistics.</div>
    }

    return (
        <div className="bg-slate-950 min-h-screen p-6">
            <BursarDashboard stats={stats} />
        </div>
    )
}
