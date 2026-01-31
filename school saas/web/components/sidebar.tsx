import Link from "next/link"
import { headers } from "next/headers"
import {
    Settings,
    HelpCircle,
    School
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
    let userName = 'Guest User'

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
            .select('role, full_name')
            .eq('id', user.id)
            .single()

        if (profile) {
            if (profile.role) userRole = profile.role
            if (profile.full_name) userName = profile.full_name
        }
    }

    return (
        <div className={cn("flex h-screen w-64 flex-col bg-slate-950 text-white", className)}>
            <div className="flex h-16 items-center px-6 border-b border-white/5 relative group">
                {/* Premium Context-Aware Header */}
                <div className="absolute inset-0 bg-cyan-500/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="flex items-center gap-3 font-bold text-xl relative z-10 w-full">
                    {tenantLogo ? (
                        <div className="relative">
                            <div className="absolute inset-0 bg-cyan-500/20 blur-md rounded-lg" />
                            <img src={tenantLogo} alt={tenantName} className="h-8 w-8 rounded-lg object-cover border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.3)] relative z-10" />
                        </div>
                    ) : (
                        <div className="h-8 w-8 rounded-lg bg-cyan-950/50 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)] relative z-10">
                            <School className="h-4 w-4" />
                        </div>
                    )}
                    <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent group-hover:to-cyan-200 transition-all duration-300">
                        {tenantName}
                    </span>
                </div>
            </div>

            <SidebarClient role={userRole} userName={userName} />

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
