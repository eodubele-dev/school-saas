import { createClient } from "@/lib/supabase/server"
import { Calendar as CalendarIcon, Clock, MapPin, User, ArrowRight, Zap, Book } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default async function SchedulePage({ params }: { params: { domain: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div className="p-8 text-white font-mono uppercase tracking-widest animate-pulse">Scanning Bio-Metrics... Access Denied</div>

    // Fetch User Profile & Timetable
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, role, tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile) return <div className="p-8 text-white font-mono uppercase tracking-widest text-red-500">Critical Error: Profile Record Corrupted</div>

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })

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

    const { data: schedule } = await query

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section: Cyber Protocol */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-8">
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] mb-2">
                        <div className="h-1 w-6 bg-cyan-500 rounded-full" />
                        Time-Slot Allocation Protocol
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-white">My Schedule</h1>
                    <p className="text-slate-400 text-sm mt-1 max-w-md font-medium">
                        Real-time synchronization of academic operations and faculty availability.
                    </p>
                </div>

                <Link
                    href="/dashboard/calendar"
                    className="flex items-center gap-6 px-6 py-3 bg-slate-900/40 border border-white/10 rounded-2xl backdrop-blur-xl transition-all hover:bg-slate-900/60 hover:border-cyan-500/30 group/cal"
                >
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Active_Timeline</span>
                        <span className="text-sm font-bold text-white uppercase tracking-tight">{today}</span>
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,245,255,0.1)] group-hover/cal:border-cyan-500 group-hover/cal:shadow-[0_0_20px_rgba(0,245,255,0.2)] transition-all">
                        <CalendarIcon className="h-5 w-5 text-cyan-400" />
                    </div>
                </Link>
            </div>

            {/* Grid: Matrix View */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
                {days.map(day => {
                    const classes = schedule?.filter((s: any) => s.day_of_week === day) || []
                    const isToday = today === day

                    return (
                        <div
                            key={day}
                            className={cn(
                                "flex flex-col transition-all duration-500",
                                isToday ? "scale-[1.02] z-10" : "opacity-70 hover:opacity-100"
                            )}
                        >
                            {/* Day Header */}
                            <div className={cn(
                                "flex items-center gap-3 mb-4 px-2 py-1 rounded-lg transition-colors",
                                isToday ? "bg-cyan-500/10" : ""
                            )}>
                                <span className={cn(
                                    "text-sm font-black uppercase tracking-widest",
                                    isToday ? "text-cyan-400" : "text-slate-500"
                                )}>
                                    {day}
                                </span>
                                {isToday && <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(0,245,255,1)]" />}
                            </div>

                            {/* Class Stack */}
                            <div className="space-y-4">
                                {classes.length === 0 ? (
                                    <div className="group relative overflow-hidden rounded-2xl border border-dashed border-white/5 bg-slate-900/20 p-8 flex flex-col items-center justify-center text-center transition-all hover:bg-slate-900/40">
                                        <Zap className="h-4 w-4 text-slate-700 mb-2 group-hover:text-slate-500 transition-colors" />
                                        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-tighter">No Active Protocols</p>
                                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ) : (
                                    classes.map((cls: any) => (
                                        <div
                                            key={cls.id}
                                            className={cn(
                                                "group relative overflow-hidden bg-slate-900/80 border border-white/10 rounded-2xl p-4 transition-all hover:scale-[1.03] hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:border-cyan-500/30",
                                                isToday && "border-cyan-500/20 shadow-[0_8px_24px_rgba(0,245,255,0.05)]"
                                            )}
                                        >
                                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-30 transition-opacity">
                                                <Zap className="h-3 w-3 text-cyan-400" strokeWidth={3} />
                                            </div>

                                            <div className="flex items-center gap-2 mb-3">
                                                <Clock className="h-3 w-3 text-slate-500" />
                                                <span className="text-[10px] font-black font-mono text-white/80 bg-white/5 px-2 py-0.5 rounded-md border border-white/5 uppercase tracking-tighter">
                                                    {cls.start_time.slice(0, 5)} - {cls.end_time.slice(0, 5)}
                                                </span>
                                            </div>

                                            <h4 className="font-black text-white text-sm leading-tight tracking-tight mb-2 uppercase group-hover:text-cyan-400 transition-colors">
                                                {cls.subject?.name}
                                            </h4>

                                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="p-1 rounded bg-cyan-500/10 border border-cyan-500/20">
                                                        <Book className="h-2.5 w-2.5 text-cyan-400" />
                                                    </div>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{cls.class?.name}</span>
                                                </div>
                                                <ArrowRight className="h-3 w-3 text-slate-700 group-hover:text-cyan-500 transform group-hover:translate-x-1 transition-all" />
                                            </div>

                                            {/* Neon Accent Bar */}
                                            <div className={cn(
                                                "absolute left-0 top-0 bottom-0 w-1 transition-all duration-300",
                                                isToday ? "bg-cyan-500 shadow-[0_0_10px_rgba(0,245,255,0.5)]" : "bg-slate-800 group-hover:bg-cyan-500"
                                            )} />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Matrix Decorative Texture */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.02] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] z-[-1]" />
        </div>
    )
}
