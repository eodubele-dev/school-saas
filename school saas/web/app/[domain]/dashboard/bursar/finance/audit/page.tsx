import { getBursaryAuditTrail } from "@/lib/actions/bursar"
import { BursaryAuditTrail } from "@/components/bursar/finance/bursary-audit-trail"
import { ShieldAlert } from "lucide-react"

export default async function BursaryAuditPage() {
    const currentDate = new Date()
    const month = currentDate.toLocaleString('default', { month: 'long' })
    const year = currentDate.getFullYear()

    // Calculate days in the current month for the period string
    const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate()

    const res = await getBursaryAuditTrail(month, year)

    if (!res.success || !res.data) {
        return (
            <div className="p-8 text-center min-h-[60vh] flex flex-col items-center justify-center">
                <ShieldAlert className="h-12 w-12 text-slate-800 mb-4" />
                <h2 className="text-white font-bold uppercase tracking-widest text-lg">Forensic Audit Unavailable</h2>
                <p className="text-slate-500 text-sm mt-2">Could not retrieve audit trail data for {month} {year}.</p>
            </div>
        )
    }

    return (
        <div className="p-8 min-h-screen">
            <BursaryAuditTrail
                institutionName={res.data.institutionName}
                bursarName={res.data.bursarName}
                proprietorName={res.data.proprietorName}
                auditId={`AT-2026-${month.toUpperCase().slice(0, 3)}-${Math.floor(Math.random() * 9000) + 1000}`}
                period={`${month} 1, ${year} – ${month} ${daysInMonth}, ${year}`}
                stats={res.data.stats}
                ledger={res.data.ledger}
            />
        </div>
    )
}
