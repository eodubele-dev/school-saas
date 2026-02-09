import { createClient } from "@/lib/supabase/server"
import { MobileNav } from "./mobile-nav"
import { Sidebar } from "./sidebar"
import { DynamicTopBar } from "@/components/layout/dynamic-top-bar"
import { getNextClass } from "@/lib/actions/schedule"

export async function Navbar({ domain }: { domain?: string }) {
    const supabase = createClient()

    // Fetch authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    let userName = "Guest"
    let userRole = "Visitor"
    let userAvatarUrl = null
    let schoolName = "EduFlow" // Default or fetch from tenant

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, role, avatar_url, tenant_id')
            .eq('id', user.id)
            .single()

        if (profile) {
            userName = profile.full_name || user.email?.split('@')[0] || "User"
            userRole = profile.role || "User"
            userAvatarUrl = profile.avatar_url

            // Fetch school name if we have tenant_id
            if (profile.tenant_id) {
                const { data: tenant } = await supabase.from('tenants').select('name').eq('id', profile.tenant_id).single()
                if (tenant) schoolName = tenant.name
            }
        }
    }

    // Prepare mobile nav component to pass down
    const MobileNavComponent = (
        <MobileNav>
            <Sidebar domain={domain} className="w-full h-full border-none" />
        </MobileNav>
    )

    const userProfile = {
        userName,
        userRole: userRole.charAt(0).toUpperCase() + userRole.slice(1),
        userEmail: user?.email,
        userAvatarUrl
    }

    return (
        <DynamicTopBar
            user={user}
            role={userRole}
            schoolName={schoolName}
            mobileNav={MobileNavComponent}
            userProfile={userProfile}
        />
    )
}
