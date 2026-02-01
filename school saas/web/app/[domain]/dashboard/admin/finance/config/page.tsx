import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { FeeCategoryManager } from "@/components/finance/fee-category-manager"
import { SmartFeeMatrix } from "@/components/finance/smart-fee-matrix"
import { InvoiceGenerationPanel } from "@/components/finance/invoice-gen-panel"
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
                <div className="xl:col-span-3 h-[700px]">
                    <Tabs defaultValue="matrix" className="h-full flex flex-col">
                        <TabsList className="bg-slate-900 border border-white/10 w-fit">
                            <TabsTrigger value="matrix">Smart Fee Matrix</TabsTrigger>
                            <TabsTrigger value="categories">Fee Categories</TabsTrigger>
                        </TabsList>

                        <TabsContent value="matrix" className="flex-1 mt-4 h-full">
                            <SmartFeeMatrix
                                classes={classesRes.data || []}
                                categories={categoriesRes.data || []}
                                schedule={scheduleRes.data || []}
                                domain={params.domain}
                            />
                        </TabsContent>

                        <TabsContent value="categories" className="flex-1 mt-4 h-full">
                            <FeeCategoryManager
                                categories={categoriesRes.data || []}
                                domain={params.domain}
                            />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
