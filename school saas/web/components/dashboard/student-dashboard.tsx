import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Calendar, GraduationCap, Trophy, Clock } from "lucide-react"
import { getActiveAcademicSession } from "@/lib/actions/academic"
import { getStudentMetrics, getExamReadiness, getTodaySchedule } from "@/lib/actions/student-dashboard"
import { getStudentAssignments } from "@/lib/actions/assignments"

export async function StudentDashboard() {
    const { session } = await getActiveAcademicSession()

    // 1. Fetch Dynamic Real Data
    const [metricsData, readinessData, assignmentsData, scheduleData] = await Promise.all([
        getStudentMetrics(),
        getExamReadiness(),
        getStudentAssignments(),
        getTodaySchedule()
    ])

    const stats = {
        attendance: metricsData.success && metricsData.metrics ? metricsData.metrics.attendancePct : 100,
        assignmentsPending: assignmentsData.success && assignmentsData.data
            ? assignmentsData.data.filter((a: any) => a.status === 'pending').length
            : 0,
        upcomingExams: readinessData.success && readinessData.history ? readinessData.history.length : 0, // Fallback counting attempts
        gpa: metricsData.success && metricsData.metrics ? metricsData.metrics.average : 0,
        rank: metricsData.success && metricsData.metrics ? metricsData.metrics.rank : 0,
        totalStudents: metricsData.success && metricsData.metrics ? metricsData.metrics.totalStudents : 0,
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
                {/* 1. Attendance */}
                <Card className="p-4 relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-900 border-none shadow-[0_0_40px_rgba(16,185,129,0.15)] group hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all duration-500">
                    <div className="absolute top-1/2 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -translate-y-1/2 transition-transform group-hover:scale-150 duration-700" />
                    <div className="flex flex-col gap-3 relative z-10">
                        <div className="flex justify-between items-start">
                            <p className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider opacity-80">Attendance</p>
                            <div className="h-8 w-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center shadow-inner border border-white/10">
                                <Clock className="h-4 w-4 text-emerald-100 drop-shadow-md" />
                            </div>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-white drop-shadow-sm">{stats.attendance}%</p>
                            <p className="text-xs text-emerald-200/70 mt-1">This Term</p>
                        </div>
                    </div>
                </Card>

                {/* 2. Assignments */}
                <Card className="p-4 relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-900 border-none shadow-[0_0_40px_rgba(37,99,235,0.15)] group hover:shadow-[0_0_40px_rgba(37,99,235,0.3)] transition-all duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
                    <div className="flex flex-col gap-3 relative z-10">
                        <div className="flex justify-between items-start">
                            <p className="text-[10px] text-blue-100 font-bold uppercase tracking-wider opacity-80">Assignments</p>
                            <div className="h-8 w-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center shadow-inner border border-white/10">
                                <BookOpen className="h-4 w-4 text-blue-100 drop-shadow-md" />
                            </div>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-white drop-shadow-sm">{stats.assignmentsPending}</p>
                            <p className="text-xs text-blue-200/70 mt-1">Due Soon</p>
                        </div>
                    </div>
                </Card>

                {/* 3. Average/Rank */}
                <Card className="p-4 relative overflow-hidden bg-gradient-to-br from-fuchsia-600 to-purple-900 border-none shadow-[0_0_40px_rgba(192,38,211,0.15)] group hover:shadow-[0_0_40px_rgba(192,38,211,0.3)] transition-all duration-500">
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -ml-16 -mb-16 transition-transform group-hover:scale-150 duration-700" />
                    <div className="flex flex-col gap-3 relative z-10">
                        <div className="flex justify-between items-start">
                            <p className="text-[10px] text-fuchsia-100 font-bold uppercase tracking-wider opacity-80">Average</p>
                            <div className="h-8 w-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center shadow-inner border border-white/10">
                                <GraduationCap className="h-4 w-4 text-fuchsia-100 drop-shadow-md" />
                            </div>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-white drop-shadow-sm">{stats.gpa}%</p>
                            <p className="text-xs text-fuchsia-200/70 mt-1">Rank: {stats.rank > 0 ? stats.rank : 'N/A'}/{stats.totalStudents}</p>
                        </div>
                    </div>
                </Card>

                {/* 4. Exams */}
                <Card className="p-4 relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-900 border-none shadow-[0_0_40px_rgba(245,158,11,0.15)] group hover:shadow-[0_0_40px_rgba(245,158,11,0.3)] transition-all duration-500">
                    <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/10 rounded-full blur-2xl -ml-16 -translate-y-1/2 transition-transform group-hover:scale-150 duration-700" />
                    <div className="flex flex-col gap-3 relative z-10">
                        <div className="flex justify-between items-start">
                            <p className="text-[10px] text-amber-100 font-bold uppercase tracking-wider opacity-80">CBT Taken</p>
                            <div className="h-8 w-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center shadow-inner border border-white/10">
                                <Trophy className="h-4 w-4 text-amber-100 drop-shadow-md" />
                            </div>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-white drop-shadow-sm">{stats.upcomingExams}</p>
                            <p className="text-xs text-amber-200/70 mt-1">Assessments</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Content Area */}
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
                            {scheduleData.success && scheduleData.schedule && scheduleData.schedule.length > 0 ? (
                                scheduleData.schedule.map((item: any, i: number) => (
                                    <div key={i} className="flex flex-col border-l-2 border-blue-500/50 pl-3">
                                        <p className="font-semibold text-white">{item.time}</p>
                                        <p>{item.subject} • {item.teacher}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500 italic py-2">No classes scheduled for today.</p>
                            )}
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
                            {/* Assuming Exam Readiness or Grades for achievements later. Empty state for now. */}
                            {readinessData.success && readinessData.history && readinessData.history.length > 0 ? (
                                <div className="flex items-start gap-3 bg-slate-950 p-3 rounded-lg border border-white/5">
                                    <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                                    <div>
                                        <p className="font-medium text-white">Completed recent CBT Assessment</p>
                                        <p className="text-xs text-slate-500 mt-1">Score: {readinessData.history[readinessData.history.length - 1]?.score}%</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-slate-500 italic py-2">Keep studying! Your achievements will appear here.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
