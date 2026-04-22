import { getFamilyBillingLedger } from "@/lib/actions/parent-portal"
import { getTenantPaymentStatus } from "@/lib/actions/finance-settings"
import { createClient } from "@/lib/supabase/server"
import { FamilyBillingDetail } from "@/components/billing/family-billing-detail"

export default async function FamilyBillingPage({ params }: { params: { domain: string } }) {
    const { success, data, error } = await getFamilyBillingLedger()

    if (!success) {
        return (
            <div className="p-10 text-center">
                <h1 className="text-red-500 font-bold">Unable to load billing ledger</h1>
                <p className="text-slate-500 mt-2">{error || "Unknown error occurred"}</p>
            </div>
        )
    }

    const supabase = createClient()
    const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', params.domain).single()
    const paymentStatus = tenant ? await getTenantPaymentStatus(tenant.id) : { isEnabled: false, isConfigured: false }

    return (
        <div className="p-4 md:p-8">
            <FamilyBillingDetail 
                familyLedger={data!} 
                domain={params.domain} 
                paymentStatus={paymentStatus}
            />
        </div>
    )
}
