"use client"

import { Home, Users, MessageSquare, User, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function MobileShell({ children, domain }: { children: React.ReactNode, domain: string }) {
    const pathname = usePathname()

    const NAV_ITEMS = [
        { icon: Home, label: 'Home', href: `/mobile/teacher` },
        { icon: Users, label: 'Attendance', href: `/mobile/teacher/attendance` },
        { icon: MessageSquare, label: 'Msgs', href: `/mobile/teacher/messages` },
        { icon: User, label: 'Profile', href: `/mobile/teacher/profile` },
    ]

    return (
        <div className="flex flex-col h-screen bg-slate-950 max-w-md mx-auto relative border-x border-white/5 shadow-2xl">
            {/* Header */}
            <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 bg-slate-900 z-10">
                <div className="font-bold text-lg text-white tracking-tight">EduFlow<span className="text-[var(--school-accent)]">.Mobile</span></div>
                <button className="p-2 text-slate-400">
                    <Menu className="h-6 w-6" />
                </button>
            </header>

            {/* Main Content (Scrollable) */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 p-4">
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="h-16 absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 flex items-center justify-around z-20 pb-safe">
                {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
                    const isActive = pathname === href || pathname.startsWith(href + '/')
                    return (
                        <Link
                            key={label}
                            href={href.replace('/mobile/teacher', `/${domain}/mobile/teacher`)}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-[var(--school-accent)]' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <Icon className={`h-6 w-6 transition-transform ${isActive ? 'scale-110' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{label}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
