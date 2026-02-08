import { FamilyBillingDetail } from "@/components/billing/family-billing-detail"
import { getFamilyBillingLedger } from "@/lib/actions/parent-portal"

export default async function FamilyBillingPage() {
    const { success, data, error } = await getFamilyBillingLedger()

    if (!success) {
        return (
            <div className="p-10 text-center">
                <h1 className="text-red-500 font-bold">Unable to load billing ledger</h1>
                <p className="text-slate-500 mt-2">{error || "Unknown error occurred"}</p>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8">
            <FamilyBillingDetail familyLedger={data!} />
        </div>
    )
}
