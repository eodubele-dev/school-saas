import { getStudentMetrics, getStudentSubjects, getExamReadiness } from "@/lib/actions/student-dashboard"
import { DashboardHeader } from "@/components/student/dashboard-header"
import { SubjectGrid } from "@/components/student/subject-grid"
import { ExamReadiness } from "@/components/student/exam-readiness"
import { redirect } from "next/navigation"

export default async function StudentDashboardPage({ params }: { params: { domain: string } }) {
    // 1. Fetch Parallel Data
    const [metricsData, subjectsData, readinessData] = await Promise.all([
        getStudentMetrics(),
        getStudentSubjects(),
        getExamReadiness()
    ])

    if (!metricsData.success || !metricsData.student) {
        // Fallback for demo if no student logic is tight
        return <div className="p-8 text-white">Access Loading... (Ensure you are logged in as a student)</div>
    }

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
                    <h3 className="text-white font-bold mb-4">Upcoming Tasks</h3>
                    <div className="space-y-3">
                        {/* Mock Tasks */}
                        <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-lg border-l-2 border-red-500">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-white">Physics Lab Report</p>
                                <p className="text-xs text-red-400">Due Tomorrow</p>
                            </div>
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded">Pending</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-lg border-l-2 border-green-500">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-white">Maths Assignment 4</p>
                                <p className="text-xs text-green-400">Completed</p>
                            </div>
                            <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-1 rounded">Submitted</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
