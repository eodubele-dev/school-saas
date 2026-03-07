import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { FeeCategoryManager } from "@/components/finance/fee-category-manager"
import { SmartFeeMatrix } from "@/components/finance/smart-fee-matrix"
import { InvoiceGenerationPanel } from "@/components/finance/invoice-gen-panel"
import { StudentFeeManager } from "@/components/finance/student-fees/student-fee-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function FinancialConfigPage({ params }: { params: { domain: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect(`/${params.domain}/login`)

    // Permission Check
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, tenant_id')
        .eq('id', user.id)
        .single()

    if (!['admin', 'bursar'].includes(profile?.role)) {
        return <div className="p-8 text-center text-red-500">Access Denied: Admin or Bursar only.</div>
    }

    // Fetch Data
    if (!profile?.tenant_id) return <div className="p-8 text-center text-red-500">Error: No Tenant Found</div>

    const [categoriesRes, classesRes, scheduleRes, sessionRes] = await Promise.all([
        supabase.from('fee_categories').select('*').eq('tenant_id', profile.tenant_id).order('created_at'),
        supabase.from('classes').select('id, name').eq('tenant_id', profile.tenant_id).order('name'),
        supabase.from('fee_schedule').select('*').eq('tenant_id', profile.tenant_id),
        supabase.from('academic_sessions').select('*').eq('tenant_id', profile.tenant_id).eq('is_active', true).single()
    ])

    return (
        <div className="bg-slate-950 p-6 min-h-screen space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Financial Configuration</h1>
                    <p className="text-slate-400">Manage fee structures and automated billing.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Left: Quick Actions (Invoice Gen) */}
                <div className="xl:col-span-1 space-y-6">
                    <InvoiceGenerationPanel
                        activeSession={sessionRes.data}
                        domain={params.domain}
                    />
                    {/* Info Card */}
                    <div className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/5 text-sm text-blue-200">
                        <p className="font-bold mb-1">💡 Smart Tip</p>
                        Set up your <strong>Fee Categories</strong> first, then assign amounts in the <strong>Matrix</strong> tabs.
                    </div>
                </div>

                {/* Right: Config Tabs */}
                <div className="xl:col-span-3 min-h-[700px]">
                    <Tabs defaultValue="matrix" className="w-full flex-1">
                        <TabsList className="bg-slate-900 border border-white/10 w-fit mb-6">
                            <TabsTrigger value="matrix" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-slate-400 transition-colors duration-200">Smart Fee Matrix</TabsTrigger>
                            <TabsTrigger value="categories" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 text-slate-400 transition-colors duration-200">Fee Categories</TabsTrigger>
                            <TabsTrigger value="exceptions" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 text-slate-400 transition-colors duration-200">Student Exceptions</TabsTrigger>
                        </TabsList>

                        <TabsContent value="matrix" className="m-0 border-0 outline-none">
                            <SmartFeeMatrix
                                classes={classesRes.data || []}
                                categories={categoriesRes.data || []}
                                schedule={scheduleRes.data || []}
                                domain={params.domain}
                            />
                        </TabsContent>

                        <TabsContent value="categories" className="m-0 border-0 outline-none">
                            <FeeCategoryManager
                                categories={categoriesRes.data || []}
                                domain={params.domain}
                            />
                        </TabsContent>

                        <TabsContent value="exceptions" className="m-0 border-0 outline-none">
                            <StudentFeeManager domain={params.domain} classes={classesRes.data || []} />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
