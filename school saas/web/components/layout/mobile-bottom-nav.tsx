"use client"

import React from 'react'
import { Home, Search, Bell, User, PlusCircle } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export function MobileBottomNav({ role }: { role: string }) {
    const pathname = usePathname()
    const router = useRouter()

    const navItems = [
        { label: 'Home', icon: Home, href: '/dashboard' },
        { label: 'Search', icon: Search, href: '/dashboard/search' },
        { label: 'Create', icon: PlusCircle, href: '#', isAction: true },
        { label: 'Alerts', icon: Bell, href: '/dashboard/notifications' },
        { label: 'Profile', icon: User, href: '/dashboard/profile' },
    ]

    return (
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-[100]">
            <div className="bg-[#0f172a]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between relative overflow-hidden">
                {/* Glow Background */}
                <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
                
                {navItems.map((item, idx) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    if (item.isAction) {
                        return (
                            <button
                                key={idx}
                                className="relative -top-4 bg-blue-600 p-4 rounded-2xl shadow-[0_10px_20px_rgba(37,99,235,0.4)] border border-blue-400/30 active:scale-90 transition-all"
                                onClick={() => {
                                    if (role === 'TEACHER') router.push('/dashboard/attendance')
                                    else router.push('/dashboard')
                                }}
                            >
                                <Icon className="w-6 h-6 text-white" />
                            </button>
                        )
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => router.push(item.href)}
                            className={cn(
                                "relative flex flex-col items-center gap-1 transition-all duration-300",
                                isActive ? "text-blue-400" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <Icon className={cn("w-5 h-5", isActive && "fill-blue-400/10")} />
                            {isActive && (
                                <motion.div
                                    layoutId="nav-glow"
                                    className="absolute -bottom-1 w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_10px_#60a5fa]"
                                />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
