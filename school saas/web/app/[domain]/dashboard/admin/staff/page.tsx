import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StaffList } from "@/components/staff/staff-list"
import { StaffInviteModal } from "@/components/staff/staff-invite-modal"
import { getStaffList } from "@/lib/actions/staff"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { unstable_noStore as noStore } from 'next/cache'
import { createAdminClient } from "@/lib/supabase/admin"

export default async function StaffPage({ params, searchParams }: { params: { domain: string }, searchParams: { page?: string, query?: string } }) {
    noStore()
    try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) redirect(`/${params.domain}/login`)

        // Get Tenant Context via Domain
        const { data: tenantContext } = await supabase
            .from('tenants')
            .select('id')
            .eq('slug', params.domain)
            .single()

        if (!tenantContext) redirect('/login')
        const tenantId = tenantContext.id

        // Admin Check for THIS tenant
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, tenant_id')
            .eq('id', user.id)
            .eq('tenant_id', tenantId)
            .single()

        if (profile?.role !== 'admin' && profile?.role !== 'super-admin' && profile?.role !== 'owner') {
            return <div className="p-8 text-center text-red-500">Access Denied: Only Admins can manage staff.</div>
        }

        const page = Number(searchParams.page) || 1
        const query = searchParams.query || ""

        // Fetch Staff
        const { success, data: staff, count, error: staffError } = await getStaffList(params.domain, page, query)

        // Fetch Classes for mapping
        const { data: classes } = await supabase
            .from('classes')
            .select('id, name')
            .eq('tenant_id', tenantId as any)
            .order('name')

        // Fetch Branding using tenant_id
        const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .select('id, name, logo_url, theme_config')
            .eq('id', tenantId as any)
            .single()

        if (tenantError) {
            console.error("[StaffPage] Tenant Branding Fetch Error:", tenantError.message)
        }

        return (
            <div className="flex flex-col h-full bg-slate-950 p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Staff Management</h1>
                        <p className="text-slate-400">Manage teachers, bursars, and administrative access.</p>
                    </div>
                    <StaffInviteModal domain={params.domain} tenantId={tenantId} />
                </div>

                {success ? (
                    <StaffList
                        initialData={staff || []}
                        domain={params.domain}
                        classes={classes || []}
                        tenant={tenant}
                        totalPages={Math.ceil((count || 0) / 10)}
                    />
                ) : (
                    <div className="p-8 text-center text-red-400 bg-red-500/10 rounded-lg border border-red-500/20">
                        <p className="font-bold mb-2">Failed to load staff list.</p>
                        <p className="text-sm opacity-70">{staffError}</p>
                    </div>
                )}
            </div>
        )
    } catch (err: any) {
        // CRITICAL: Next.js redirect() throws an error that must be re-thrown 
        // to be handled by the framework. If we catch it, the redirect fails.
        if (err?.message === 'NEXT_REDIRECT' || err?.digest?.includes('NEXT_REDIRECT')) {
            throw err;
        }

        console.error("[StaffPage Fatal Error]:", err)
        return (
            <div className="p-12 text-center h-full flex flex-col items-center justify-center bg-slate-950">
                <div className="p-8 max-w-2xl bg-red-500/10 border border-red-500/20 rounded-2xl">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">500: Internal Server Error</h2>
                    <p className="text-slate-300 mb-6 text-sm leading-relaxed">
                        An unexpected error occurred while loading the Faculty Directory.
                    </p>
                    <div className="text-left bg-black/40 p-4 rounded-lg overflow-auto max-h-64 text-[10px] font-mono text-red-400/80">
                        <p className="font-bold mb-2">Error: {err?.message || "Unknown Error"}</p>
                        {err?.stack && <pre className="whitespace-pre-wrap">{err.stack}</pre>}
                    </div>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-medium transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }
}
