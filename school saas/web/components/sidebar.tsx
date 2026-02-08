import Link from "next/link"
import { headers } from "next/headers"
import {
    Settings,
    HelpCircle,
    School
} from "lucide-react"

import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"
import { getParentChildren } from "@/lib/actions/parent-portal"
import { LogoutButton } from "./logout-button"
import { SidebarClient } from "./sidebar-client"
import { SIDEBAR_LINKS } from "@/config/sidebar"

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

    // Parallelize Tenant and Auth Fetches to avoid waterfalls
    const [tenantRes, authRes] = await Promise.all([
        supabase.from('tenants').select('name, logo_url, theme_config, motto').eq('slug', slug).single(),
        supabase.auth.getUser()
    ])

    const tenant = tenantRes.data
    const user = authRes.data.user

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

    // Fetch User Profile if authenticated
    if (user) {
        try {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role, full_name')
                .eq('id', user.id)
                .single()

            if (profileError) {
                console.error("[Sidebar] Profile Fetch Error:", profileError)
            }

            if (profile) {
                if (profile.role) userRole = profile.role.toLowerCase().trim()
                if (profile.full_name) userName = profile.full_name
            }
        } catch (error) {
            console.error("[Sidebar] Profile Critical Error:", error)
            userRole = 'admin' // Final fallback to allow dashboard visibility
        }
    }

    // Fetch Linked Students if Parent
    let linkedStudents: any[] = []
    if (userRole === 'parent') {
        linkedStudents = await getParentChildren()
    }


    return (
        <div
            className={cn("flex h-screen w-64 flex-col bg-slate-950 text-white relative z-50 shadow-xl", className)}
            style={{
                // @ts-ignore
                '--school-accent': primaryColor,
                '--school-accent-rgb': accentRgb
            }}
        >
            <SidebarClient
                role={userRole}
                userName={userName}
                brandColor={primaryColor}
                tenantName={tenantName}
                tier="platinum"
                tenantLogo={tenantLogo}
                linkedStudents={linkedStudents}
            />
        </div>
    )
}
