import { createClient } from "@/lib/supabase/server"
import { TenantThemeProvider } from "@/components/providers/tenant-theme-provider"
import { SchoolContextProvider } from "@/lib/context/school-context"
import { RealtimeNotifications } from "@/components/layout/realtime-notifications"

export const dynamic = 'force-dynamic'

export default async function DomainLayout({
    children,
    params,
}: {
    children: React.ReactNode,
    params: { domain: string }
}) {
    const supabase = createClient()

    // Fetch Tenant Theme Config
    const { data: tenant } = await supabase
        .from('tenants')
        .select('theme_config')
        .eq('slug', params.domain)
        .single()

    const primaryColor = tenant?.theme_config?.primary || "#06b6d4"

    return (
        <TenantThemeProvider primaryColor={primaryColor}>
            <SchoolContextProvider initialSettings={{
                name: tenant?.name || 'EduFlow',
                logo_url: tenant?.logo_url,
                theme: tenant?.theme_config,
                session: tenant?.current_session || '2025/2026',
                term: tenant?.current_term || '1st Term'
            }}>
                <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
                    <RealtimeNotifications />
                    {children}
                </div>
            </SchoolContextProvider>
        </TenantThemeProvider>
    )
}
