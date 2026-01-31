import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SessionManager } from "@/components/academic/session-manager"
import { GradingConfig } from "@/components/academic/grading-config"
import { SubjectManager } from "@/components/academic/subject-manager"
import { AlertCircle } from "lucide-react"

export default async function AcademicSetupPage({ params }: { params: { domain: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect(`/${params.domain}/login`)

    // Admin Check
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, tenant_id')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return <div className="p-8 text-center text-red-500">Access Denied</div>
    }

    // Fetch Data Parallel
    const [sessionRes, gradesRes, subjectsRes, classesRes] = await Promise.all([
        supabase.from('academic_sessions').select('*').eq('tenant_id', profile.tenant_id).eq('is_active', true).single(),
        supabase.from('grade_scales').select('*').eq('tenant_id', profile.tenant_id).order('min_score', { ascending: false }),
        supabase.from('subjects').select('*').eq('tenant_id', profile.tenant_id).order('name'),
        supabase.from('classes').select('*').eq('tenant_id', profile.tenant_id).order('name')
    ])

    return (
        <div className="bg-slate-950 p-6 min-h-screen space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Academic Configuration</h1>
                    <p className="text-slate-400">Manage sessions, grading systems, and curriculum.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Session & Assessment (Assessment simplified into Session for layout balance or separate if needed) */}
                <div className="space-y-6 lg:col-span-1">
                    <SessionManager
                        currentSession={sessionRes.data}
                        domain={params.domain}
                    />

                    {/* CA Weighting Tiny Card */}
                    <div className="rounded-lg border border-white/10 bg-slate-900 p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-[var(--school-accent)]" />
                            <h3 className="font-semibold text-white">Assessment Weights</h3>
                        </div>
                        <p className="text-xs text-slate-400 mb-4">
                            Define the ratio for CA vs Exam scores.
                        </p>
                        {/* Placeholder slider until backend ready */}
                        <div className="flex items-center justify-between text-sm font-medium mb-1">
                            <span className="text-blue-400">CA: 40%</span>
                            <span className="text-emerald-400">Exam: 60%</span>
                        </div>
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden flex">
                            <div className="h-full bg-blue-500 w-[40%]"></div>
                            <div className="h-full bg-emerald-500 w-[60%]"></div>
                        </div>
                    </div>
                </div>

                {/* Middle: Subject Manager */}
                <div className="lg:col-span-1 h-[600px]">
                    <SubjectManager
                        subjects={subjectsRes.data || []}
                        classes={classesRes.data || []}
                        domain={params.domain}
                    />
                </div>

                {/* Right: Grading Config */}
                <div className="lg:col-span-1 h-[600px]">
                    <GradingConfig
                        initialScales={gradesRes.data || []}
                        domain={params.domain}
                    />
                </div>
            </div>
        </div>
    )
}
