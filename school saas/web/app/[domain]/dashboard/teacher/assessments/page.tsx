import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { GradeEntryGrid } from "@/components/academic/grade-entry-grid"
import { AssignmentsManager } from "@/components/academic/assignments-manager"
import { CBTManager } from "@/components/cbt/cbt-manager"
import { getClassGrades } from "@/lib/actions/gradebook"
import { getAssignments } from "@/lib/actions/assignments"
import { createClient } from "@/lib/supabase/server"
import { getClockInStatus } from "@/lib/actions/staff-clock-in"
import { BookOpenCheck, FileText, BrainCircuit, Table, AlertCircle, Lock } from "lucide-react"

export default async function AssessmentHubPage({ params, searchParams }: { params: { domain: string }, searchParams: { class_id?: string, subject_id?: string, tab?: string } }) {
    const supabase = createClient()

    // 1. Fetch Auth & Profile
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return <div className="p-10 text-center text-slate-400">Authentication failure. Please log in again.</div>
    }

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    const tenantId = profile?.tenant_id

    if (!tenantId) {
        return <div className="p-10 text-center text-slate-400">Profile configuration error. Tenant ID missing.</div>
    }

    // 2. Fetch Active Session and Teacher Allocations parallel
    const [sessionRes, allocsRes, subjAssignRes] = await Promise.all([
        supabase.from('academic_sessions').select('session, term').eq('tenant_id', tenantId).eq('is_active', true).maybeSingle(),
        supabase.from('teacher_allocations').select('class_id, subject, classes(name)').eq('teacher_id', user.id).limit(1).maybeSingle(),
        supabase.from('subject_assignments').select('class_id, subject, classes(name)').eq('teacher_id', user.id).limit(1).maybeSingle()
    ])

    const userRole = (profile?.role || 'teacher').toLowerCase().trim()
    let activeSession = sessionRes.data

    // Fallback: If no active session found, try to get the most recent one
    if (!activeSession) {
        const { data: fallbackSession } = await supabase
            .from('academic_sessions')
            .select('session, term')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
        activeSession = fallbackSession
    }

    const currentTerm = activeSession?.term || 'N/A'
    const currentSession = activeSession?.session || 'N/A'

    let classId = searchParams.class_id
    let subjectId = searchParams.subject_id
    let className = "Unknown Class"
    let subjectName = "Unknown Subject"

    // 3. Resolve Class & Subject Context
    if (!classId || !subjectId) {
        // Use default allocation if available
        const alloc = (allocsRes.data || subjAssignRes.data) as any
        if (alloc) {
            classId = classId || alloc.class_id
            className = Array.isArray(alloc.classes) ? alloc.classes[0]?.name : alloc.classes?.name || className

            // If we have a subject name but no subjectId UUID, we need to find the subject UUID
            const subjectNameFromAlloc = alloc.subject
            const { data: sub } = await supabase
                .from('subjects')
                .select('id, name')
                .eq('tenant_id', tenantId)
                .eq('name', subjectNameFromAlloc)
                .maybeSingle()

            if (sub) {
                subjectId = sub.id
                subjectName = sub.name
            } else {
                subjectId = subjectId || subjectNameFromAlloc
                subjectName = subjectNameFromAlloc
            }
        }
    }

    // If we have IDs but still need names (or if subjectName is still Unknown)
    if (classId && subjectId && (className === "Unknown Class" || subjectName === "Unknown Subject")) {
        const [clsRes, subRes] = await Promise.all([
            supabase.from('classes').select('name').eq('id', classId).single(),
            supabase.from('subjects').select('name').eq('id', subjectId).maybeSingle()
        ])
        if (clsRes.data) className = clsRes.data.name
        if (subRes.data) subjectName = subRes.data.name
    }

    if (!classId || !subjectId || currentTerm === 'N/A') {
        return (
            <div className="h-full flex flex-col items-center justify-center p-10 text-center">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-[var(--school-accent)] opacity-20 blur-[60px] rounded-full animate-pulse" />
                    <div className="relative bg-slate-900/50 border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl">
                        <BookOpenCheck className="h-16 w-16 text-[var(--school-accent)]" />
                    </div>
                </div>

                <h2 className="text-3xl font-black text-white tracking-tighter mb-4 uppercase italic">
                    Missing <span className="text-[var(--school-accent)]">Assessment Context</span>
                </h2>

                <p className="max-w-md text-slate-400 text-lg font-medium leading-relaxed mb-10">
                    We couldn't resolve your active class or academic session.
                    This usually happens when there's no active session configured for the school.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl text-left mb-12">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                        <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-cyan-500" /> Administrative Check
                        </h3>
                        <p className="text-xs text-slate-400">Ensure the Command Center has an <strong>Active Academic Session</strong> set up for the current year.</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                        <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500" /> Teaching Allocation
                        </h3>
                        <p className="text-xs text-slate-400">Verify that your profile is <strong>assigned to at least one class</strong> in the Staff Management Hub.</p>
                    </div>
                </div>

                <details className="w-full max-w-xs group transition-all">
                    <summary className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 cursor-pointer hover:text-slate-300 transition-colors list-none flex items-center justify-center gap-2 outline-none">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-800 group-open:bg-cyan-500 transition-colors" />
                        System Diagnostics
                    </summary>
                    <div className="mt-4 p-4 bg-black/40 border border-white/5 rounded-xl text-[10px] font-mono text-left animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-2">
                            <span className="text-slate-600">ID_VERIFICATION:</span>
                            <span className="text-cyan-500">COMPLETE</span>
                        </div>
                        <p className="mb-1"><span className="text-slate-500">TENANT:</span> <span className="text-slate-300">{tenantId.slice(0, 8)}...</span></p>
                        <p className="mb-1"><span className="text-slate-500">SESSION:</span> <span className="text-slate-300">{currentSession}</span></p>
                        <p className="mb-1"><span className="text-slate-500">TERM:</span> <span className="text-slate-300">{currentTerm}</span></p>
                        <p className="mb-1"><span className="text-slate-500">CLASS:</span> <span className={classId ? "text-slate-300" : "text-amber-500"}>{classId ? 'DETECTED' : 'MISSING_LINK'}</span></p>
                        <p className="mb-1"><span className="text-slate-500">SUBJECT:</span> <span className={subjectName !== "Unknown Subject" ? "text-slate-300" : "text-amber-500"}>{subjectName}</span></p>
                    </div>
                </details>
            </div>
        )
    }

    // 4. Fetch Grades & Assignments in Parallel
    const [gradesRes, assignmentsRes, clockStatus] = await Promise.all([
        getClassGrades(classId, subjectId, currentTerm, currentSession),
        getAssignments(classId, subjectId),
        getClockInStatus(undefined, tenantId)
    ])

    const isAdmin = ['admin', 'owner', 'super-admin'].includes(userRole)
    const isClockedIn = isAdmin || (clockStatus.success && clockStatus.data?.clockedIn)

    if (!isClockedIn) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-10 text-center">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-amber-500 opacity-20 blur-[60px] rounded-full animate-pulse" />
                    <div className="relative bg-slate-900/50 border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl">
                        <Lock className="h-16 w-16 text-amber-500" />
                    </div>
                </div>

                <h2 className="text-3xl font-black text-white tracking-tighter mb-4 uppercase italic">
                    Assessment <span className="text-amber-500">Locked</span>
                </h2>

                <p className="max-w-md text-slate-400 text-lg font-medium leading-relaxed mb-10">
                    You must be actively <strong>Clocked In</strong> at your school location to access the Assessment Hub.
                </p>

                <div className="flex gap-4">
                    <a href={`/${params.domain}/dashboard/attendance`}>
                        <Button className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-8 h-12 rounded-full">
                            Go to Clock-In
                        </Button>
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div className="p-3 sm:p-4 md:p-6 h-screen max-h-[calc(100vh-64px)] sm:max-h-[calc(100vh-80px)] flex flex-col">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 sm:mb-6 gap-4">
                <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                        <BookOpenCheck className="h-6 w-6 sm:h-8 sm:w-8 text-[var(--school-accent)]" />
                        Assessment Hub
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] sm:text-xs text-slate-400 pl-8 sm:pl-10 font-medium">
                        <span className="truncate max-w-[150px] sm:max-w-none">{className}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-800" />
                        <span className="truncate max-w-[150px] sm:max-w-none">{subjectName}</span>
                        <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-800" />
                        <span className="hidden sm:inline">{currentTerm}</span>
                        <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-800" />
                        <span className="hidden sm:inline">{currentSession}</span>
                    </div>
                </div>
            </div>

            <Tabs defaultValue={searchParams.tab || "gradebook"} className="flex-1 flex flex-col min-h-0">
                <TabsList className="bg-slate-900 border border-white/10 w-full sm:w-auto p-1.5 self-start mb-6 flex overflow-x-auto scrollbar-hide items-center justify-start sm:justify-center gap-1">
                    <TabsTrigger value="gradebook" className="shrink-0 data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-white text-[10px] sm:text-sm px-4 sm:px-6 h-8 sm:h-10 rounded-lg transition-all duration-300">
                        <Table className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" /> Gradebook
                    </TabsTrigger>
                    <TabsTrigger value="assignments" className="shrink-0 data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-white text-[10px] sm:text-sm px-4 sm:px-6 h-8 sm:h-10 rounded-lg transition-all duration-300">
                        <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" /> Assignments
                    </TabsTrigger>
                    <TabsTrigger value="cbt" className="shrink-0 data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-white text-[10px] sm:text-sm px-4 sm:px-6 h-8 sm:h-10 rounded-lg transition-all duration-300">
                        <BrainCircuit className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" /> CBT / Quizzes
                    </TabsTrigger>
                </TabsList>

                {/* Tab 1: Gradebook */}
                <TabsContent value="gradebook" className="flex-1 mt-0">
                    <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3 max-w-3xl">
                        <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-200/90 leading-relaxed">
                            <strong className="text-amber-400">Note:</strong> Grades entered here are securely saved to the database. At the end of the term, these academic scores are automatically combined with your Behavioral Evaluations (End of Term Eval) and sent to the Principal for approval before the final Result Sheet is published.
                        </div>
                    </div>
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
