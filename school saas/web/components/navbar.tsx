import { Bell, Search, User } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

export async function Navbar() {
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
        <header className="flex h-16 items-center justify-between border-b border-white/10 bg-slate-900/80 backdrop-blur-md px-6 sticky top-0 z-50 shadow-lg shadow-black/20">
            <div className="flex items-center gap-4">
                {/* Removed duplicate "Dashboard" title */}
            </div>

            <div className="flex items-center gap-6">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="h-9 w-64 rounded-full border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                </div>

                <button className="relative text-slate-400 hover:text-white transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-blue-500 border-2 border-slate-950"></span>
                </button>

                <div className="flex items-center gap-3">
                    {/* Removed duplicate User Info text (Admin principal) */}
                    <div className="h-9 w-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center overflow-hidden hover:bg-blue-500/20 transition-colors">
                        <User className="h-5 w-5 text-blue-400" />
                    </div>
                </div>
            </div>
        </header>
    )
}
