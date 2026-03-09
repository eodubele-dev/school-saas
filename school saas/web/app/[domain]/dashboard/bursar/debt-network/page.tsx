import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DebtNetworkManager } from "@/components/bursar/debt-network-manager"
import { ShieldCheck } from "lucide-react"

export default async function DebtNetworkPage({ params }: { params: { domain: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect(`/${params.domain}/login`)
    }

    // Role check (Admin/Bursar only)
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, tenant_id')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin' && profile?.role !== 'bursar') {
        return <div className="p-8 text-center text-red-500">Access Denied: Only Admins or Bursars can manage Debt Flags.</div>
    }

    // Fetch previously reported flags by this tenant
    const { data: flags } = await supabase
        .from('global_debt_flags')
        .select('*')
        .eq('reporting_tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false })

    return (
        <div className="flex flex-col h-full bg-slate-950">
            {/* Header */}
            <div className="border-b border-white/5 bg-slate-950 p-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Inter-School Clearance Network</h1>
                        <p className="text-slate-400 text-sm">Protect the SaaS ecosystem. Flag chronic debtors and view your active reports.</p>
                    </div>
                </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-8">
                        <h3 className="text-sm font-semibold text-amber-400 mb-1">NDPR & Privacy Notice</h3>
                        <p className="text-xs text-amber-500/80 leading-relaxed">
                            To comply with data protection laws, specific debt amounts and the name of your institution will <b>never</b> be revealed to other schools. Other schools will only receive a generic "High/Medium Confidence" warning if they attempt to admit a parent you have actively flagged here.
                        </p>
                    </div>

                    <DebtNetworkManager initialFlags={flags || []} />
                </div>
            </div>
        </div>
    )
}
