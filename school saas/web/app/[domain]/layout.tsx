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
    const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('name, logo_url, theme_config, current_session, current_term')
        .eq('slug', params.domain)
        .single()

    if (tenantError) {
        console.error(`[DomainLayout] Error fetching tenant ${params.domain}:`, tenantError)
    }

    const primaryColor = tenant?.theme_config?.primary || "#06b6d4"
    const secondaryColor = tenant?.theme_config?.secondary || "#0f172a"
    const accentColor = tenant?.theme_config?.accent || "#3b82f6"

    return (
        <TenantThemeProvider
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            accentColor={accentColor}
        >
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
