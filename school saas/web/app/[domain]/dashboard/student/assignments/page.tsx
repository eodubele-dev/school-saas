import { AssignmentList } from "@/components/student/assignments/assignment-list"
import { getStudentAssignments } from "@/lib/actions/assignments"

export default async function StudentAssignmentsPage() {
    const { success, data } = await getStudentAssignments()
    const pendingCount = success && data ? data.filter((a: any) => a.status === 'pending').length : 0

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen bg-slate-950 space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Assignments & Tasks</h1>
                    <p className="text-slate-400">Manage your homework, projects, and deadlines.</p>
                </div>
                <div className="text-right hidden md:block">
                    <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Pending Tasks</span>
                    <span className="font-mono text-xl text-amber-500 font-bold">{pendingCount} Active</span>
                </div>
            </div>

            <AssignmentList />
        </div>
    )
}
