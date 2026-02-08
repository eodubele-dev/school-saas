
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

    // If still no studentId, we might need to show a selector or empty state
    // For now, let's proceed with an empty string which might show empty states in components
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
        <div className="p-8 space-y-8 bg-black min-h-screen text-white">
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
