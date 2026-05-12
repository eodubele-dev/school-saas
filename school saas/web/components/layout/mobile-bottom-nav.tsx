"use client"

import React from 'react'
import { Home, User, PlusCircle } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface MobileBottomNavProps {
    role: string
    domain: string
}

export function MobileBottomNav({ role, domain }: MobileBottomNavProps) {
    const pathname = usePathname()
    const router = useRouter()

    // Ensure we have a leading slash for the domain if it's provided
    const basePath = domain ? `/${domain}` : ''

    const navItems = [
        { label: 'Home', icon: Home, href: `${basePath}/dashboard` },
        { label: 'Create', icon: PlusCircle, href: '#', isAction: true },
        { label: 'Account', icon: User, href: `${basePath}/dashboard/settings` },
    ]

    return (
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-40">
            <div className="bg-[#0f172a]/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] h-16 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-visible flex items-center justify-between px-10">
                {/* Glow Background */}
                <div className="absolute inset-0 bg-blue-500/5 pointer-events-none rounded-[2.5rem]" />
                
                {navItems.map((item, idx) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    if (item.isAction) {
                        return (
                            <div key={idx} className="absolute left-1/2 -translate-x-1/2 -top-6">
                                <button
                                    className="bg-blue-600 p-4 rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.5)] border border-blue-400/30 active:scale-90 transition-all flex items-center justify-center group"
                                    onClick={() => {
                                        if (role === 'TEACHER') router.push(`${basePath}/dashboard/attendance`)
                                        else router.push(`${basePath}/dashboard`)
                                    }}
                                >
                                    <Icon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        )
                    }

                    return (
                        <button
                            key={idx}
                            onClick={() => router.push(item.href)}
                            className={cn(
                                "relative flex flex-col items-center gap-1 transition-all duration-300 py-1 z-10",
                                isActive ? "text-blue-400" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <Icon className={cn("w-6 h-6", isActive && "fill-blue-400/10")} />
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
