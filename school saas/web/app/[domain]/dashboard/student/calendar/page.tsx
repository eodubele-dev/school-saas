import { getSchoolEvents } from "@/lib/actions/calendar"
import { EventList } from "@/components/student/calendar/event-list"
import { CalendarDays, Clock } from "lucide-react"

export default async function StudentCalendarPage() {
    const events = await getSchoolEvents()

    // Sort already happens in action, but good to be safe if mixed
    const sortedEvents = events || []

    // Find next event
    const now = new Date()
    const upcomingEvents = sortedEvents.filter(e => new Date(e.start_date) >= now)
    const nextEvent = upcomingEvents[0]

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto min-h-screen bg-slate-950">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <CalendarDays className="h-8 w-8 text-purple-500" />
                    School Calendar
                </h1>
                <p className="text-slate-400">Upcoming exams, holidays, and important dates.</p>
            </div>

            {nextEvent && (
                <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border border-purple-500/20 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <span className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-2 block">Next Up</span>
                            <h2 className="text-2xl font-bold text-white mb-1">{nextEvent.title}</h2>
                            <p className="text-purple-200/60 text-sm max-w-lg">{nextEvent.description}</p>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-950/30 p-3 rounded-xl backdrop-blur-sm border border-white/5">
                            <div className="text-center">
                                <span className="text-2xl font-bold text-white block leading-none">
                                    {new Date(nextEvent.start_date).getDate()}
                                </span>
                                <span className="text-[10px] text-purple-300 uppercase">
                                    {new Date(nextEvent.start_date).toLocaleString('default', { month: 'short' })}
                                </span>
                            </div>
                            <div className="h-8 w-px bg-white/10" />
                            <div className="flex items-center gap-2 text-sm text-purple-100">
                                <Clock className="h-4 w-4" />
                                <span>
                                    {Math.ceil((new Date(nextEvent.start_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))} Days left
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <EventList events={sortedEvents} />
        </div>
    )
}
