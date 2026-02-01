import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CollectionsHub } from "@/components/finance/collections-hub"
import { getDebtorsList, getSettlementTracker } from "@/lib/actions/collections"

export default async function CollectionsPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (!profile || !['admin', 'bursar'].includes(profile.role)) redirect("/dashboard")

    // Initial Data Fetch
    const [debtors, settlements, sessions] = await Promise.all([
        getDebtorsList({}),
        getSettlementTracker(),
        supabase.from('academic_sessions').select('*').eq('tenant_id', profile.tenant_id).order('session', { ascending: false })
    ])

    return (
        <div className="bg-slate-950 min-h-screen">
            <CollectionsHub
                initialDebtors={debtors}
                initialSettlements={settlements}
                sessions={sessions.data || []}
            />
        </div>
    )
}
