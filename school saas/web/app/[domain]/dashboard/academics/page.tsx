
import { CurriculumRoadmap } from "@/components/learning/curriculum-roadmap"
import { HomeworkTracker } from "@/components/learning/homework-tracker"
import { StudentAwardsView } from "@/components/behavior/student-awards-view"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AcademicsPage({
    searchParams
}: {
    searchParams: { studentId?: string }
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    // Identify Student Context
    let studentId = searchParams.studentId

    // If no studentId in params, try to find one linked to the parent
    if (!studentId) {
        const { data: students } = await supabase
            .from('students')
            .select('id')
            .eq('parent_id', user.id)
            .limit(1)

        if (students && students.length > 0) {
            studentId = students[0].id
        }
    }

    const safeStudentId = studentId || ''

    // Fetch Academic & Behavior Data
    const [assignments, curriculum, achievements] = await Promise.all([
        import("@/lib/actions/platinum").then(m => m.getAssignments(safeStudentId)),
        import("@/lib/actions/platinum").then(m => m.getCurriculumProgress(safeStudentId)),
        import("@/lib/actions/behavior").then(m => m.getStudentAchievements(safeStudentId))
    ])

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 mb-20">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white glow-blue">Student Performance</h1>
                <p className="text-slate-400">Curriculum roadmap, homework, and behavioral achievements.</p>
            </div>

            {/* Awards Section - Top Priority */}
            <StudentAwardsView achievements={achievements} />

            <div className="grid gap-6 md:grid-cols-2">
                <CurriculumRoadmap milestones={curriculum} />
                <HomeworkTracker tasks={assignments} />
            </div>
        </div>
    )
}
