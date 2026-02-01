
import { getPendingApprovals } from "@/lib/actions/approvals"
import { ApprovalQueue } from "@/components/admin/approval-queue"
import { ComplianceAnalytics } from "@/components/admin/compliance-analytics"
import { ShieldCheck } from "lucide-react"

export default async function ApprovalsPage() {
    const res = await getPendingApprovals()

    return (
        <div className="h-[calc(100vh-80px)] p-6 md:p-8 flex flex-col animate-in fade-in duration-700">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                        <ShieldCheck className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Academic Approvals</h1>
                        <p className="text-slate-400 text-xs mt-0.5">Admin & HOD Vetting Portal</p>
                    </div>
                </div>
                <ComplianceAnalytics />
            </div>

            <div className="flex-1 min-h-0">
                <ApprovalQueue initialItems={res.data || []} />
            </div>
        </div>
    )
}
