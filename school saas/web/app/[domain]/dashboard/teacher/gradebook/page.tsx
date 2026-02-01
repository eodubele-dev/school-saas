import { GradeEntryGrid } from "@/components/academic/grade-entry-grid"
import { getClassGrades } from "@/lib/actions/gradebook"
import { AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export default async function GradebookPage({ searchParams }: { searchParams: { class_id?: string, subject_id?: string } }) {
    const supabase = createClient()

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
            />
        </div>
    )
}
