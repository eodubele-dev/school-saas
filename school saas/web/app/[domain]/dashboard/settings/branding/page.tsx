import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Palette, ShieldCheck } from "lucide-react"
import { BrandingClient } from "./branding-client"

export default async function BrandingSettingsPage({ params }: { params: { domain: string } }) {
    const supabase = createClient()

    // 1. Auth & Admin Authorization check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(`/${params.domain}/login`)

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') {
        return <div className="p-8 text-center text-red-500">Only school administrators can access branding settings.</div>
    }

    // 2. Fetch Tenant Data
    const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('slug', params.domain)
        .single()

    if (!tenant) return <div className="p-8 text-center text-slate-400">School data not found.</div>

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-cyan-500 font-bold uppercase tracking-widest text-xs mb-1">
                        <ShieldCheck className="h-4 w-4" />
                        Administrator / Institutional Identity
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">
                        School Branding
                    </h2>
                    <p className="text-slate-400 max-w-lg text-sm">
                        Customize your school's digital identity. These settings propagate to all teacher portals, parent dashboards, and formal student records.
                    </p>
                </div>
            </div>

            {/* Client Logic Wrapper */}
            <BrandingClient initialTenant={tenant} />
        </div>
    )
}
