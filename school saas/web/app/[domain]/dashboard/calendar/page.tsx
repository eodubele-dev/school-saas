
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import {
    CalendarDays,
    clock,
    MapPin,
    Trophy,
    BookOpen,
    Plane
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { getActiveAcademicSession } from "@/lib/actions/academic"
import { getSchoolEvents, SchoolEvent } from "@/lib/actions/calendar"
import { AddToCalendarButton } from "./add-to-calendar"

export default async function CalendarPage({ params }: { params: { domain: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect(`/${params.domain}/login`)

    // Fetch Events & Active Session
    const [events, activeSessionRes] = await Promise.all([
        getSchoolEvents(),
        getActiveAcademicSession()
    ])

    const activeSession = activeSessionRes.success ? activeSessionRes.session : null

    // Determine Term Bounds (Live Data only, no fallback)
    const hasActiveSession = !!(activeSession?.start_date && activeSession?.end_date)
    const termStartDate = hasActiveSession ? new Date(activeSession!.start_date) : new Date()
    const termEndDate = hasActiveSession ? new Date(activeSession!.end_date) : new Date()
    const sessionName = activeSession?.session || ""
    const termName = activeSession?.term || ""

    const totalDays = (termEndDate.getTime() - termStartDate.getTime()) / (1000 * 3600 * 24)
    const daysPassed = (new Date().getTime() - termStartDate.getTime()) / (1000 * 3600 * 24)
    const progress = hasActiveSession ? Math.min(100, Math.max(0, (daysPassed / totalDays) * 100)) : 0
    const weeksLeft = hasActiveSession ? Math.ceil((totalDays - daysPassed) / 7) : 0


    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white glow-blue font-serif">School Calendar</h2>
                <p className="text-slate-400">Keep track of academic events, holidays, and activities.</p>
            </div>

            {/* Term Progress Card */}
            <Card className="bg-gradient-to-r from-slate-900 to-slate-950 border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <CardContent className="p-6 relative z-10">
                    {hasActiveSession ? (
                        <>
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Current Term Progress</h3>
                                    <p className="text-sm text-slate-400">{termName}, {sessionName}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-bold text-cyan-400">
                                        {weeksLeft > 0 ? weeksLeft : 0}
                                    </span>
                                    <span className="text-sm text-slate-500 ml-1">weeks left</span>
                                </div>
                            </div>
                            <Progress value={progress} className="h-2 bg-slate-800" indicatorClassName="bg-cyan-500" />
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-4 text-center">
                            <CalendarDays className="h-8 w-8 text-slate-600 mb-2" />
                            <h3 className="text-md font-medium text-slate-300">No Active Academic Session</h3>
                            <p className="text-xs text-slate-500 max-w-xs">
                                Please configure the active session and term in the Academic Setup to track term progress.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Vertical Timeline */}
            <div className="relative pl-6 md:pl-0">
                {/* Timeline Line (Mobile: Left, Desktop: Center optimization if needed, but keeping Left for consistent vertical flow as requested) */}
                <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/50 via-slate-700 to-transparent" />

                <div className="space-y-8">
                    {events.length > 0 ? events.map((event, index) => (
                        <TimelineItem key={event.id} event={event} index={index} />
                    )) : (
                        <div className="pl-12 py-10 text-slate-500 italic">
                            No upcoming events scheduled.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function TimelineItem({ event, index }: { event: SchoolEvent, index: number }) {
    const isHoliday = event.type === 'holiday'
    const isSports = event.type === 'sports'

    // Styling based on type
    const colorClass = isHoliday ? 'text-blue-400' : isSports ? 'text-amber-400' : 'text-cyan-400'
    const bgClass = isHoliday ? 'bg-blue-500/10 border-blue-500/20' : isSports ? 'bg-amber-500/10 border-amber-500/20' : 'bg-cyan-500/10 border-cyan-500/20'
    const iconBg = isHoliday ? 'bg-blue-500' : isSports ? 'bg-amber-500' : 'bg-cyan-500'

    const Icon = isHoliday ? Plane : isSports ? Trophy : BookOpen

    const date = new Date(event.start_date)
    const day = date.getDate()
    const month = date.toLocaleString('default', { month: 'short' })

    return (
        <div className="relative pl-8 md:pl-12 group">
            {/* Timeline Dot */}
            <div className={`absolute left-[-11px] top-0 h-6 w-6 rounded-full border-4 border-slate-950 ${iconBg} shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 group-hover:scale-110 transition-transform`} />

            {/* Content Card */}
            <div className={`rounded-xl p-5 border backdrop-blur-sm ${bgClass} hover:bg-opacity-20 transition-all duration-300`}>
                <div className="flex justify-between items-start gap-4">
                    <div className="flex gap-4">
                        {/* Date Box */}
                        <div className={`flex flex-col items-center justify-center h-14 w-14 rounded-lg bg-slate-950/50 border border-white/5 shrink-0`}>
                            <span className={`text-xs font-bold uppercase ${colorClass}`}>{month}</span>
                            <span className="text-xl font-bold text-white">{day}</span>
                        </div>

                        {/* Details */}
                        <div className="space-y-1">
                            <h4 className="text-lg font-bold text-white leading-tight">{event.title}</h4>
                            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
                                {event.description}
                            </p>
                            <div className="flex items-center gap-2 pt-2">
                                <Badge variant="outline" className={`text-[10px] capitalize ${colorClass} bg-transparent border-current opacity-60`}>
                                    {event.type}
                                </Badge>
                                {event.end_date && event.end_date !== event.start_date && (
                                    <span className="text-xs text-slate-500">
                                        - {new Date(event.end_date).getDate()} {new Date(event.end_date).toLocaleString('default', { month: 'short' })}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action */}
                    <AddToCalendarButton
                        title={event.title}
                        description={event.description}
                        startDate={event.start_date}
                        endDate={event.end_date}
                    />
                </div>
            </div>
        </div>
    )
}
