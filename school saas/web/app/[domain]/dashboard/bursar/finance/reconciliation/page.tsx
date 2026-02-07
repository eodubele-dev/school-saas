import { getLiveReconciliationStats } from "@/lib/actions/bursar"
import { BursarReconciliationDashboard } from "@/components/bursar/finance/bursar-reconciliation-dashboard"
import { ShieldAlert } from "lucide-react"

export default async function BursarReconciliationLivePage() {
    const res = await getLiveReconciliationStats()

    if (!res.success || !res.data) {
        return (
            <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center bg-[#050505] text-white">
                <ShieldAlert className="h-12 w-12 text-slate-800 mb-4" />
                <h2 className="font-black uppercase tracking-widest text-lg">Live_Oversight_Offline</h2>
                <p className="text-slate-500 text-sm mt-2">Could not synchronize with the System Audit Log.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#050505]">
            <BursarReconciliationDashboard liveStats={res.data} />
        </div>
    )
}
