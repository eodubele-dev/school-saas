import { createClient } from "@/lib/supabase/server"
import { Calendar as CalendarIcon, Clock, MapPin, User } from "lucide-react"

export default async function SchedulePage({ params }: { params: { domain: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Please log in</div>

    // Fetch User Profile & Timetable
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, role, tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile) return <div>Profile not found</div>

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

    // Fetch all classes for the week
    let query = supabase
        .from('timetables')
        .select(`
            id,
            day_of_week,
            start_time,
            end_time,
            subject:subjects(name, code),
            class:classes(name)
        `)
        .eq('tenant_id', profile.tenant_id)
        .order('start_time', { ascending: true })

    if (profile.role === 'teacher') {
        query = query.eq('teacher_id', profile.id)
    }
    // If student, logic is needed (skipped for now as per minimal implementation)

    const { data: schedule } = await query

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">My Schedule</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your weekly classes and timetable.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {days.map(day => {
                    const classes = schedule?.filter((s: any) => s.day_of_week === day) || []
                    const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day

                    return (
                        <div key={day} className={`space-y-3 ${isToday ? 'bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-2 -m-2' : ''}`}>
                            <h3 className={`font-semibold text-sm ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                {day}
                            </h3>

                            <div className="space-y-3">
                                {classes.length === 0 ? (
                                    <div className="h-24 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-400">
                                        No classes
                                    </div>
                                ) : (
                                    classes.map((cls: any) => (
                                        <div key={cls.id} className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-sm hover:shadow-md hover:border-blue-500/50 transition-all">
                                            <div className="flex items-start justify-between mb-2">
                                                <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                    {cls.start_time.slice(0, 5)} - {cls.end_time.slice(0, 5)}
                                                </span>
                                            </div>
                                            <h4 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                                                {cls.subject?.name}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" /> {cls.class?.name}
                                                </span>
                                            </div>
                                            {/* Accent Bar */}
                                            <div className="absolute left-0 top-3 bottom-3 w-1 bg-blue-500 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
