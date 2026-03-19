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
        <div className="p-8 space-y-8 max-w-[1400px] mx-auto relative flex-1 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground glow-text">
                        Curriculum Architect
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-muted-foreground font-medium">
                            Manage learning roadmaps, track syllabus progression, and assign milestones.
                        </p>
                        <span className="inline-flex items-center rounded-md bg-cyan-500/10 px-2 py-1 text-xs font-medium text-cyan-400 ring-1 ring-inset ring-cyan-500/20">
                            Forensic Planning
                        </span>
                    </div>
                </div>
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
