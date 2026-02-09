import { getStudentMetrics, getStudentSubjects, getExamReadiness } from "@/lib/actions/student-dashboard"
import { DashboardHeader } from "@/components/student/dashboard-header"
import { SubjectGrid } from "@/components/student/subject-grid"
import { ExamReadiness } from "@/components/student/exam-readiness"
import { getStudentAssignments } from "@/lib/actions/assignments"

export default async function StudentDashboardPage({ params }: { params: { domain: string } }) {
    // 1. Fetch Parallel Data
    const [metricsData, subjectsData, readinessData, assignmentsData] = await Promise.all([
        getStudentMetrics(),
        getStudentSubjects(),
        getExamReadiness(),
        getStudentAssignments()
    ])

    if (!metricsData.success || !metricsData.student) {
        // Fallback for demo if no student logic is tight
        return <div className="p-8 text-white">Access Loading... (Ensure you are logged in as a student)</div>
    }

    const pendingAssignments = assignmentsData.success && assignmentsData.data
        ? assignmentsData.data.filter((a: any) => a.status === 'pending')
        : []

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-8 space-y-8 max-w-7xl mx-auto">

            {/* 1. Header & Metrics */}
            <DashboardHeader
                student={metricsData.student}
                metrics={metricsData.metrics}
                feesPaid={metricsData.feesPaid}
            />

            {/* 2. Subjects Grid */}
            <section>
                <h2 className="text-xl font-bold text-white mb-4">My Subjects</h2>
                <SubjectGrid subjects={subjectsData.subjects || []} />
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 3. CBT / Exam Readiness */}
                <div className="lg:col-span-2">
                    <ExamReadiness history={readinessData.history || []} />
                </div>

                {/* 4. Assignments / To-Do */}
                <div className="bg-slate-900 border border-white/5 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-bold">Upcoming Tasks</h3>
                        <span className="text-xs font-mono bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full border border-blue-500/20">
                            {pendingAssignments.length} Active
                        </span>
                    </div>

                    <div className="space-y-3">
                        {pendingAssignments.length > 0 ? (
                            pendingAssignments.slice(0, 3).map((task: any) => (
                                <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-950 rounded-lg border-l-2 border-amber-500">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{task.title}</p>
                                        <p className="text-xs text-amber-500/80">
                                            {task.subject} • Due {new Date(task.due_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded shrink-0">Pending</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 text-slate-500 text-sm">
                                <p>No pending assignments.</p>
                                <p className="text-xs opacity-50">Great job staying on top!</p>
                            </div>
                        )}

                        {pendingAssignments.length > 3 && (
                            <div className="text-center pt-2">
                                <a href={`/dashboard/student/assignments`} className="text-xs text-slate-400 hover:text-white transition-colors">
                                    View {pendingAssignments.length - 3} more...
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
