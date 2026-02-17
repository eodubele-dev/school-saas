import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/server"
import { BookOpen, FileText, Sparkles, Table, Clock, Archive } from "lucide-react"
import { TeacherLessonPublisher } from "@/components/dashboard/teacher-lesson-publisher"
import { LessonGenerator } from "@/components/academic/lesson-generator"
import { LessonArchive } from "@/components/academic/lesson-archive"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getTeacherClasses } from "@/lib/actions/classes"
import { getLessonPlans } from "@/lib/actions/lesson-plan"

// Error Boundary Component (Internal)
function ErrorFallback({ error }: { error: any }) {
    return (
        <div className="h-full flex flex-col items-center justify-center p-10 text-center bg-slate-950">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-red-500 opacity-20 blur-[60px] rounded-full animate-pulse" />
                <div className="relative bg-slate-900/50 border border-red-500/20 p-6 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl">
                    <BookOpen className="h-16 w-16 text-red-500" />
                </div>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter mb-4 uppercase italic">
                System <span className="text-red-500">Error</span>
            </h2>
            <p className="max-w-md text-slate-400 text-lg font-medium leading-relaxed mb-10">
                We encountered an unexpected issue while loading your lesson plans.
            </p>
            <div className="bg-red-950/30 border border-red-500/20 p-4 rounded-xl text-left font-mono text-xs text-red-300 w-full max-w-lg overflow-auto">
                <p className="font-bold mb-2">Error Details:</p>
                {error?.message || JSON.stringify(error)}
            </div>
        </div>
    )
}

export default async function LessonPlansPage({ params, searchParams }: { params: { domain: string }, searchParams: { class_id?: string, subject_id?: string, tab?: string, edit_id?: string } }) {
    const supabase = createClient()
    console.log("[LessonPlansPage] Start render for domain:", params.domain)

    try {
        // 1. Fetch Auth & Profile
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            console.log("[LessonPlansPage] No user found")
            return <div className="p-10 text-center text-slate-400">Authentication failure. Please log in again.</div>
        }

        const { data: profileResponse, error: profileError } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()

        if (profileError || !profileResponse) {
            console.error("[LessonPlansPage] Profile Error:", profileError)
            throw new Error("Failed to fetch user profile: " + (profileError?.message || "Unknown"))
        }

        const tenantId = profileResponse.tenant_id
        console.log("[LessonPlansPage] Tenant ID:", tenantId)

        if (!tenantId) {
            return <div className="p-10 text-center text-slate-400">Profile configuration error. Tenant ID missing.</div>
        }

        // 2. Fetch Active Session and Allocations (Context Resolution)
        console.log("[LessonPlansPage] Fetching data promises...")
        const [sessionRes, allocsRes, subjAssignRes, teacherClassesRes, lessonPlansRes] = await Promise.all([
            supabase.from('academic_sessions').select('session, term').eq('tenant_id', tenantId).eq('is_active', true).maybeSingle(),
            supabase.from('teacher_allocations').select('class_id, subject, classes(name)').eq('teacher_id', user.id).limit(1).maybeSingle(),
            supabase.from('subject_assignments').select('class_id, subject, classes(name)').eq('teacher_id', user.id).limit(1).maybeSingle(),
            getTeacherClasses(),
            getLessonPlans()
        ])
        console.log("[LessonPlansPage] Data resolved.")

        // Check for specific API failures
        if (!teacherClassesRes.success) console.warn("Teacher Classes Warning:", teacherClassesRes)
        if (!lessonPlansRes.success) console.warn("Lesson Plans Warning:", lessonPlansRes)

        let activeSession = sessionRes.data
        // Fallback Session
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

        let classId = searchParams.class_id || undefined
        let subjectId = searchParams.subject_id || undefined
        let className = "Unknown Class"
        let subjectName = "Unknown Subject"

        // 3. Resolve Context (Copied from Assessment Hub)
        if (!classId || !subjectId) {
            const alloc = (allocsRes.data || subjAssignRes.data) as any
            if (alloc) {
                classId = classId || alloc.class_id
                className = Array.isArray(alloc.classes) ? alloc.classes[0]?.name : alloc.classes?.name || className
                subjectName = alloc.subject
            }
        }

        // If we have IDs but missing names
        if (classId && (className === "Unknown Class")) {
            const { data: cls } = await supabase.from('classes').select('name').eq('id', classId).single()
            if (cls) className = cls.name
        }

        // Quick fix if subjectId is missing but we have name from alloc
        if (!classId || !subjectName || subjectName === "Unknown Subject") {
            return (
                <div className="h-full flex flex-col items-center justify-center p-10 text-center">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-indigo-500 opacity-20 blur-[60px] rounded-full animate-pulse" />
                        <div className="relative bg-slate-900/50 border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl">
                            <BookOpen className="h-16 w-16 text-indigo-500" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-white tracking-tighter mb-4 uppercase italic">
                        Missing <span className="text-indigo-500">Class Context</span>
                    </h2>

                    <p className="max-w-md text-slate-400 text-lg font-medium leading-relaxed mb-10">
                        We couldn't resolve your active class or subject for lesson planning.
                    </p>

                    <div className="grid grid-cols-1 gap-6 w-full max-w-md text-left mb-12">
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
                            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                                Teaching Allocation
                            </h3>
                            <p className="text-xs text-slate-400">Verify that your profile is <strong>assigned to at least one class</strong> in the Staff Management Hub.</p>
                        </div>
                    </div>
                </div>
            )
        }

        // 4. Fetch Published Lessons for this Class/Subject (Lesson Library)
        const { data: publishedLessons } = await supabase
            .from('lessons')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('subject', subjectName)
            .order('week', { ascending: true })

        const archivedPlans = lessonPlansRes.success ? lessonPlansRes.data : []

        // 5. Handle Edit Mode
        const editId = searchParams.edit_id
        const editPlan = editId ? archivedPlans?.find((p: any) => p.id === editId) : null

        return (
            <div className="p-4 md:p-6 h-[calc(100vh-80px)] flex flex-col bg-slate-950">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <BookOpen className="h-8 w-8 text-indigo-500" />
                            Lesson Planning
                        </h1>
                        <p className="text-slate-400 ml-10 flex items-center gap-2 text-sm">
                            <span className="text-white font-bold">{className}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-white font-bold">{subjectName}</span>
                            <span className="text-slate-600">•</span>
                            <span>{currentTerm}</span>
                        </p>
                    </div>
                </div>

                <Tabs defaultValue={searchParams.tab || "ai"} className="flex-1 flex flex-col">
                    <TabsList className="bg-slate-900 border border-white/10 w-full md:w-auto p-1 self-start mb-6">
                        <TabsTrigger value="ai" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                            <Sparkles className="h-4 w-4 mr-2" /> AI Generator
                        </TabsTrigger>
                        <TabsTrigger value="archive" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                            <Archive className="h-4 w-4 mr-2" /> Archives & Approval
                        </TabsTrigger>
                        <TabsTrigger value="publish" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                            <FileText className="h-4 w-4 mr-2" /> Publisher
                        </TabsTrigger>
                        <TabsTrigger value="library" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                            <Table className="h-4 w-4 mr-2" /> Digital Locker ({publishedLessons?.length || 0})
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: AI Generator (Main Tool) */}
                    <TabsContent value="ai" className="flex-1 mt-0 h-full">
                        <div className="h-full">
                            <LessonGenerator
                                teacherClasses={teacherClassesRes.data || []}
                                initialPlan={editPlan as any}
                            />
                        </div>
                    </TabsContent>

                    {/* Tab 2: Lesson Archive (History & Approval) */}
                    <TabsContent value="archive" className="flex-1 mt-0">
                        <LessonArchive
                            plans={archivedPlans as any[]}
                            onEdit={async () => { "use server" }}
                        />
                    </TabsContent>

                    {/* Tab 3: Publisher (The Widget) */}
                    <TabsContent value="publish" className="flex-1 mt-0 max-w-4xl">
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <TeacherLessonPublisher
                                    classId={classId}
                                    subject={subjectName}
                                />
                            </div>
                            <div className="space-y-6">
                                <div className="bg-indigo-900/10 border border-indigo-500/20 p-6 rounded-xl">
                                    <h3 className="text-indigo-400 font-bold mb-2 flex items-center gap-2">
                                        <Clock className="h-4 w-4" /> Quick Tips
                                    </h3>
                                    <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
                                        <li>Lessons published here appear <strong>instantly</strong> in the Student Digital Locker.</li>
                                        <li>Use the <strong>Week</strong> selector to organize content chronologically.</li>
                                        <li>You can copy-paste content from the AI Generator tab.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tab 4: Library (View what's live) */}
                    <TabsContent value="library" className="flex-1 mt-0">
                        <div className="bg-slate-900/50 border border-white/5 rounded-xl p-6 h-full overflow-hidden flex flex-col">
                            <h3 className="text-white font-bold mb-4">Published Lessons (Student View)</h3>
                            <ScrollArea className="flex-1">
                                <div className="space-y-3">
                                    {publishedLessons && publishedLessons.length > 0 ? publishedLessons.map((lesson) => (
                                        <div key={lesson.id} className="flex items-center justify-between p-4 bg-slate-950 border border-white/5 rounded-lg hover:border-indigo-500/30 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-mono text-xs font-bold">
                                                    W{lesson.week}
                                                </div>
                                                <div>
                                                    <h4 className="text-slate-200 font-bold text-sm">{lesson.title}</h4>
                                                    <p className="text-xs text-slate-500">{lesson.topics?.join(', ') || 'No topics listed'}</p>
                                                </div>
                                            </div>
                                            <div className="text-xs font-mono text-slate-600">
                                                {new Date(lesson.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-10 text-center text-slate-500 italic">No lessons published yet. Go to the 'Publisher' tab to create one.</div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        )

    } catch (error: any) {
        console.error("CRITICAL PAGE ERROR:", error)
        return <ErrorFallback error={error} />
    }
}
