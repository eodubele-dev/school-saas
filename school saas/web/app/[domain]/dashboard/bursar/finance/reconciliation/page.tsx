import { getLiveReconciliationStats } from "@/lib/actions/bursar"
import { BursarReconciliationDashboard } from "@/components/bursar/finance/bursar-reconciliation-dashboard"
import { ShieldAlert } from "lucide-react"

export default async function BursarReconciliationLivePage() {
    const res = await getLiveReconciliationStats()

    if (!res.success || !res.data) {
        return (
            <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center text-white">
                <h2 className="font-bold uppercase tracking-widest text-lg text-slate-300">Live Oversight Offline</h2>
                <p className="text-slate-500 text-sm mt-2">Could not synchronize with the System Audit Log.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <BursarReconciliationDashboard liveStats={res.data} />
        </div>
    )
}
