import { CalendarDays, Clock, MapPin } from "lucide-react"
import { getActiveAcademicSession } from "@/lib/actions/academic"
import { createClient } from "@/lib/supabase/server"
import { resolveStudentForUser } from "@/lib/actions/assignments"

async function getWeeklySchedule() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return []

    const student = await resolveStudentForUser(supabase, user.id, profile.tenant_id)
    if (!student || !student.class_id) return []

    const { data: schedule } = await supabase
        .from('timetables')
        .select(`
            id,
            day_of_week,
            start_time,
            end_time,
            subjects(name),
            profiles(full_name)
        `)
        .eq('tenant_id', profile.tenant_id)
        .eq('class_id', student.class_id)
        .order('start_time', { ascending: true })

    return schedule || []
}

export default async function StudentTimetablePage() {
    const { session } = await getActiveAcademicSession()
    const rawSchedule = await getWeeklySchedule()

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

    // Group by day
    const categorizedSchedule = days.reduce((acc, day) => {
        acc[day] = rawSchedule.filter((item: any) => item.day_of_week === day)
        return acc
    }, {} as Record<string, any[]>)

    const formatTime = (timeStr: string) => {
        if (!timeStr) return ''
        const [hours, minutes] = timeStr.split(':')
        const h = parseInt(hours)
        const ampm = h >= 12 ? 'PM' : 'AM'
        const h12 = h % 12 || 12
        return `${h12}:${minutes} ${ampm}`
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen bg-slate-950 space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <CalendarDays className="h-8 w-8 text-blue-500" />
                        Class Timetable
                    </h1>
                    <p className="text-slate-400">Your weekly academic schedule.</p>
                </div>
                {session && (
                    <div className="text-right hidden md:block">
                        <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Current Session</span>
                        <span className="font-mono text-xl text-white font-bold">{session.session} / {session.term}</span>
                    </div>
                )}
            </div>

            {rawSchedule.length === 0 ? (
                <div className="bg-slate-900 border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center">
                    <div className="h-20 w-20 bg-slate-800 rounded-full flex flex-col items-center justify-center mb-4">
                        <Clock className="h-8 w-8 text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Schedule Found</h3>
                    <p className="text-slate-400 max-w-sm">
                        It looks like your class timetable hasn't been published for the current term yet. Hold tight!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                    {days.map((day) => (
                        <div key={day} className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden flex flex-col">
                            <div className="bg-slate-900 p-4 border-b border-white/5 flex items-center justify-between">
                                <h3 className="font-bold text-white">{day}</h3>
                                <div className="text-xs font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
                                    {categorizedSchedule[day].length} Classes
                                </div>
                            </div>

                            <div className="p-4 flex-1 space-y-3">
                                {categorizedSchedule[day].length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-600 italic text-sm py-8">
                                        Free Day
                                    </div>
                                ) : (
                                    categorizedSchedule[day].map((item: any) => {
                                        const subjectName = Array.isArray(item.subjects) ? item.subjects[0]?.name : (item.subjects as any)?.name
                                        const teacherName = Array.isArray(item.profiles) ? item.profiles[0]?.full_name : (item.profiles as any)?.full_name

                                        return (
                                            <div key={item.id} className="bg-slate-950 border border-white/5 p-3 rounded-xl hover:border-blue-500/30 transition-colors group">
                                                <div className="text-xs font-bold text-blue-400 mb-1 font-mono">
                                                    {formatTime(item.start_time)} - {formatTime(item.end_time)}
                                                </div>
                                                <div className="font-bold text-white mb-2 group-hover:text-blue-200 transition-colors">
                                                    {subjectName || 'General Class'}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                    <span className="h-4 w-4 rounded bg-slate-800 flex items-center justify-center text-[8px]">👨‍🏫</span>
                                                    <span className="truncate">{teacherName || 'Staff'}</span>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
