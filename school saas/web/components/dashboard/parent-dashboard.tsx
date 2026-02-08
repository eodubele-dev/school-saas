import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Clock, CheckCircle2, AlertCircle, BookOpen } from "lucide-react"
import { getParentStats } from "@/lib/actions/dashboard"
import { getParentFeed } from "@/lib/actions/class-feed"
import { ParentFeedView } from "@/components/class-feed/parent-feed-view"
import { PickupAuthorization } from "@/components/security/pickup-authorization"
import { GatePassGenerator } from "@/components/security/gate-pass-generator"
import { MedicalIncidentLog } from "@/components/health/medical-incident-log"
import { AllergyAlertManager } from "@/components/health/allergy-alert-manager"
import { PTAScheduler } from "@/components/feedback/pta-scheduler"
import { FeedbackHub } from "@/components/feedback/feedback-hub"
import { CurriculumRoadmap } from "@/components/learning/curriculum-roadmap"
import { HomeworkTracker } from "@/components/learning/homework-tracker"

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
                    stroke="#1e293b"
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
            <span className="absolute text-sm font-bold text-white">{percentage}%</span>
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

    const [stats, feedResult] = await Promise.all([statsPromise, feedPromise])
    const feedPosts = feedResult.success ? (feedResult.data || []) : []

    // 💎 Platinum Data Fetching
    // We fetch these in parallel to minimize waterfall
    const [medicalLogs, healthAlerts, pickupAuth, assignments, curriculum, ptaSlots] = await Promise.all([
        import("@/lib/actions/platinum").then(m => m.getMedicalLogs(studentId || '')),
        import("@/lib/actions/platinum").then(m => m.getHealthAlerts(studentId || '')),
        import("@/lib/actions/platinum").then(m => m.getPickupAuthorization(studentId || '')),
        import("@/lib/actions/platinum").then(m => m.getAssignments(studentId || '')),
        import("@/lib/actions/platinum").then(m => m.getCurriculumProgress(studentId || '')),
        import("@/lib/actions/platinum").then(m => m.getPTASlots('teacher-id-placeholder'))
    ])

    if (!stats) {
        return (
            <div className="space-y-8">
                <div className="text-center py-12">
                    <p className="text-slate-400">Unable to load dashboard data. Please try again later.</p>
                </div>
            </div>
        )
    }

    const mathSubject = stats.subjects.find(s => s.subject === 'Math')
    const readingSubject = stats.subjects.find(s => s.subject === 'Reading')

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white glow-blue">Student Progress</h2>
                <p className="text-slate-400">Overview for {stats.studentName} ({stats.className})</p>
            </div>

            {/* Progress Overview Section */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-16 -mt-16" />
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg text-slate-200">Overall Progress</h3>
                            <span className="text-xs text-slate-500">All Subjects</span>
                        </div>
                        <div className="h-20 flex items-center justify-center">
                            <CircularProgress percentage={stats.overallProgress} color="#3B82F6" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl shadow-lg relative overflow-hidden">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg text-slate-200">Activity Completion</h3>
                            <span className="text-xs text-slate-500">Today</span>
                        </div>
                        <div className="h-20 flex items-center justify-center">
                            <CircularProgress percentage={stats.overallActivity} color="#10B981" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl shadow-lg relative overflow-hidden">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg text-slate-200">Learning Time</h3>
                            <span className="text-2xl font-bold text-white tracking-tight">{formatTime(stats.totalTimeMinutes)}</span>
                        </div>
                        <div className="h-20 flex items-center justify-center">
                            <div className="text-center">
                                <Clock className="w-12 h-12 text-slate-700 mx-auto mb-1" />
                                <p className="text-xs text-slate-500">Active Today</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Current Lessons */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Math */}
                {mathSubject ? (
                    <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-xl text-white">Math</h3>
                                    <p className="text-sm text-blue-400 font-medium">Basic Math • {mathSubject.gradeLevel}</p>
                                </div>
                                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold">Next Grade</span>
                            </div>

                            <ul className="space-y-2 text-sm text-slate-400">
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
                                <p className="text-xs text-slate-500 pt-1">
                                    Next up: <span className="text-slate-300">{mathSubject.nextLessonTitle || 'Complete!'}</span>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="bg-slate-900/50 border-white/5 border-dashed">
                        <CardContent className="p-6 h-full flex items-center justify-center">
                            <p className="text-sm text-slate-500">No Math progress data available</p>
                        </CardContent>
                    </Card>
                )}

                {/* Reading */}
                {readingSubject ? (
                    <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-xl text-white">Reading</h3>
                                    <p className="text-sm text-pink-400 font-medium">Basic Reading • {readingSubject.gradeLevel}</p>
                                </div>
                                <span className="px-3 py-1 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded-full text-xs font-bold">Next Grade</span>
                            </div>

                            <ul className="space-y-2 text-sm text-slate-400">
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
                                <p className="text-xs text-slate-500 pt-1">
                                    Next up: <span className="text-slate-300">{readingSubject.nextLessonTitle || 'Complete!'}</span>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="bg-slate-900/50 border-white/5 border-dashed">
                        <CardContent className="p-6 h-full flex items-center justify-center">
                            <p className="text-sm text-slate-500">No Reading progress data available</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Today's Activity */}
            <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-slate-300">Today&apos;s Activity</CardTitle>
                    <div className="flex gap-4 text-sm">
                        <span className="flex items-center gap-1 text-slate-500">
                            <Clock className="w-4 h-4" /> {formatTime(stats.totalTimeMinutes)}
                        </span>
                        <span className="flex items-center gap-1 text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">Print Activity</span>
                    </div>
                </CardHeader>
                <CardContent>
                    {stats.todaysActivities.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-4">
                            {stats.todaysActivities.map((activity) => (
                                <div key={activity.id} className="bg-slate-950/50 border border-white/5 rounded-lg p-4 hover:border-blue-500/30 transition-colors group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-bold text-slate-200">{activity.subject}</h4>
                                            <p className="text-xs text-slate-500">Lesson-{activity.lessonNumber}</p>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${activity.status === 'completed'
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : activity.status === 'in_progress'
                                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                : 'bg-slate-800 text-slate-400 border-slate-700'
                                            }`}>
                                            {activity.status === 'completed' ? 'Completed' :
                                                activity.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                                        </span>
                                    </div>
                                    <div className="mb-4">
                                        <p className="font-bold text-sm text-white">{String(activity.lessonNumber).padStart(2, '0')}</p>
                                        <p className="text-xs text-slate-400 truncate">{activity.title}</p>
                                    </div>
                                    <button className="w-full py-1.5 text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 rounded-md transition-colors border border-white/5">
                                        View Lesson
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <BookOpen className="w-12 h-12 text-slate-800 mx-auto mb-3" />
                            <p className="text-sm text-slate-500">No activities scheduled for today</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Class Updates / Digital Diary */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-xl text-white">Class Updates</h3>
                </div>
                {/* Note: ParentFeedView might need internal styling updates to match dark mode, 
                     but since it's a separate component we assume it inherits globals or will require separate pass if distinct */}
                <ParentFeedView posts={feedPosts} />
            </div>

            {/* 💎 Platinum Concierge & Duty of Care Suite */}
            <div className="space-y-6 pt-8 border-t border-white/10">
                <div className="flex items-center gap-4 mb-2">
                    <div className="bg-cyan-500/10 p-3 rounded-2xl border border-cyan-500/20 shadow-[0_0_20px_rgba(8,145,178,0.2)]">
                        <Trophy className="text-cyan-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-white glow-blue uppercase italic">Platinum Concierge</h2>
                        <p className="text-slate-400 text-sm">Duty of Care • Voice • Academics</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* 🛡️ Security & Logistics */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Security & Logistics</h3>
                        <PickupAuthorization data={pickupAuth} />
                        <GatePassGenerator studentId={studentId} />
                    </div>

                    {/* 🏥 Health & Vitals */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Health & Vitals</h3>
                        <MedicalIncidentLog outcomes={medicalLogs} />
                        <AllergyAlertManager alerts={healthAlerts} />
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* 📚 Academic Resources */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Academic Proficiency</h3>
                        <CurriculumRoadmap milestones={curriculum} />
                        <HomeworkTracker tasks={assignments} />
                    </div>

                    {/* 🗣️ Student Voice */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-1">Voice & Feedback</h3>
                        <PTAScheduler slots={ptaSlots} studentId={studentId} />
                        <FeedbackHub studentId={studentId} />
                    </div>
                </div>
            </div>
        </div>
    )
}
