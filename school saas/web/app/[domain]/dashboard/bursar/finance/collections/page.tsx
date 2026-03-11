import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CollectionsHub } from "@/components/finance/collections-hub"
import { getDebtorsList, getSettlementTracker } from "@/lib/actions/collections"

export default async function CollectionsPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const [{ data: profile }, { data: permission }] = await Promise.all([
        supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single(),
        supabase.from('staff_permissions').select('can_view_financials').eq('staff_id', user.id).single()
    ])

    const hasAccess = ['admin', 'bursar', 'owner'].includes(profile?.role) || permission?.can_view_financials
    if (!profile || !hasAccess) redirect("/dashboard")

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
