import { Suspense } from "react"
import { getAuditLogs } from "@/lib/actions/audit"
import { AuditFeed } from "@/components/security/audit-feed"
import { ExportReportButton } from "@/components/security/export-report"
import { ShieldCheck, Activity } from "lucide-react"

export const metadata = {
    title: "System Integrity Log | Security",
    description: "Immutable record of all critical system mutations."
}

export default async function AuditLogPage({ params }: { params: { domain: string } }) {
    // Initial Fetch
    const initialLogs = await getAuditLogs(params.domain)

    return (
        <div className="flex flex-col h-full bg-slate-950 p-6 space-y-8 print:bg-white print:text-black">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 print:text-black">
                            System Audit & Integrity Log
                            <span className="inline-flex items-center rounded-full border border-slate-800 bg-slate-900 px-2 py-0.5 text-xs font-medium text-slate-400 print:hidden">
                                <Activity className="mr-1 h-3 w-3 animate-pulse text-emerald-500" />
                                Live Feed
                            </span>
                        </h1>
                    </div>
                    <p className="text-slate-400 max-w-2xl print:text-slate-600">
                        Immutable, real-time feed of all critical system mutations.
                        Red-flagged items require immediate attention.
                    </p>
                </div>
                <div className="print:hidden">
                    <ExportReportButton />
                </div>
            </div>

            {/* Main Feed Region */}
            <div className="rounded-lg border border-slate-900 bg-black/10 p-6 min-h-[600px] print:border-none print:p-0">
                <Suspense fallback={<div className="text-slate-500">Loading audit stream...</div>}>
                    <AuditFeed initialLogs={initialLogs} domain={params.domain} />
                </Suspense>
            </div>

            <div className="text-center text-xs text-slate-700 font-mono pt-8 print:pt-4">
                System Integrity protected by Blue-Horizon Security Protocol.
                <br />
                Log ID: {Date.now().toString(36).toUpperCase()}
            </div>
        </div>
    )
}
