import { checkFeeStatus, getTermResults } from "@/lib/actions/student-results"
import { ResultGatekeeper } from "@/components/student/results/result-gatekeeper"
import { ReportCard } from "@/components/student/results/report-card"
import { PerformanceRadar } from "@/components/student/results/performance-radar"
import { getActiveAcademicSession } from "@/lib/actions/academic"
import { getTenantPaymentStatus } from "@/lib/actions/finance-settings"

export default async function ResultCheckerPage() {
    const { session: activeSession } = await getActiveAcademicSession()

    // Dynamic context fallback
    const term = activeSession?.term || "1st Term"
    const session = activeSession?.session || "2025/2026"

    const feeStatus = await checkFeeStatus(term, session)
    const { grades } = await getTermResults(term, session)

    // Fallback if check fails
    const isPaid = feeStatus.success ? (feeStatus.isPaid ?? false) : true
    const balance = feeStatus.balance || 0

    const paymentStatus = feeStatus.tenantId 
        ? await getTenantPaymentStatus(feeStatus.tenantId) 
        : { isEnabled: false, isConfigured: false }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen bg-slate-950 space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Results</h1>
                    <p className="text-slate-400">Official Term Report & Academic Records.</p>
                </div>
                <div className="text-right hidden md:block">
                    <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Current Session</span>
                    <span className="font-mono text-xl text-white font-bold">{session} / {term}</span>
                </div>
            </div>

            <ResultGatekeeper 
                isPaid={isPaid} 
                balance={balance} 
                studentId={feeStatus.studentId}
                paymentEnabled={paymentStatus.isEnabled && paymentStatus.isConfigured}
            >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3">
                        <ReportCard grades={grades || []} />
                    </div>
                    <div>
                        <PerformanceRadar grades={grades || []} />
                    </div>
                </div>
            </ResultGatekeeper>
        </div>
    )
}
