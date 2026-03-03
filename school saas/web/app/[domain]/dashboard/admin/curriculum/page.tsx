import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getAdminCurriculumData } from "@/lib/actions/curriculum"
import { CurriculumManagerClient } from "@/components/admin/curriculum/curriculum-manager"

export default async function AdminCurriculumPage() {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    // Server-side fetch
    const { students, milestones } = await getAdminCurriculumData()

    return (
        <div className="p-8 space-y-8 max-w-[1400px] mx-auto relative flex-1">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-blue-500/5 to-red-500/5 pointer-events-none -z-10 rounded-3xl" />
            <div className="flex flex-col gap-2 relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/20 via-blue-500/20 to-red-500/20 blur-xl z-0" />
                <h1 className="text-4xl font-black tracking-tight relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-blue-400 to-red-400">
                    Curriculum Architect
                </h1>
                <p className="text-slate-400 text-lg relative z-10 font-medium">Manage learning roadmaps, track syllabus progression, and assign milestones to students.</p>
            </div>

            <div className="relative z-10">
                <CurriculumManagerClient
                    initialStudents={students}
                    initialMilestones={milestones}
                />
            </div>
        </div>
    )
}
