import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Calendar, GraduationCap, Trophy, Clock } from "lucide-react"
import { MetricCard } from "./metric-card"
import { getActiveAcademicSession } from "@/lib/actions/academic"

export async function StudentDashboard() {
    const { session } = await getActiveAcademicSession()

    // Mock Data for now - to be replaced with real hook
    const stats = {
        attendance: 95,
        assignmentsPending: 2,
        upcomingExams: 1,
        gpa: 3.8
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white glow-text">My Dashboard</h2>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-slate-400">Welcome back! Here's your academic overview.</p>
                    {session && (
                        <span className="hidden md:inline-flex items-center rounded-md bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20">
                            {session.session} • {session.term}
                        </span>
                    )}
                </div>
            </div>

            {/* Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Attendance"
                    value={`${stats.attendance}%`}
                    icon={Clock}
                    description="This Term"
                    trend={{ value: "Excellent", positive: true }}
                />
                <MetricCard
                    title="Assignments"
                    value={stats.assignmentsPending.toString()}
                    icon={BookOpen}
                    description="Due Soon"
                />
                <MetricCard
                    title="Exams"
                    value={stats.upcomingExams.toString()}
                    icon={Calendar}
                    description="Next 7 Days"
                />
                <MetricCard
                    title="GPA"
                    value={stats.gpa.toString()}
                    icon={GraduationCap}
                    description="Cumulative"
                    trend={{ value: "+0.2", positive: true }}
                />
            </div>

            {/* Content Area Placeholder */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-slate-900/50 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-400" />
                            Today's Schedule
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 text-slate-400 text-sm">
                            <p>08:00 AM - Mathematics (Room 101)</p>
                            <p>10:00 AM - English Literature (Room 204)</p>
                            <p>12:00 PM - Lunch Break</p>
                            <p>01:00 PM - Physics (Lab 3)</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-400" />
                            Recent Achievements
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 text-slate-400 text-sm">
                            <p className="text-slate-300">No new awards this week.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
