
import { PlatinumConcierge } from "@/components/dashboard/platinum-concierge"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function PlatinumConciergePage({
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
    // Prioritize the student who most recently had a curriculum milestone (for a better UX when testing/demoing)
    if (!studentId) {
        const { data: students } = await supabase
            .from('students')
            .select(`
                id,
                curriculum_milestones (
                    created_at
                )
            `)
            .eq('parent_id', user.id)

        if (students && students.length > 0) {
            // Sort students by the most recent curriculum milestone
            const sortedStudents = students.sort((a: any, b: any) => {
                const aLatest = a.curriculum_milestones?.length > 0
                    ? Math.max(...a.curriculum_milestones.map((m: any) => new Date(m.created_at).getTime()))
                    : 0;
                const bLatest = b.curriculum_milestones?.length > 0
                    ? Math.max(...b.curriculum_milestones.map((m: any) => new Date(m.created_at).getTime()))
                    : 0;
                return bLatest - aLatest;
            });

            studentId = sortedStudents[0].id
        }
    }

    // If STILL no studentId (e.g., admin testing the parent view), intelligently pick the student they just gave a milestone to!
    if (!studentId) {
        const { data: recentMilestone } = await supabase
            .from('curriculum_milestones')
            .select('student_id')
            .order('created_at', { ascending: false })
            .limit(1)

        if (recentMilestone && recentMilestone.length > 0) {
            studentId = recentMilestone[0].student_id
        } else {
            const { data: fallbackStudent } = await supabase
                .from('students')
                .select('id')
                .limit(1)

            if (fallbackStudent && fallbackStudent.length > 0) {
                studentId = fallbackStudent[0].id
            }
        }
    }

    const safeStudentId = studentId || ''

    // Fetch Platinum Data
    const [medicalLogs, healthAlerts, pickupAuth, assignments, curriculum, ptaSlots, tenant] = await Promise.all([
        import("@/lib/actions/platinum").then(m => m.getMedicalLogs(safeStudentId)),
        import("@/lib/actions/platinum").then(m => m.getHealthAlerts(safeStudentId)),
        import("@/lib/actions/platinum").then(m => m.getPickupAuthorization(safeStudentId)),
        import("@/lib/actions/platinum").then(m => m.getAssignments(safeStudentId)),
        import("@/lib/actions/platinum").then(m => m.getCurriculumProgress(safeStudentId)),
        import("@/lib/actions/platinum").then(m => m.getPTASlots('teacher-id-placeholder')),
        supabase.from('tenants').select('name').single()
    ])

    return (
        <div className="p-8 space-y-8 min-h-screen text-white">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white glow-blue">Platinum Concierge</h1>
                <p className="text-slate-400">Exclusive access to premium school services and executive support.</p>
            </div>

            <PlatinumConcierge
                studentId={safeStudentId}
                pickupAuth={pickupAuth}
                medicalLogs={medicalLogs}
                healthAlerts={healthAlerts}
                curriculum={curriculum}
                assignments={assignments}
                ptaSlots={ptaSlots}
                tenantName={tenant.data?.name || "EduFlow Academy"}
            />
        </div>
    )
}
