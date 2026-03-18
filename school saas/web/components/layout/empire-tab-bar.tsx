"use client"

import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEmpireStore } from '@/lib/stores/empire-store'
import { useRouter, usePathname } from 'next/navigation'
import { Building2, X, Plus, ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * EmpireTabBar: The pinnacle of institutional management.
 * Provides a native-style tabbed interface for proprietors.
 */
export function EmpireTabBar() {
    const { schools, activeSlug, setActiveSlug } = useEmpireStore()
    const router = useRouter()
    const pathname = usePathname()
    const scrollRef = useRef<HTMLDivElement>(null)

    // Sync activeSlug with current URL on mount/change
    useEffect(() => {
        const currentSlug = pathname.split('/')[1]
        if (currentSlug && currentSlug !== activeSlug) {
            setActiveSlug(currentSlug)
        }
    }, [pathname, activeSlug, setActiveSlug])

    if (schools.length <= 1) return null;

    const handleTabClick = (slug: string) => {
        setActiveSlug(slug)
        router.push(`/${slug}/dashboard`)
    }

    return (
        <div className="w-full bg-[#050505] border-b border-white/5 flex items-center h-10 select-none overflow-hidden relative group">
            
            {/* Empire Indicator */}
            <div className="px-4 border-r border-white/5 h-full flex items-center gap-2 bg-slate-950/50">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase">EMPIRE_SYNC</span>
            </div>

            {/* Tabs List */}
            <div 
                ref={scrollRef}
                className="flex-1 flex h-full overflow-x-auto no-scrollbar scroll-smooth items-center px-1"
            >
                <AnimatePresence mode="popLayout">
                    {schools.map((school) => {
                        const isActive = activeSlug === school.slug;
                        
                        return (
                            <motion.button
                                key={school.slug}
                                layout
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={() => handleTabClick(school.slug)}
                                className={cn(
                                    "relative h-8 min-w-[140px] max-w-[220px] px-3 flex items-center gap-3 transition-all duration-300 rounded-md mx-0.5 group",
                                    isActive ? "bg-slate-900 shadow-xl" : "hover:bg-white/5 opacity-60 hover:opacity-100"
                                )}
                            >
                                {/* Active Highlight Glow */}
                                {isActive && (
                                    <motion.div
                                        layoutId="tabHighlight"
                                        className="absolute inset-0 bg-blue-500/5 rounded-md border border-white/10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}

                                {/* School Icon/Logo */}
                                <div className={cn(
                                    "w-5 h-5 rounded flex items-center justify-center overflow-hidden border border-white/10",
                                    isActive ? "bg-blue-600/20 text-blue-400" : "bg-slate-800 text-slate-500"
                                )}>
                                    {school.logo ? (
                                        <img src={school.logo} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Building2 size={12} />
                                    )}
                                </div>

                                {/* School Name */}
                                <span className={cn(
                                    "text-[10px] font-bold truncate tracking-tight",
                                    isActive ? "text-slate-100" : "text-slate-400"
                                )}>
                                    {school.name.toUpperCase()}
                                </span>

                                {/* Bottom Indicator Line */}
                                {isActive && (
                                    <motion.div
                                        layoutId="tabUnderline"
                                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-500 rounded-full"
                                    />
                                )}
                            </motion.button>
                        )
                    })}
                </AnimatePresence>
            </div>

            {/* Global Actions */}
            <div className="px-2 flex items-center gap-1 border-l border-white/5 h-full">
                 <button 
                    onClick={() => router.push('/landing')}
                    className="p-1.5 hover:bg-white/5 rounded text-slate-500 transition-colors"
                    title="Add School to Library"
                >
                    <Plus size={14} />
                </button>
            </div>
            
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    )
}
