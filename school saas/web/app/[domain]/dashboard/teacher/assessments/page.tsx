import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GradeEntryGrid } from "@/components/academic/grade-entry-grid"
import { AssignmentsManager } from "@/components/academic/assignments-manager"
import { CBTManager } from "@/components/cbt/cbt-manager"
import { getClassGrades } from "@/lib/actions/gradebook"
import { getAssignments } from "@/lib/actions/assignments"
import { createClient } from "@/lib/supabase/server"
import { BookOpenCheck, FileText, BrainCircuit, Table } from "lucide-react"

export default async function AssessmentHubPage({ params, searchParams }: { params: { domain: string }, searchParams: { class_id?: string, subject_id?: string, tab?: string } }) {
    const supabase = createClient()

    // 1. Fetch Context & Auth parallel
    const [authRes, tenantRes] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('tenants').select('current_term, current_session').eq('slug', params.domain).single()
    ])

    const user = authRes.data.user
    const tenant = tenantRes.data
    const currentTerm = tenant?.current_term || '1st Term'
    const currentSession = tenant?.current_session || '2025/2026'

    // 2. Fetch Profile & Classes/Subjects parallel
    const profilePromise = supabase.from('profiles').select('role').eq('id', user?.id).single()

    let classId = searchParams.class_id
    let subjectId = searchParams.subject_id
    let className = "Selected Class"
    let subjectName = "Selected Subject"

    const contextPromises: Promise<any>[] = [profilePromise]

    if (!classId || !subjectId) {
        contextPromises.push(supabase.from('classes').select('id, name').limit(1).single())
        contextPromises.push(supabase.from('subjects').select('id, name').limit(1).single())
    } else {
        contextPromises.push(supabase.from('classes').select('name').eq('id', classId).single())
        contextPromises.push(supabase.from('subjects').select('name').eq('id', subjectId).single())
    }

    const [profileRes, res1, res2] = await Promise.all(contextPromises)

    const userRole = (profileRes.data?.role || 'teacher').toLowerCase().trim()

    if (!classId || !subjectId) {
        if (res1.data) {
            classId = classId || res1.data.id
            className = res1.data.name
        }
        if (res2.data) {
            subjectId = subjectId || res2.data.id
            subjectName = res2.data.name
        }
    } else {
        if (res1.data) className = res1.data.name
        if (res2.data) subjectName = res2.data.name
    }

    if (!classId || !subjectId) {
        return <div className="p-10 text-center text-slate-400">Please configure Classes and Subjects first.</div>
    }

    // 3. Fetch Data in Parallel
    const [gradesRes, assignmentsRes] = await Promise.all([
        getClassGrades(classId, subjectId, currentTerm, currentSession),
        getAssignments(classId, subjectId)
    ])

    return (
        <div className="p-4 md:p-6 h-[calc(100vh-80px)] flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <BookOpenCheck className="h-8 w-8 text-[var(--school-accent)]" />
                        Assessment Hub
                    </h1>
                    <p className="text-slate-400 ml-10">
                        {className} • {subjectName} • {currentTerm} • {currentSession}
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
                                userRole={userRole}
                                domain={params.domain}
                                term={currentTerm}
                                session={currentSession}
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
