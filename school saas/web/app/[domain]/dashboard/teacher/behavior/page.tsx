import { BehaviorTabs } from "@/components/teacher/behavior/behavior-tabs"
import { createClient } from "@/lib/supabase/server"
import { getTeacherClasses } from "@/lib/actions/attendance"
import { getClockInStatus } from "@/lib/actions/staff-clock-in"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

async function getStudents() {
    const supabase = createClient()
    const { success, data: classes } = await getTeacherClasses()
    
    if (!success || !classes || classes.length === 0) return []
    
    const classIds = classes.map(c => c.id)

    const { data } = await supabase
        .from('students')
        .select('*')
        .in('class_id', classIds)
        .order('full_name')
        
    return data || []
}

export default async function BehaviorManagerPage({ params }: { params: { domain: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Security Audit: Check Clock-In Status & Admin Override
    const [{ data: profile }, { data: tenant }] = await Promise.all([
        supabase.from('profiles').select('role, tenant_id').eq('id', user?.id).single(),
        supabase.from('tenants').select('id').eq('slug', params.domain).single()
    ])

    const isAdmin = ['admin', 'owner', 'super-admin'].includes(profile?.role || '')
    const clockStatus = await getClockInStatus(undefined, tenant?.id)
    const isAuthorized = isAdmin || (clockStatus.success && clockStatus.data?.clockedIn && clockStatus.data?.verified)

    if (!isAuthorized) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-4 sm:p-10 text-center min-h-[70vh]">
                <div className="relative mb-6 sm:mb-8">
                    <div className="absolute inset-0 bg-amber-500 opacity-20 blur-[60px] rounded-full animate-pulse" />
                    <div className="relative bg-slate-900/50 border border-white/10 p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] backdrop-blur-3xl shadow-2xl">
                        <Lock className="h-12 w-12 sm:h-16 sm:w-16 text-amber-500" />
                    </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter mb-3 sm:mb-4 uppercase italic">
                    Access <span className="text-amber-500">Restricted</span>
                </h2>
                <p className="max-w-md text-slate-400 text-base sm:text-lg font-medium leading-relaxed mb-8 sm:mb-10">
                    You must be actively <strong>Clocked In</strong> on school premises to manage student behavior and evaluations.
                </p>
                <div className="flex gap-4">
                    <a href={`/${params.domain}/dashboard/attendance`}>
                        <Button className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 sm:px-8 h-11 sm:h-12 rounded-full text-sm sm:text-base">
                            Go to Clock-In
                        </Button>
                    </a>
                </div>
            </div>
        )
    }

    const students = await getStudents()

    return (
        <div className="p-3 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto min-h-screen bg-slate-950">
            <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">Behavior & Awards Manager</h1>
                <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">Recognize excellence, track incidents, and process end-of-term evaluations.</p>
            </div>

            <BehaviorTabs students={students} />
        </div>
    )
}
