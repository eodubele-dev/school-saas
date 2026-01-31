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

    const roleStyles: Record<UserRole, string> = {
        admin: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
        teacher: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
        parent: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
        student: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
    }

    const activeStyle = roleStyles[role] || "bg-primary text-primary-foreground"

    return (
        <div className="flex-1 px-4 py-6 space-y-6 relative z-10">
            {/* User Profile & Role Badge */}
            <div className="px-2 flex flex-col gap-1">
                <h3 className="font-semibold text-sm text-white truncate" title={userName}>
                    {userName}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span>{ROLE_BADGES[role]}</span>
                    <span>{ROLE_LABELS[role]}</span>
                </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-1">
                {items.map((item) => {
                    const IconComponent = item.icon
                    // Fix: Only highlight active link, handle /dashboard root specifically
                    const isActive = item.href === '/dashboard'
                        ? pathname === item.href
                        : pathname.startsWith(item.href)

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            prefetch={false}
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                                isActive
                                    ? activeStyle
                                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                            )}
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
