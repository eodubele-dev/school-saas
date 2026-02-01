import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BursarDashboard } from "@/components/dashboard/bursar-dashboard"
import { getBursarStats } from "@/lib/actions/finance"

export default async function BursarDashboardPage({ params }: { params: { domain: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect(`/${params.domain}/login`)

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!['admin', 'bursar'].includes(profile?.role)) {
        return <div className="p-8 text-center text-red-500">Access Denied: Bursar only.</div>
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
