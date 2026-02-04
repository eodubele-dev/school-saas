import { Bell, User, Calendar, Book, ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { MobileNav } from "./mobile-nav"
import { Sidebar } from "./sidebar"
import { LiveClock } from "@/components/live-clock"
import { OmniSearch } from "@/components/omni-search"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { NavbarLinks } from "@/components/navbar-links"
import { getNextClass } from "@/lib/actions/schedule"
import Link from "next/link"

export async function Navbar({ domain }: { domain?: string }) {
    const supabase = createClient()

    // Fetch authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    let userName = "Guest"
    let userRole = "User"
    let userAvatarUrl = null

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, role, avatar_url')
            .eq('id', user.id)
            .single()

        if (profile) {
            userName = profile.full_name || user.email?.split('@')[0] || "User"
            userRole = profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "User"
            userAvatarUrl = profile.avatar_url
        }
    }

    const scheduleData = await getNextClass()

    return (
        <header className="flex h-16 items-center justify-between border-b border-white/10 bg-slate-900/80 backdrop-blur-md px-4 lg:px-6 sticky top-0 z-50 shadow-lg shadow-black/20">
            {/* Left: Mobile Nav & Context Indicator */}
            <div className="flex items-center gap-4 lg:gap-8">
                <MobileNav>
                    <Sidebar domain={domain} className="w-full h-full border-none" />
                </MobileNav>

                {/* Mobile Brand (Logo Only) - "Prominent" 40px */}
                <div className="flex lg:hidden items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-sm">
                        {/* Short-circuit for logo if available, else Icon */}
                        <Book className="h-5 w-5 text-indigo-400" />
                    </div>
                </div>

                <div className="hidden lg:flex flex-col">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-widest">
                        <span>2025/2026 Session</span>
                        <span className="h-1 w-1 rounded-full bg-slate-600" />
                        <span className="text-blue-400">2nd Term</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span>Lagos, NG</span>
                        <LiveClock />
                    </div>
                </div>
            </div>

            {/* Center: Quick Links */}
            {/* Center: Quick Links (Actually, user asked to push search to fill space, so we might need to adjust layout) */}
            {/* The Prompt: "Ensure the 'Global Search' bar has a flex-grow property so it fills the remaining space properly, pushing the user profile to the far right." */}

            {/* We will hide NavbarLinks on mobile if needed or keep it minimal. The prompt implies a layout shift.
                Current Layout: Left (Brand/Nav) | Center (Links) | Right (Search/Proto).
                Requested: Left (Brand) | ... | Search (Fill) | Profile.
                
                Let's keep NavbarLinks but make Search (OmniSearch) grow.
            */}

            <div className="flex-1 flex items-center justify-center px-4">
                <NavbarLinks
                    domain={domain || 'school'}
                    scheduleData={scheduleData}
                />
            </div>

            {/* Right: Search, Notifications, Profile */}
            <div className="flex items-center gap-4 lg:gap-6">

                {/* Omni-Search */}
                <OmniSearch />

                {/* Notifications */}
                <button className="relative text-slate-400 hover:text-white transition-colors group">
                    <Bell className="h-5 w-5 group-hover:animate-swing" />
                    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-slate-950 animate-pulse"></span>
                </button>

                {/* Profile Badge */}
                <ProfileDropdown
                    userName={userName}
                    userRole={userRole}
                    userEmail={user?.email}
                    userAvatarUrl={userAvatarUrl}
                />
            </div>
        </header>
    )
}
