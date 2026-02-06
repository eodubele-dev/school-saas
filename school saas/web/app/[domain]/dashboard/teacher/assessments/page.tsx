import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GradeEntryGrid } from "@/components/academic/grade-entry-grid"
import { AssignmentsManager } from "@/components/academic/assignments-manager"
import { CBTManager } from "@/components/cbt/cbt-manager"
import { getClassGrades } from "@/lib/actions/gradebook"
import { getAssignments } from "@/lib/actions/assignments"
import { createClient } from "@/lib/supabase/server"
import { BookOpenCheck, FileText, BrainCircuit, Table } from "lucide-react"

export default async function AssessmentHubPage({ searchParams }: { searchParams: { class_id?: string, subject_id?: string, tab?: string } }) {
    const supabase = createClient()

    // 1. Fetch Context (Class/Subject)
    let classId = searchParams.class_id
    let subjectId = searchParams.subject_id
    let className = "Selected Class"
    let subjectName = "Selected Subject"

    // Default params if missing (Same logic as old Gradebook)
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
        const { data: c } = await supabase.from('classes').select('name').eq('id', classId).single()
        const { data: s } = await supabase.from('subjects').select('name').eq('id', subjectId).single()
        if (c) className = c.name
        if (s) subjectName = s.name
    }

    if (!classId || !subjectId) {
        return <div className="p-10 text-center text-slate-400">Please configure Classes and Subjects first.</div>
    }

    // 2. Fetch Data
    const gradesRes = await getClassGrades(classId, subjectId)
    const assignmentsRes = await getAssignments(classId, subjectId)

    return (
        <div className="p-4 md:p-6 h-[calc(100vh-80px)] flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <BookOpenCheck className="h-8 w-8 text-[var(--school-accent)]" />
                        Assessment Hub
                    </h1>
                    <p className="text-slate-400 ml-10">
                        {className} • {subjectName} • 1st Term
                    </p>
                </div>
            </div>

            <Tabs defaultValue={searchParams.tab || "gradebook"} className="flex-1 flex flex-col">
                <TabsList className="bg-slate-900 border border-white/10 w-full md:w-auto p-1 self-start mb-6">
                    <TabsTrigger value="gradebook" className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-white">
                        <Table className="h-4 w-4 mr-2" /> Gradebook
                    </TabsTrigger>
                    <TabsTrigger value="assignments" className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-white">
                        <FileText className="h-4 w-4 mr-2" /> Assignments
                    </TabsTrigger>
                    <TabsTrigger value="cbt" className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-white">
                        <BrainCircuit className="h-4 w-4 mr-2" /> CBT / Quizzes
                    </TabsTrigger>
                </TabsList>

                {/* Tab 1: Gradebook */}
                <TabsContent value="gradebook" className="flex-1 mt-0">
                    <div className="bg-slate-950/50 border border-white/5 rounded-xl p-1 h-full">
                        {gradesRes.success ? (
                            <GradeEntryGrid
                                initialGrades={gradesRes.data || []}
                                classId={classId}
                                subjectId={subjectId}
                            />
                        ) : (
                            <div className="text-red-400 p-4">Failed to load grades</div>
                        )}
                    </div>
                </TabsContent>

                {/* Tab 2: Assignments */}
                <TabsContent value="assignments" className="flex-1 mt-0">
                    <AssignmentsManager
                        classId={classId}
                        subjectId={subjectId}
                        assignments={assignmentsRes.success ? assignmentsRes.data || [] : []}
                    />
                </TabsContent>

                {/* Tab 3: CBT */}
                <TabsContent value="cbt" className="flex-1 mt-0 h-full">
                    <CBTManager
                        classId={classId}
                        subjectId={subjectId}
                        className={className}
                        subjectName={subjectName}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
