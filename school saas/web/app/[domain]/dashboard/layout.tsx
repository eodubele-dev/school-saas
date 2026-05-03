import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"
import { EmpireTabBar } from "@/components/layout/empire-tab-bar"
import { GlobalUpdateBanner } from "@/components/layout/global-update-banner"
import { getKioskPin } from "@/lib/actions/kiosk"
import { KioskInitializer } from "@/components/providers/kiosk-initializer"
import { createClient } from "@/lib/supabase/server"

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: { domain: string }
}) {
    console.log('[DashboardLayout] params:', params)

    // Fetch Tenant Security Context
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', params.domain)
        .maybeSingle()

    let role = 'student'
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        role = profile?.role || user.app_metadata?.role || 'student'
    }
    
    const isAdmin = ['admin', 'owner', 'super-admin'].includes(role)

    let masterPin = "1234"
    if (tenant?.id) {
        const kioskRes = await getKioskPin(tenant.id)
        if (kioskRes.success) {
            masterPin = kioskRes.pin || "1234"
        }
    }

    return (
        <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
            {/* Security Hydration */}
            <KioskInitializer masterPin={masterPin} />

            {/* Dynamic Evolution Notifications */}
            <GlobalUpdateBanner domain={params.domain} />

            {/* Multi-School Empire Navigation (For Proprietors) */}
            <EmpireTabBar />
            
            <div className="flex flex-1 overflow-hidden">
                <Sidebar domain={params?.domain} className="hidden md:flex border-r border-slate-800" />
                <div className="flex flex-1 flex-col overflow-hidden">
                    <Navbar domain={params?.domain} />
                    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-950">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}
