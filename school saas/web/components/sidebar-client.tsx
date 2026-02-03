"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    CalendarDays,
    BookOpen,
    Activity,
    FileText,
    MapPin
} from "lucide-react"

// iconMap and SidebarItem interface removed as we use direct components from config

import { SIDEBAR_LINKS, ROLE_BADGES, ROLE_LABELS, type UserRole } from "@/config/sidebar"

// ... iconMap (keep it, or map directly if config uses components) ...
// Actually, config uses components directly now, so we can simplify.
// But wait, the config file imports lucide-react components.
// The previous file used string keys.
// Let's check config/sidebar.ts again.
// It imports `LayoutDashboard` etc. 
// So `items` in config are `{ icon: Component, label, href }`.

export function SidebarClient({ role: initialRole = 'student', userName = 'Guest User' }: { role?: string, userName?: string }) {
    const pathname = usePathname()
    // Cast string role to UserRole, fallback to student if invalid
    const role = (Object.keys(SIDEBAR_LINKS).includes(initialRole) ? initialRole : 'student') as UserRole

    const items = SIDEBAR_LINKS[role] || SIDEBAR_LINKS.student

    // Dynamic Active Style using CSS Variables from TenantThemeProvider
    const activeStyle = "text-[var(--school-accent)] bg-[var(--school-accent)]/10 hover:bg-[var(--school-accent)]/20 shadow-[inset_3px_0_0_var(--school-accent)]"

    return (
        <div className="flex-1 px-4 py-6 space-y-6 relative z-10">
            {/* User Profile & Role Badge Removed (Moved to Global Header) */}

            {/* Child Switcher (Parent Only) */}
            {role === 'parent' && (
                <div className="px-2">
                    <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-2 block">
                        Switch Child
                    </label>
                    <div className="relative">
                        <select className="w-full bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-md px-2 py-2 appearance-none focus:outline-none focus:border-[var(--school-accent)] transition-colors cursor-pointer">
                            <option>Deborah Odubele</option>
                            <option>David Odubele</option>
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Links */}
            <div className="space-y-1">
                {items.map((item: any) => {
                    const IconComponent = item.icon
                    // Fix: Only highlight active link, handle /dashboard root specifically
                    const isActive = item.href === '/dashboard'
                        ? pathname === item.href
                        : pathname.startsWith(item.href)

                    if (item.disabled) {
                        return (
                            <div key={item.label} className="group relative">
                                <div
                                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-400/40 cursor-not-allowed select-none transition-all"
                                    aria-disabled="true"
                                >
                                    <IconComponent className="h-5 w-5 grayscale opacity-50 transition-all group-hover:grayscale-0 group-hover:opacity-100" />
                                    <span>{item.label}</span>
                                    {item.badge && (
                                        <span className="ml-auto bg-[var(--school-accent)]/20 text-[var(--school-accent)] text-[10px] px-2 py-0.5 rounded-full border border-[var(--school-accent)]/30 font-bold tracking-tight">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>

                                {/* Sleek Glassmorphism Tooltip - Positioned for 720p safety */}
                                <div className="absolute left-[105%] top-1/2 -translate-y-1/2 w-52 p-3 rounded-xl bg-slate-900/40 backdrop-blur-xl border border-white/10 text-[11px] text-slate-200 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-[100] shadow-2xl shadow-cyan-950/20 leading-relaxed translate-x-1 group-hover:translate-x-0 hidden md:block">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2 text-[var(--school-accent)] font-bold uppercase text-[9px] tracking-widest">
                                            <div className="h-1 w-1 rounded-full bg-[var(--school-accent)] animate-pulse" />
                                            Premium Feature
                                        </div>
                                        <p className="font-medium text-slate-300">
                                            Real-time school bus tracking is available on the Premium Tier. Contact your school administrator to upgrade.
                                        </p>
                                    </div>
                                    {/* Tooltip Arrow */}
                                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-right-slate-900/40 filter drop-shadow-[-1px_0_0_rgba(255,255,255,0.1)]" />
                                </div>
                            </div>
                        )
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch={false}
                            id={item.label === "System Security" ? "sidebar-audit" : undefined}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "text-[var(--school-accent)]" // Fallback class
                                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                            )}
                            style={isActive ? {
                                color: 'var(--school-accent)',
                                backgroundColor: 'rgb(var(--school-accent-rgb) / 0.1)',
                                boxShadow: 'inset 3px 0 0 var(--school-accent)'
                            } : {}}
                        >
                            {/* @ts-ignore - Lucide icon compatibility */}
                            <IconComponent className="h-5 w-5" />
                            {item.label}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
