import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"
import { EmpireTabBar } from "@/components/layout/empire-tab-bar"
import { GlobalUpdateBanner } from "@/components/layout/global-update-banner"
import { getKioskPin } from "@/lib/actions/kiosk"
import { KioskInitializer } from "@/components/providers/kiosk-initializer"
import { createClient } from "@/lib/supabase/server"
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav"

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: { domain: string }
}) {
    try {
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
            <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30 overflow-hidden">
                {/* Security Hydration */}
                <KioskInitializer masterPin={masterPin} />

                {/* Dynamic Evolution Notifications */}
                <GlobalUpdateBanner domain={params.domain} />

                {/* Multi-School Empire Navigation (For Proprietors) */}
                <div className="hidden md:block">
                    <EmpireTabBar />
                </div>
                
                <div className="flex flex-1 overflow-hidden relative">
                    <Sidebar domain={params?.domain} className="hidden lg:flex border-r border-slate-800" />
                    
                    <div className="flex flex-1 flex-col overflow-hidden">
                        <Navbar domain={params?.domain} />
                        
                        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-950 pb-24 md:pb-6">
                            <div className="max-w-7xl mx-auto space-y-6">
                                {children}
                            </div>
                        </main>
                    </div>

                    {/* 📱 Mobile-Native Navigation Layer */}
                    <MobileBottomNav role={role} />
                </div>
            </div>
        )
    } catch (err: any) {
        // Re-throw Next.js internal redirect errors
        if (err?.message === 'NEXT_REDIRECT' || err?.digest?.includes('NEXT_REDIRECT')) {
            throw err;
        }

        console.error("[DashboardLayout Fatal Error]:", err)
        return (
            <div className="p-12 text-center h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
                <div className="p-8 max-w-2xl bg-red-500/10 border border-red-500/20 rounded-2xl">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Layout Error (500)</h2>
                    <p className="text-slate-300 mb-6 text-sm">
                        An error occurred in the dashboard layout.
                    </p>
                    <div className="text-left bg-black/40 p-4 rounded-lg overflow-auto max-h-64 text-[10px] font-mono text-red-400/80">
                        <p className="font-bold mb-2">Error: {err?.message || "Unknown Error"}</p>
                        {err?.stack && <pre className="whitespace-pre-wrap">{err.stack}</pre>}
                    </div>
                </div>
            </div>
        )
    }
}
