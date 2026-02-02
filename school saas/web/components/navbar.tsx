import { Bell, User, Calendar, Book, ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { MobileNav } from "./mobile-nav"
import { Sidebar } from "./sidebar"
import { LiveClock } from "@/components/live-clock"
import { OmniSearch } from "@/components/omni-search"
import { ProfileDropdown } from "@/components/profile-dropdown"
import Link from "next/link"

export async function Navbar({ domain }: { domain?: string }) {
    const supabase = createClient()

    // Fetch authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    let userName = "Guest"
    let userRole = "User"

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', user.id)
            .single()

        if (profile) {
            userName = profile.full_name || user.email?.split('@')[0] || "User"
            userRole = profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "User"
        }
    }

    return (
        <header className="flex h-16 items-center justify-between border-b border-white/10 bg-slate-900/80 backdrop-blur-md px-4 lg:px-6 sticky top-0 z-50 shadow-lg shadow-black/20">
            {/* Left: Mobile Nav & Context Indicator */}
            <div className="flex items-center gap-4 lg:gap-8">
                <MobileNav>
                    <Sidebar domain={domain} className="w-full h-full border-none" />
                </MobileNav>

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
            <div className="hidden xl:flex items-center gap-6">
                <Link href={`/${domain}/schedule`} className="text-sm font-medium text-slate-400 hover:text-white hover:underline decoration-blue-500 underline-offset-4 transition-all flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" /> My Schedule
                </Link>
                <button className="text-sm font-medium text-slate-400 hover:text-white hover:underline decoration-blue-500 underline-offset-4 transition-all flex items-center gap-2">
                    <Book className="h-3.5 w-3.5" /> Directory
                </button>
                <Link href="#" className="text-sm font-medium text-slate-400 hover:text-white hover:underline decoration-blue-500 underline-offset-4 transition-all flex items-center gap-2">
                    <ExternalLink className="h-3.5 w-3.5" /> Resources
                </Link>
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
                />
            </div>
        </header>
    )
}
