import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCurriculumData } from "@/lib/actions/curriculum"
import { CurriculumManagerClient } from "@/components/admin/curriculum/curriculum-manager"
import { BookOpen } from "lucide-react"

export default async function TeacherCurriculumPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    // Fetch curriculum data (students + milestones) for this teacher
    const { students, milestones } = await getCurriculumData()

    return (
        <div className="p-8 space-y-8 max-w-[1400px] mx-auto relative flex-1 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-[var(--school-accent)]/10 p-2.5 rounded-lg border border-[var(--school-accent)]/20 shadow-[0_0_15px_rgba(37,99,235,0.15)]">
                        <BookOpen className="h-6 w-6 text-[var(--school-accent)]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Curriculum Planner
                        </h1>
                        <p className="text-muted-foreground text-xs mt-0.5">
                            Manage learning roadmaps, track syllabus progression, and assign milestones to students.
                        </p>
                    </div>
                </div>
                <span className="inline-flex items-center rounded-md bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-400 ring-1 ring-inset ring-cyan-500/20">
                    Forensic Planning
                </span>
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
