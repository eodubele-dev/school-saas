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
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
            <div className="flex items-center gap-4">
                {/* Breadcrumb or Page Title placeholder */}
                <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="h-9 w-64 rounded-full border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                </div>

                <button className="relative text-slate-500 hover:text-slate-700">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"></span>
                </button>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium text-slate-900">{userName}</p>
                        <p className="text-xs text-slate-500">{userRole}</p>
                    </div>
                    <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                        {/* Avatar image would go here */}
                        <User className="h-5 w-5 text-slate-500" />
                    </div>
                </div>
            </div>
        </header>
    )
}
