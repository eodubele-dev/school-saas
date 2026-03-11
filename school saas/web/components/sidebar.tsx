import Link from "next/link"
import { headers } from "next/headers"
import {
    Settings,
    HelpCircle,
    School
} from "lucide-react"

import { cn } from "@/lib/utils"
import { unstable_noStore as noStore } from 'next/cache'
import { createClient } from "@/lib/supabase/server"
import { getParentChildren } from "@/lib/actions/parent-portal"
import { LogoutButton } from "./logout-button"
import { SidebarClient } from "./sidebar-client"
import { SIDEBAR_LINKS } from "@/config/sidebar"

// Static items removed in favor of RBAC config

export async function Sidebar({ className, domain }: { className?: string, domain?: string }) {
    noStore()
    const supabase = createClient()
    const headersList = headers()
    // Extract subdomain/slug with high priority on provided domain prop or middleware header
    const hostname = headersList.get('host') || ''
    const tenantSlug = headersList.get('x-tenant-slug') || ''

    let slug = domain || tenantSlug

    if (!slug) {
        // Fallback for direct access scenarios on localhost
        slug = hostname.replace('.localhost:3000', '').replace('.localhost:3002', '').replace('.localhost:3003', '')
        slug = slug.replace('.eduflow.ng', '').replace('localhost:3000', '').replace('localhost:3001', '')
    }

    // Clean slug of any trailing port or dots
    slug = slug?.split(':')[0]?.split('.')[0] || 'eduflow'

    console.log('[Sidebar] Resolved Tenant Slug:', slug, { source: domain ? 'prop' : 'header' })

    // Fetch tenant information
    let tenantName = "EduFlow"
    let tenantLogo = null
    let userRole = 'student' // Default fallback
    let userName = 'Guest User'

    // 4. Determine domain prefix for routing
    // Subdomain mode: school1.eduflow.ng -> prefix is empty (path starts at /dashboard)
    // Localhost/Path mode: localhost:3000/school1/dashboard -> prefix is /school1
    const isSubdomain = slug && (hostname.startsWith(`${slug}.`) || hostname.includes(`.${slug}.`))
    const domainPrefix = (slug && !isSubdomain && slug !== 'localhost' && slug !== 'eduflow') ? `/${slug}` : ''

    // Parallelize Tenant and Auth Fetches to avoid waterfalls
    const [tenantRes, authRes] = await Promise.all([
        supabase.from('tenants').select('name, logo_url, theme_config, motto, subscription_tier').eq('slug', slug).single(),
        supabase.auth.getUser()
    ])

    const tenant = tenantRes.data
    const user = authRes.data.user

    let primaryColor = '#3b82f6' // Default Blue-500
    let secondaryColor = '#020617' // Default slate-950
    let tenantMotto = "Excellence in Everything" // Default Slogan
    let tenantTier = "starter" // Set default to starter as base tier

    if (tenant) {
        tenantName = tenant.name || "EduFlow"
        tenantLogo = tenant.logo_url
        // @ts-ignore
        tenantTier = tenant.subscription_tier || "starter"
        if (tenant.motto) tenantMotto = tenant.motto
        if (tenant.theme_config && typeof tenant.theme_config === 'object') {
            // @ts-ignore
            primaryColor = tenant.theme_config.primary || primaryColor
            // @ts-ignore
            secondaryColor = tenant.theme_config.secondary || secondaryColor
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
    let linkedStudents: any[] = []

    // 3. Authenticated Data Fetching (Parallelized Phase 2)
    let permissions = null
    if (user) {
        try {
            const [profileRes, permissionsRes, students] = await Promise.all([
                supabase.from('profiles').select('role, full_name').eq('id', user.id).single(),
                supabase.from('staff_permissions').select('can_view_financials, can_edit_results, can_send_bulk_sms').eq('staff_id', user.id).single(),
                userRole === 'parent' ? getParentChildren() : Promise.resolve([])
            ])

            const profile = profileRes.data
            if (profile) {
                if (profile.role) userRole = profile.role.toLowerCase().trim()
                if (profile.full_name) userName = profile.full_name
            }
            permissions = permissionsRes.data
            linkedStudents = students as any[]
        } catch (error) {
            console.error("[Sidebar] Profile Critical Error:", error)
            userRole = 'admin'
        }
    }


    return (
        <div
            className={cn("flex h-screen w-64 flex-col text-foreground relative z-50 shadow-xl", className)}
            style={{
                backgroundColor: secondaryColor,
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
                tenantMotto={tenantMotto}
                tier={tenantTier}
                tenantLogo={tenantLogo}
                linkedStudents={linkedStudents}
                permissions={permissions}
                basePath={domainPrefix}
            />
        </div>
    )
}
