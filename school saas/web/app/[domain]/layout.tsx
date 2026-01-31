import { createClient } from "@/lib/supabase/server"
import { TenantThemeProvider } from "@/components/providers/tenant-theme-provider"

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
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
                {children}
            </div>
        </TenantThemeProvider>
    )
}
