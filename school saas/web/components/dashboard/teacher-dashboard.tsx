import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Calendar, Clock, UserCheck, PlayCircle, FileText } from "lucide-react"
import { getTeacherStats } from "@/lib/actions/dashboard"
import { MetricCard } from "./metric-card"

export async function TeacherDashboard({ tier = 'starter' }: { tier?: string }) {
    const stats = await getTeacherStats()
    const classes = stats?.classes || []
    const lessons = stats?.upcomingLessons || []

    // Default active class (mock logic for "Current Session")
    const activeClass = classes[0]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white glow-blue">Teacher Workspace</h2>
                    <p className="text-slate-400">Manage your classes and lessons efficiently.</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Quick Actions */}
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95">
                        Create Lesson
                    </button>
                </div>
            </div>

            {/* Up Next / Active Class - Hero Card */}
            {activeClass ? (
                <div className="relative group overflow-hidden rounded-xl border border-blue-500/30 bg-slate-900/40 backdrop-blur-xl shadow-glow-blue">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                    <div className="flex flex-col md:flex-row justify-between items-start p-8 relative z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400">
                                    Current Session
                                </span>
                                <span className="text-slate-500 text-xs flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> 09:00 AM - 10:30 AM
                                </span>
                            </div>
                            <h3 className="text-4xl font-bold text-white mb-2">{activeClass.name}</h3>
                            <p className="text-lg text-slate-300 flex items-center gap-2">
                                {activeClass.grade_level} • Literature & Composition
                            </p>
                        </div>

                        <div className="mt-6 md:mt-0 flex gap-4">
                            <div className="text-center bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md">
                                <div className="text-2xl font-bold text-white">24</div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider">Present</div>
                            </div>
                            <div className="text-center bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md">
                                <div className="text-2xl font-bold text-slate-400">3</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider">Absent</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/5 p-4 flex gap-3 border-t border-white/5 backdrop-blur-md">
                        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
                            <PlayCircle className="w-4 h-4" /> Start Class
                        </button>
                        <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
                            <FileText className="w-4 h-4" /> View Lesson Plan
                        </button>
                    </div>
                </div>
            ) : (
                <Card className="bg-slate-900/50 border-white/5 border-dashed">
                    <CardContent className="h-40 flex items-center justify-center text-slate-500">
                        No active classes found.
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <MetricCard
                    title="Assignments"
                    value={(stats?.assignmentsToGrade || 0).toString()}
                    icon={BookOpen}
                    description="Pending Grading"
                    trend={{ value: "3 Due Today", positive: false }}
                />
                <MetricCard
                    title="Upcoming Exams"
                    value={(stats?.upcomingExams || 0).toString()}
                    icon={Calendar}
                    description="Next 7 Days"
                />
                <MetricCard
                    title="Avg. Attendance"
                    value={`${stats?.averageAttendance || 0}%`}
                    icon={UserCheck}
                    description="Class Average"
                    trend={{ value: "+2.5%", positive: true }}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-slate-400 font-medium text-sm">Upcoming Lessons</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {lessons.length > 0 ? lessons.map((lesson) => (
                                <div key={lesson.id} className="flex items-center gap-4 group p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                                    <div className="w-1.5 h-12 bg-blue-500 rounded-full group-hover:bg-blue-400 transition-colors"></div>
                                    <div>
                                        <p className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">{lesson.title}</p>
                                        <p className="text-sm text-slate-500">{lesson.subject} • {lesson.date}</p>
                                    </div>
                                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-full hover:bg-blue-500/20">
                                            Prepare
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-slate-500">No upcoming lessons scheduled.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
