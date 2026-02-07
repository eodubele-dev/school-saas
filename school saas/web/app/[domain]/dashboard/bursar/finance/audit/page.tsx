import { getBursaryAuditTrail } from "@/lib/actions/bursar"
import { BursaryAuditTrail } from "@/components/bursar/finance/bursary-audit-trail"
import { ShieldAlert } from "lucide-react"

export default async function BursaryAuditPage() {
    // For demo/initial view, we target February 2026 as per the user's current context
    const month = "February"
    const year = 2026

    const res = await getBursaryAuditTrail(month, year)

    if (!res.success || !res.data) {
        return (
            <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
                <ShieldAlert className="h-12 w-12 text-slate-800 mb-4" />
                <h2 className="text-white font-black uppercase tracking-widest text-lg">Forensic_Audit_Unavailable</h2>
                <p className="text-slate-500 text-sm mt-2">Could not retrieve audit trail data for {month} {year}.</p>
            </div>
        )
    }

    return (
        <div className="p-8 bg-[#050505] min-h-screen">
            <BursaryAuditTrail
                auditId={`AT-2026-${month.toUpperCase().slice(0, 3)}-${Math.floor(Math.random() * 9000) + 1000}`}
                period={`${month} 1, ${year} – ${month} 28, ${year}`}
                stats={res.data.stats}
                ledger={res.data.ledger}
            />
        </div>
    )
}
