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
        .select('name, logo_url, theme_config, motto')
        .eq('slug', slug)
        .single()

    let primaryColor = '#3b82f6' // Default Blue-500
    let tenantMotto = "Excellence in Everything" // Default Slogan

    if (tenant) {
        tenantName = tenant.name || "EduFlow"
        tenantLogo = tenant.logo_url
        if (tenant.motto) tenantMotto = tenant.motto
        if (tenant.theme_config && typeof tenant.theme_config === 'object') {
            // @ts-ignore
            primaryColor = tenant.theme_config.primary || primaryColor
        }
    }

    // Helper to Convert Hex to RGB for Tailwind opacity modifiers
    const hexToRgb = (hex: string) => {
        let c: any;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length == 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(' ');
        }
        return '59 130 246'; // Default fallback
    }

    const accentRgb = hexToRgb(primaryColor)

    console.log('[Sidebar] Theme Color Debug:', { primaryColor, accentRgb })

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
        <div
            className={cn("flex h-screen w-64 flex-col bg-slate-950 text-white", className)}
            style={{
                // @ts-ignore
                '--school-accent': primaryColor,
                '--school-accent-rgb': accentRgb
            }}
        >
            {/* Premium 'High-Prominence' Brand Header */}
            <div className="flex h-[88px] items-center px-3 border-b border-white/5 relative group shrink-0 gap-3">
                {/* 3. Vertical Divider (Subtle Frame) */}
                <div className="absolute bottom-0 right-0 top-0 w-px bg-white/10" />

                {/* Premium Context-Aware Header Interaction */}
                <div className="absolute inset-0 bg-[var(--school-accent)]/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundColor: 'rgb(var(--school-accent-rgb) / 0.05)' }} />

                <div className="flex items-center gap-3 relative z-10 w-full overflow-hidden">
                    {/* 1. Large 'Goldilocks' Logo Container (56px) */}
                    <div className="h-14 w-14 shrink-0 flex items-center justify-center rounded-xl bg-slate-900/50 backdrop-blur transition-all duration-300 group-hover:scale-105 border border-white/10"
                        style={{
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)', // Deep shadow for "Badge" effect
                            filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))',
                            borderColor: 'rgb(var(--school-accent-rgb) / 0.2)'
                        }}>
                        {tenantLogo ? (
                            <img
                                src={tenantLogo}
                                alt={tenantName}
                                className="h-full w-full object-contain p-1"
                            />
                        ) : (
                            <School className="h-8 w-8 text-[var(--school-accent)]" />
                        )}
                    </div>

                    {/* 2. Dual-Line Identity Stack */}
                    <div className="flex flex-col flex-1 min-w-0 justify-center">
                        <span
                            className="font-bold text-[20px] text-white leading-[1.1] tracking-tight drop-shadow-sm line-clamp-2"
                            title={tenantName}
                        >
                            {tenantName}
                        </span>
                        {/* Slogan: Bolder, clearer, larger */}
                        <span className="text-[12px] font-semibold text-cyan-400 mt-0.5 leading-none hidden lg:block tracking-wide truncate">
                            {tenantMotto}
                        </span>
                    </div>
                </div>
            </div>

            <SidebarClient role={userRole} userName={userName} brandColor={primaryColor} />


        </div>
    )
}
