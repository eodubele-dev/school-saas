import Link from "next/link"
import { headers } from "next/headers"
import {
    Settings,
    HelpCircle
} from "lucide-react"

import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"
import { LogoutButton } from "./logout-button"
import { SidebarClient } from "./sidebar-client"

// Static items removed in favor of RBAC config

export async function Sidebar({ className, domain }: { className?: string, domain?: string }) {
    const supabase = createClient()
    const headersList = headers()
    const hostname = headersList.get('host') || ''

    // Extract subdomain/slug from hostname OR use provided domain prop
    let slug = domain

    if (!slug) {
        slug = hostname.replace('.localhost:3000', '').replace('.localhost:3002', '').replace('.localhost:3003', '')
        slug = slug.replace('.eduflow.ng', '')
    }

    console.log('[Sidebar] Generated slug:', slug)

    // Fetch tenant information
    let tenantName = "EduFlow"
    let tenantLogo = null
    let userRole = 'student' // Default fallback

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _slug = domain // Keeping domain prop usage for linting but ignoring it for links

    const { data: tenant } = await supabase
        .from('tenants')
        .select('name, logo_url')
        .eq('slug', slug)
        .single()

    if (tenant) {
        tenantName = tenant.name || "EduFlow"
        tenantLogo = tenant.logo_url
    }

    // Fetch User Role
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role) {
            userRole = profile.role
        }
    }

    return (
        <div className={cn("flex h-screen w-64 flex-col bg-slate-950 text-white", className)}>
            <div className="flex h-16 items-center px-6">
                <div className="flex items-center gap-2 font-bold text-xl">
                    {tenantLogo ? (
                        <img src={tenantLogo} alt={tenantName} className="h-8 w-8 rounded-lg object-cover" />
                    ) : (
                        <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                            ✨
                        </div>
                    )}
                    <span>{tenantName}</span>
                </div>
            </div>

            <SidebarClient role={userRole} />

            <div className="border-t border-slate-800 px-4 py-6 space-y-2">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
                >
                    <Settings className="h-5 w-5" />
                    Settings
                </Link>
                <Link
                    href="/help"
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
                >
                    <HelpCircle className="h-5 w-5" />
                    Help
                </Link>
                <LogoutButton />
            </div>
        </div>
    )
}
