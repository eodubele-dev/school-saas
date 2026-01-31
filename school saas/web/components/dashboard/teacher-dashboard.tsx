import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Calendar, Clock, UserCheck } from "lucide-react"
import { getTeacherStats } from "@/lib/actions/dashboard"

export async function TeacherDashboard() {
    const stats = await getTeacherStats()
    const classes = stats?.classes || []
    const lessons = stats?.upcomingLessons || []

    // Default active class (mock logic for "Current Session")
    const activeClass = classes[0]

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Teacher Workspace</h2>
                    <p className="text-muted-foreground">Good morning. You have {classes.length} classes today.</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Quick Actions */}
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90">
                        Create Lesson
                    </button>
                </div>
            </div>

            {/* Up Next / Active Class */}
            {activeClass ? (
                <Card className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-purple-100 font-medium mb-1">Current Session</p>
                                <h3 className="text-2xl font-bold">{activeClass.name}</h3>
                                <p className="text-purple-100 mt-2 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> {activeClass.grade_level}
                                </p>
                            </div>
                            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                                <div className="text-center">
                                    <div className="text-2xl font-bold">--</div>
                                    <div className="text-xs opacity-80">Students</div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-lg text-sm transition-colors">
                                View Lesson Plan
                            </button>
                            <button className="bg-white text-purple-600 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                                Start Class
                            </button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="bg-slate-50 border-dashed">
                    <CardContent className="h-40 flex items-center justify-center text-muted-foreground">
                        No active classes found.
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Quick Stats */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Assignments to Grade</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.assignmentsToGrade || 0}</div>
                        <p className="text-xs text-muted-foreground">Due today</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.upcomingExams || 0}</div>
                        <p className="text-xs text-muted-foreground">Next week</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.averageAttendance || 0}%</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Lessons</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {lessons.length > 0 ? lessons.map((lesson) => (
                                <div key={lesson.id} className="flex items-center gap-4">
                                    <div className="w-2 h-12 bg-green-500 rounded-full"></div>
                                    <div>
                                        <p className="font-semibold">{lesson.title}</p>
                                        <p className="text-sm text-muted-foreground">{lesson.subject} • {lesson.date}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-muted-foreground">No upcoming lessons scheduled.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
