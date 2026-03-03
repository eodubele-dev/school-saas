import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Activity } from "lucide-react"
import { getHealthDashboardData } from "@/lib/actions/health"
import { HealthDashboardClient } from "@/components/health/health-dashboard"

export const metadata = {
    title: "Health & Infirmary | EduFlow",
    description: "Manage student health records and medical incidents limit.",
}

export default async function AdminHealthPage() {
    const supabase = createClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    // Ensure only Admin, Owner, and Staff can access
    const role = profile?.role
    if (role !== 'admin' && role !== 'owner' && role !== 'staff') {
        redirect('/dashboard')
    }

    const initialData = await getHealthDashboardData()

    return (
        <div className="flex-1 space-y-8 p-6 lg:p-8 bg-[#020817] min-h-screen text-slate-200 font-sans selection:bg-indigo-500/30">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <Activity className="h-5 w-5 text-indigo-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            Health & Infirmary
                        </h1>
                    </div>
                    <p className="text-slate-400 max-w-2xl">
                        Manage medical incidents and critical student wellbeing profiles.
                    </p>
                </div>
            </div>

            <HealthDashboardClient initialData={initialData} />
        </div>
    )
}
