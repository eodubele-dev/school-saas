import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Clock } from "lucide-react"
import { getParentStats } from "@/lib/actions/dashboard"
import { getParentFeed } from "@/lib/actions/class-feed"
import { ParentFeedView } from "@/components/class-feed/parent-feed-view"

// Simple circular progress component
function CircularProgress({ percentage, size = 80 }: { percentage: number; size?: number }) {
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
                    stroke="#e2e8f0"
                    strokeWidth="6"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                />
            </svg>
            <span className="absolute text-sm font-bold text-slate-700">{percentage}%</span>
        </div>
    )
}

// Format minutes to hours and minutes
function formatTime(minutes: number): string {
    if (minutes === 0) return "0m"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
}

export async function ParentDashboard() {
    const statsPromise = getParentStats()
    const feedPromise = getParentFeed(5) // Limit to 5

    const [stats, feedResult] = await Promise.all([statsPromise, feedPromise])
    const feedPosts = feedResult.success ? (feedResult.data || []) : []

    if (!stats) {
        return (
            <div className="space-y-8">
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Unable to load dashboard data. Please try again later.</p>
                </div>
            </div>
        )
    }

    // Get Math and Reading subjects (or show empty state)
    const mathSubject = stats.subjects.find(s => s.subject === 'Math')
    const readingSubject = stats.subjects.find(s => s.subject === 'Reading')

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Student Progress</h2>
                <p className="text-muted-foreground">Overview for {stats.studentName} ({stats.className})</p>
            </div>

            {/* Progress Overview Section */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white border-card">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg">Student Progress</h3>
                            <span className="text-2xl font-bold text-slate-800">{stats.overallProgress}%</span>
                        </div>
                        <div className="h-20 flex items-center justify-center">
                            <CircularProgress percentage={stats.overallProgress} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-card">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg">Total Activity</h3>
                            <span className="text-2xl font-bold text-slate-800">{stats.overallActivity}%</span>
                        </div>
                        <div className="h-20 flex items-center justify-center">
                            <CircularProgress percentage={stats.overallActivity} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-card">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-lg">Total Time</h3>
                            <span className="text-2xl font-bold text-slate-800">{formatTime(stats.totalTimeMinutes)}</span>
                        </div>
                        <div className="h-20 flex items-center justify-center">
                            <div className="text-center">
                                <Clock className="w-12 h-12 text-slate-400 mx-auto mb-1" />
                                <p className="text-xs text-slate-500">Today</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Current Lessons */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Math */}
                {mathSubject ? (
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-xl">Math</h3>
                                    <p className="text-sm text-blue-600 font-medium">Basic Math • {mathSubject.gradeLevel}</p>
                                </div>
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">Next Grade</span>
                            </div>

                            <ul className="space-y-2 text-sm text-slate-600">
                                {mathSubject.topics.map((topic, i) => (
                                    <li key={i}>{topic}</li>
                                ))}
                            </ul>

                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-purple-600">{mathSubject.completedLessons}/{mathSubject.totalLessons} Completed</span>
                                    <Trophy className="w-4 h-4 text-yellow-500" />
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-purple-500 transition-all duration-500"
                                        style={{ width: `${mathSubject.progressPercentage}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-slate-500 pt-1">
                                    Next up: {mathSubject.nextLessonTitle || 'Complete!'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="text-center py-8">
                                <p className="text-sm text-muted-foreground">No Math progress data available</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Reading */}
                {readingSubject ? (
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-xl">Reading</h3>
                                    <p className="text-sm text-pink-600 font-medium">Basic Reading • {readingSubject.gradeLevel}</p>
                                </div>
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">Next Grade</span>
                            </div>

                            <ul className="space-y-2 text-sm text-slate-600">
                                {readingSubject.topics.map((topic, i) => (
                                    <li key={i}>{topic}</li>
                                ))}
                            </ul>

                            <div className="space-y-1">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-pink-600">{readingSubject.completedLessons}/{readingSubject.totalLessons} Completed</span>
                                    <Trophy className="w-4 h-4 text-yellow-500" />
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-pink-500 transition-all duration-500"
                                        style={{ width: `${readingSubject.progressPercentage}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-slate-500 pt-1">
                                    Next up: {readingSubject.nextLessonTitle || 'Complete!'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <div className="text-center py-8">
                                <p className="text-sm text-muted-foreground">No Reading progress data available</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Today's Activity */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-xl">Today&apos;s Activity</h3>
                    <div className="flex gap-4 text-sm">
                        <span className="flex items-center gap-1 text-slate-500">
                            <Clock className="w-4 h-4" /> {formatTime(stats.totalTimeMinutes)}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500 hover:text-slate-900 cursor-pointer">Print Activity</span>
                    </div>
                </div>

                {stats.todaysActivities.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-4">
                        {stats.todaysActivities.map((activity) => (
                            <Card key={activity.id} className="bg-white overflow-hidden">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-bold">{activity.subject}</h4>
                                            <p className="text-xs text-slate-500">Lesson-{activity.lessonNumber}</p>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${activity.status === 'completed'
                                            ? 'bg-green-100 text-green-700'
                                            : activity.status === 'in_progress'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {activity.status === 'completed' ? 'Completed' :
                                                activity.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                                        </span>
                                    </div>
                                    <div className="mb-4">
                                        <p className="font-bold text-sm">{String(activity.lessonNumber).padStart(2, '0')}</p>
                                        <p className="text-xs text-slate-500">{activity.title}</p>
                                    </div>
                                    <button className="w-full py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-md">
                                        View Lesson
                                    </button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-8">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">No activities scheduled for today</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Class Updates / Digital Diary */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-xl">Class Updates</h3>
                </div>
                <ParentFeedView posts={feedPosts} />
            </div>
        </div>
    )
}
