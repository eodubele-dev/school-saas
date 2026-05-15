import { GradeEntryGrid } from "@/components/academic/grade-entry-grid"
import { getClassGrades } from "@/lib/actions/gradebook"
import { AlertCircle, Lock } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { getClockInStatus } from "@/lib/actions/staff-clock-in"
import { Button } from "@/components/ui/button"

export default async function GradebookPage({ params, searchParams }: { params: { domain: string }, searchParams: { class_id?: string, subject_id?: string } }) {
    const { domain } = params
    const term = "1st Term"
    const session = "2023/2024"
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Security Audit: Check Clock-In Status & Admin Override
    const [{ data: profile }, { data: tenant }] = await Promise.all([
        supabase.from('profiles').select('role, tenant_id').eq('id', user?.id).single(),
        supabase.from('tenants').select('id').eq('slug', domain).single()
    ])

    const isAdmin = ['admin', 'owner', 'super-admin'].includes(profile?.role || '')
    const clockStatus = await getClockInStatus(undefined, tenant?.id)
    const isAuthorized = isAdmin || (clockStatus.success && clockStatus.data?.clockedIn && clockStatus.data?.verified)

    if (!isAuthorized) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-4 sm:p-10 text-center min-h-[70vh] bg-slate-950">
                <div className="relative mb-6 sm:mb-8">
                    <div className="absolute inset-0 bg-blue-500 opacity-20 blur-[60px] rounded-full animate-pulse" />
                    <div className="relative bg-slate-900/50 border border-white/10 p-5 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] backdrop-blur-3xl shadow-2xl">
                        <Lock className="h-12 w-12 sm:h-16 sm:w-16 text-blue-500" />
                    </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter mb-3 sm:mb-4 uppercase italic">
                    Gradebook <span className="text-blue-500">Locked</span>
                </h2>
                <p className="max-w-md text-slate-400 text-base sm:text-lg font-medium leading-relaxed mb-8 sm:mb-10">
                    Academic scores must be entered while on <strong>Active Duty</strong> at school. Please clock in to access the gradebook.
                </p>
                <div className="flex gap-4">
                    <a href={`/${params.domain}/dashboard/attendance`}>
                        <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 sm:px-8 h-11 sm:h-12 rounded-full shadow-lg shadow-blue-500/20 text-sm sm:text-base">
                            Go to Clock-In
                        </Button>
                    </a>
                </div>
            </div>
        )
    }

    // Fetch valid defaults if params are missing
    let classId = searchParams.class_id
    let subjectId = searchParams.subject_id
    let className = "Selected Class"
    let subjectName = "Selected Subject"

    if (!classId || !subjectId) {
        const { data: firstClass } = await supabase.from('classes').select('id, name').limit(1).single()
        const { data: firstSubject } = await supabase.from('subjects').select('id, name').limit(1).single()

        if (firstClass) {
            classId = classId || firstClass.id
            className = firstClass.name
        }
        if (firstSubject) {
            subjectId = subjectId || firstSubject.id
            subjectName = firstSubject.name
        }
    } else {
        // Fetch names for display if IDs provided
        const { data: c } = await supabase.from('classes').select('name').eq('id', classId).single()
        const { data: s } = await supabase.from('subjects').select('name').eq('id', subjectId).single()
        if (c) className = c.name
        if (s) subjectName = s.name
    }

    if (!classId || !subjectId) {
        return (
            <div className="p-10 flex flex-col items-center justify-center text-center">
                <AlertCircle className="h-10 w-10 text-amber-500 mb-4" />
                <h3 className="text-xl font-bold text-white">No Classes Found</h3>
                <p className="text-slate-400 max-w-md mt-2">
                    Please ensure you have created Classes and Subjects in the Academic Setup.
                </p>
            </div>
        )
    }

    const res = await getClassGrades(classId, subjectId)

    if (!res.success) return <div className="p-10 text-red-500">Failed to load gradebook: {res.error}</div>

    return (
        <div className="p-6">
            <div className="flex flex-col gap-1 mb-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span className="bg-blue-600 w-1 h-8 rounded-full block"></span>
                    Interactive Gradebook
                </h1>
                <p className="text-slate-400 ml-3">
                    {className} • {subjectName} • 1st Term 2023/2024
                </p>
            </div>

            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-200">
                    <p className="font-bold mb-1">Grading Tips:</p>
                    <ul className="list-disc pl-4 space-y-1 opacity-80">
                        <li>Scores save automatically as you type.</li>
                        <li>Cells will glow <span className="text-red-400 font-bold">RED</span> if you exceed the max score (CA=20, Exam=60).</li>
                        <li>Use the ✨ button to let AI write remarks for you.</li>
                    </ul>
                </div>
            </div>

            <GradeEntryGrid
                initialGrades={res.data || []}
                classId={classId}
                subjectId={subjectId}
                domain={domain}
                term={term}
                session={session}
            />
        </div>
    )
}
