import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdmissionsClient } from "@/components/admissions/admissions-client"

export default async function AdmissionsPage({ params }: { params: { domain: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect(`/${params.domain}/login`)
    }

    // Role check (Admin/Registrar only)
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, tenant_id')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin' && profile?.role !== 'registrar') {
        // Simple role check for now, can be expanded
        return <div className="p-8 text-center text-red-500">Access Denied: Only Admins or Registrars can admit students.</div>
    }

    // Fetch initial data like classes and houses for the wizard
    const { data: classes } = await supabase
        .from('classes')
        .select('id, name')
        .eq('tenant_id', profile.tenant_id)
        .order('name')

    // Fetch Tenant Branding
    const { data: tenant } = await supabase
        .from('tenants')
        .select('name, logo_url, theme_config')
        .eq('id', profile.tenant_id)
        .single()

    const houses = ['Red House', 'Blue House', 'Green House', 'Yellow House']

    return (
        <div className="flex flex-col h-full bg-slate-950">
            <AdmissionsClient
                domain={params.domain}
                classes={classes || []}
                houses={houses}
                tenant={tenant}
            />
        </div>
    )
}
