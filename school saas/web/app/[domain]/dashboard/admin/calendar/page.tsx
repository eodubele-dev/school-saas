import { CalendarDays, AlertTriangle } from "lucide-react"
import { getSchoolEvents } from "@/lib/actions/calendar"
import { EventManager } from "@/components/admin/calendar/event-manager"

export default async function AdminCalendarPage() {
    const res: any = await getSchoolEvents()
    const events = res?.events || []
    const success = res?.success ?? true

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto min-h-screen">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <CalendarDays className="h-8 w-8 text-indigo-500" />
                    School Calendar Management
                </h1>
                <p className="text-slate-400">
                    Publish and manage term dates, holidays, and campus events for all students and staff.
                </p>
            </div>

            {!success ? (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-400">
                    <AlertTriangle className="h-6 w-6" />
                    <div>
                        <h3 className="font-bold text-red-300">Database Connection Error</h3>
                        <p className="text-sm">Failed to retrieve calendar events. Please contact system support.</p>
                    </div>
                </div>
            ) : (
                <EventManager initialEvents={events || []} />
            )}
        </div>
    )
}
