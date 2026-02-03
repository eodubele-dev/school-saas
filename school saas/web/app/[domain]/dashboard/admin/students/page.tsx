import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getAllStudents, getAllClasses } from "@/lib/actions/student-management"
import StudentListClient from "@/components/students/student-list-client"
import { GraduationCap } from "lucide-react"

export default async function StudentListPage({ params }: { params: { domain: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect(`/${params.domain}/login`)
    }

    // Role check (Admin/Registrar only)
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin' && profile?.role !== 'registrar') {
        return <div className="p-8 text-center text-red-500">Access Denied</div>
    }

    // Parallel Data Fetching
    const [students, classes] = await Promise.all([
        getAllStudents(),
        getAllClasses()
    ])

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-950">
            {/* Header */}
            <div className="border-b border-white/5 bg-slate-950 p-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--school-accent)]/10 text-[var(--school-accent)] border border-[var(--school-accent)]/20 shadow-[0_0_15px_rgba(var(--school-accent-rgb),0.2)]">
                        <GraduationCap className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Student Directory</h1>
                        <p className="text-slate-400 text-sm">Manage student records and class placements.</p>
                    </div>
                </div>
            </div>

            {/* Content Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                <div className="max-w-[1600px] mx-auto">
                    <StudentListClient
                        initialStudents={students}
                        classes={classes}
                    />
                </div>
            </div>
        </div>
    )
}
