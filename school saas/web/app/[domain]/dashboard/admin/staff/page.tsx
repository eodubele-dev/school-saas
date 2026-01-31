import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { StaffList } from "@/components/staff/staff-list"
import { StaffInviteModal } from "@/components/staff/staff-invite-modal"
import { getStaffList } from "@/lib/actions/staff"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function StaffPage({ params, searchParams }: { params: { domain: string }, searchParams: { page?: string, query?: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect(`/${params.domain}/login`)

    // Admin Check
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, tenant_id') // Added tenant_id
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return <div className="p-8 text-center text-red-500">Access Denied: Only Admins can manage staff.</div>
    }

    const page = Number(searchParams.page) || 1
    const query = searchParams.query || ""

    // Fetch Staff
    const { success, data: staff, count } = await getStaffList(params.domain, page, query)

    // Fetch Classes for mapping
    const { data: classes } = await supabase
        .from('classes')
        .select('id, name')
        .eq('tenant_id', profile.tenant_id as any) // Type assertion due to join complexity
        .order('name')

    // Fetch Branding
    const { data: tenant } = await supabase
        .from('tenants')
        .select('name, logo_url, theme_config')
        .eq('id', profile.tenant_id as any)
        .single()

    return (
        <div className="flex flex-col h-full bg-slate-950 p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Staff Management</h1>
                    <p className="text-slate-400">Manage teachers, bursars, and administrative access.</p>
                </div>
                <StaffInviteModal domain={params.domain} />
            </div>

            {success ? (
                <StaffList
                    initialData={staff || []}
                    domain={params.domain}
                    classes={classes || []}
                    tenant={tenant}
                />
            ) : (
                <div className="p-8 text-center text-red-400 bg-red-500/10 rounded-lg border border-red-500/20">
                    Failed to load staff list. Please try again.
                </div>
            )}
        </div>
    )
}
