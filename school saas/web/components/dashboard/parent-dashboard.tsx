import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Clock, CheckCircle2, AlertCircle, BookOpen } from "lucide-react"
import { getParentStats } from "@/lib/actions/dashboard"
import { getParentFeed } from "@/lib/actions/class-feed"
import { getActiveAcademicSession } from "@/lib/actions/academic"
import { ParentFeedView } from "@/components/class-feed/parent-feed-view"
import { ChatInterface } from "@/components/communication/chat-interface"
import Link from "next/link"
import { PrintActivityButton } from "./print-button"




// Simple circular progress component
function CircularProgress({ percentage, size = 80, color = "#3B82F6" }: { percentage: number; size?: number; color?: string }) {
    const radius = (size - 8) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (percentage / 100) * circumference

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth="6"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <span className="absolute text-sm font-bold text-foreground">{percentage}%</span>
        </div>
    )
}

function formatTime(minutes: number): string {
    if (minutes === 0) return "0m"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
}

export async function ParentDashboard({ tier = 'starter', studentId }: { tier?: string, studentId?: string }) {
    const statsPromise = getParentStats(studentId)
    const feedPromise = getParentFeed(5)
    const sessionPromise = getActiveAcademicSession()

    const [stats, feedResult, sessionResult] = await Promise.all([statsPromise, feedPromise, sessionPromise])
    const feedPosts = feedResult.success ? (feedResult.data || []) : []
    const session = sessionResult.success ? sessionResult.session : null



    if (!stats) {
        return (
            <div className="space-y-8">
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Unable to load dashboard data. Please try again later.</p>
                </div>
            </div>
        )
    }

    const mathSubject = stats.subjects.find(s => s.subject === 'Math')
    const readingSubject = stats.subjects.find(s => s.subject === 'Reading')

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground glow-blue">Student Progress</h2>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-muted-foreground">Overview for {stats.studentName} ({stats.className})</p>
                    {session && (
                        <span className="hidden md:inline-flex items-center rounded-md bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20">
                            {session.session} • {session.term}
                        </span>
                    )}
                </div>
            </div>

            {/* Progress Overview Section */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-slate-900 border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden group hover:-translate-y-1 hover:shadow-blue-900/20 hover:border-blue-700/50 transition-all duration-500 pt-2">
                    {/* 🌈 Thick Top Border Action */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 group-hover:h-1.5 transition-all duration-300" />

                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-all duration-500" />
                    <CardContent className="pt-6 relative z-10">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-[10px] text-blue-200/70 uppercase tracking-widest">Overall Progress</h3>
                            <span className="text-[10px] text-blue-400 uppercase font-bold tracking-widest bg-blue-500/10 px-2 py-1 rounded-full border border-blue-500/20">All Subjects</span>
                        </div>
                        <div className="h-20 flex items-center justify-center">
                            <CircularProgress percentage={stats.overallProgress} color="#3B82F6" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group hover:-translate-y-1 hover:shadow-emerald-900/20 hover:border-emerald-700/50 transition-all duration-500 pt-2">
                    {/* 🌈 Thick Top Border Action */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 group-hover:h-1.5 transition-all duration-300" />

                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-all duration-500" />
                    <CardContent className="pt-6 relative z-10">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-[10px] text-emerald-200/70 uppercase tracking-widest">Activity Completion</h3>
                            <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">Today</span>
                        </div>
                        <div className="h-20 flex items-center justify-center">
                            <CircularProgress percentage={stats.overallActivity} color="#10B981" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group hover:-translate-y-1 hover:shadow-amber-900/20 hover:border-amber-700/50 transition-all duration-500 pt-2">
                    {/* 🌈 Thick Top Border Action */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 group-hover:h-1.5 transition-all duration-300" />

                    <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-amber-500/20 transition-all duration-500" />
                    <CardContent className="pt-6 relative z-10">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-[10px] text-amber-200/70 uppercase tracking-widest">Learning Time</h3>
                            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-amber-200 tracking-tight">{formatTime(stats.totalTimeMinutes)}</span>
                        </div>
                        <div className="h-20 flex items-center justify-center">
                            <div className="text-center">
                                <Clock className="w-10 h-10 text-amber-500/30 mx-auto mb-2 group-hover:text-amber-400/80 transition-colors duration-500" />
                                <p className="text-[10px] text-amber-500/50 font-bold uppercase tracking-widest group-hover:text-amber-400/80 transition-colors">Active Today</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Current Lessons */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Math */}
                {mathSubject ? (
                    <Card className="bg-slate-900 border-white/10 backdrop-blur-xl group relative overflow-hidden hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-500">
                        {/* 🌈 Vibrant Gradient Background Glow */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors duration-700" />
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

                        <CardContent className="p-6 space-y-4 relative z-10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">Math</h3>
                                    <p className="text-sm text-blue-400/80 font-medium tracking-wide">Basic Math • {mathSubject.gradeLevel}</p>
                                </div>
                                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(59,130,246,0.15)] glow-blue">Next Grade</span>
                            </div>

                            <ul className="space-y-2 text-sm text-muted-foreground">
                                {mathSubject.topics.map((topic, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500/50" /> {topic}
                                    </li>
                                ))}
                            </ul>

                            <div className="space-y-1 pt-2">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-blue-400">{mathSubject.completedLessons}/{mathSubject.totalLessons} Completed</span>
                                    <Trophy className="w-4 h-4 text-yellow-500" />
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 transition-all duration-500 relative"
                                        style={{ width: `${mathSubject.progressPercentage}%` }}
                                    >
                                        <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/20" />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground pt-1">
                                    Next up: <span className="text-slate-300">{mathSubject.nextLessonTitle || 'Complete!'}</span>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="bg-card text-card-foreground/50 border-border/50 border-dashed">
                        <CardContent className="p-6 h-full flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">No Math progress data available</p>
                        </CardContent>
                    </Card>
                )}

                {/* Reading */}
                {readingSubject ? (
                    <Card className="bg-slate-900 border-white/10 backdrop-blur-xl group relative overflow-hidden hover:border-pink-500/50 hover:shadow-2xl hover:shadow-pink-900/20 transition-all duration-500">
                        {/* 🌈 Vibrant Gradient Background Glow */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl group-hover:bg-pink-500/20 transition-colors duration-700" />
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-fuchsia-400 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

                        <CardContent className="p-6 space-y-4 relative z-10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-white to-pink-200">Reading</h3>
                                    <p className="text-sm text-pink-400/80 font-medium tracking-wide">Basic Reading • {readingSubject.gradeLevel}</p>
                                </div>
                                <span className="px-3 py-1 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded-full text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(236,72,153,0.15)] glow-pink">Next Grade</span>
                            </div>

                            <ul className="space-y-2 text-sm text-muted-foreground">
                                {readingSubject.topics.map((topic, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500/50" /> {topic}
                                    </li>
                                ))}
                            </ul>

                            <div className="space-y-1 pt-2">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-pink-400">{readingSubject.completedLessons}/{readingSubject.totalLessons} Completed</span>
                                    <Trophy className="w-4 h-4 text-yellow-500" />
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-pink-500 transition-all duration-500 relative"
                                        style={{ width: `${readingSubject.progressPercentage}%` }}
                                    >
                                        <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/20" />
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground pt-1">
                                    Next up: <span className="text-slate-300">{readingSubject.nextLessonTitle || 'Complete!'}</span>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="bg-card text-card-foreground/50 border-border/50 border-dashed">
                        <CardContent className="p-6 h-full flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">No Reading progress data available</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Today's Activity */}
            <Card className="bg-slate-900 border-white/10 backdrop-blur-xl shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50 mb-4">
                    <CardTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Today&apos;s Activity Schedule</CardTitle>
                    <div className="flex gap-4 text-sm">
                        <span className="flex items-center gap-1.5 text-amber-500/80 font-mono bg-amber-500/10 px-3 py-1 rounded border border-amber-500/20">
                            <Clock className="w-4 h-4" /> {formatTime(stats.totalTimeMinutes)}
                        </span>
                        <PrintActivityButton />
                    </div>
                </CardHeader>
                <CardContent>
                    {stats.todaysActivities.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-4">
                            {stats.todaysActivities.map((activity) => (
                                <div key={activity.id} className="relative bg-slate-950 border border-white/5 rounded-xl p-5 hover:border-blue-500/40 hover:bg-slate-900 text-card-foreground/80 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 group overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-transparent group-hover:from-blue-500/5 transition-colors duration-500" />
                                    <div className="relative z-10 flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{activity.subject}</h4>
                                            <p className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground mt-1">Lesson-{activity.lessonNumber}</p>
                                        </div>
                                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded border shadow-sm ${activity.status === 'completed'
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10'
                                            : activity.status === 'in_progress'
                                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/10'
                                                : 'bg-slate-800/80 text-muted-foreground border-border/50'
                                            }`}>
                                            {activity.status === 'completed' ? 'Completed' :
                                                activity.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                                        </span>
                                    </div>
                                    <div className="mb-5 relative z-10">
                                        <p className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500 mb-1">{String(activity.lessonNumber).padStart(2, '0')}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-1">{activity.title}</p>
                                    </div>
                                    <Link href="/dashboard/academics" className="relative z-10 flex items-center justify-center w-full py-2 text-xs font-bold uppercase tracking-wider text-slate-300 bg-secondary/50 hover:bg-white/10 hover:text-foreground rounded transition-colors border border-border/50">
                                        View Lesson
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <BookOpen className="w-12 h-12 text-slate-800 mx-auto mb-3" />
                            <p className="text-sm text-muted-foreground">No activities scheduled for today</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Class Updates / Digital Diary */}
            <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-xl text-foreground">Class Updates</h3>
                    </div>
                    {/* Note: ParentFeedView might need internal styling updates to match dark mode, 
                     but since it's a separate component we assume it inherits globals or will require separate pass if distinct */}
                    <ParentFeedView posts={feedPosts} />
                </div>
            </div>



        </div>
    )
}
