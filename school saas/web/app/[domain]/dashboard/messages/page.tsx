import { CommunicationDashboard } from "@/components/communication/communication-dashboard"
import { createClient } from "@/lib/supabase/server"
import { getClockInStatus } from "@/lib/actions/staff-clock-in"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function CommunicationPage({ params }: { params: { domain: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let role = 'parent'
    let profile: any = null
    if (user) {
        const { data: p } = await supabase
            .from('profiles')
            .select('role, tenant_id')
            .eq('id', user.id)
            .single()
        
        profile = p
        if (profile?.role) {
            role = profile.role.toLowerCase().trim()
        }
    }

    // Security Audit: Check Clock-In Status for Teachers/Staff
    const isTeacher = role === 'teacher' || role === 'staff'
    const isAdmin = ['admin', 'owner', 'super-admin'].includes(role)
    
    if (isTeacher) {
        const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', params.domain).single()
        const clockStatus = await getClockInStatus(undefined, tenant?.id)
        const isAuthorized = clockStatus.success && clockStatus.data?.clockedIn && clockStatus.data?.verified

        if (!isAuthorized) {
            return (
                <div className="h-full flex flex-col items-center justify-center p-4 sm:p-10 text-center min-h-[70vh]">
                    <div className="relative mb-6 sm:mb-8">
                        <div className="absolute inset-0 bg-blue-500 opacity-20 blur-[60px] rounded-full animate-pulse" />
                        <div className="relative bg-slate-900/50 border border-white/10 p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] backdrop-blur-3xl shadow-2xl">
                            <Lock className="h-12 w-12 sm:h-16 sm:w-16 text-blue-500" />
                        </div>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter mb-3 sm:mb-4 uppercase italic">
                        Communications <span className="text-blue-500">Locked</span>
                    </h2>
                    <p className="max-w-md text-slate-400 text-base sm:text-lg font-medium leading-relaxed mb-8 sm:mb-10">
                        Institutional broadcasting and messaging are restricted to <strong>Active Duty</strong> staff. Please clock in to proceed.
                    </p>
                    <div className="flex gap-4">
                        <a href={`/${params.domain}/dashboard/attendance`}>
                            <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 sm:px-8 h-11 sm:h-12 rounded-full shadow-lg shadow-blue-500/20 transition-all text-sm sm:text-base">
                                Go to Clock-In
                            </Button>
                        </a>
                    </div>
                </div>
            )
        }
    }

    return (
        <div className="p-6">
            <CommunicationDashboard initialRole={role} />
        </div>
    )
}
