"use client"

import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Rocket, X, ArrowRight, Sparkles } from "lucide-react"
import { check } from "@tauri-apps/plugin-updater"
import { isDesktop } from "@/lib/utils/desktop"
import Link from "next/link"
import { usePathname } from "next/navigation"

/**
 * GlobalUpdateBanner: A high-status notification for institutional evolution.
 * Appears at the very top of the workstation when a Platinum-grade update is available.
 */
export function GlobalUpdateBanner({ domain }: { domain: string }) {
    const [updateAvailable, setUpdateAvailable] = useState(false)
    const [version, setVersion] = useState<string | null>(null)
    const [isVisible, setIsVisible] = useState(true)
    const pathname = usePathname()

    useEffect(() => {
        if (!isDesktop()) return
        checkForUpdates()
    }, [])

    const checkForUpdates = async () => {
        try {
            console.log("GlobalUpdateBanner: Checking for technological evolution... 🤙🏾🚀")
            const update = await check()
            if (update) {
                setUpdateAvailable(true)
                setVersion(update.version)
            }
        } catch (err) {
            console.error("Failed to check for updates in global banner:", err)
        }
    }

    // Don't show if already on settings page
    if (pathname?.includes("/settings")) return null

    return (
        <AnimatePresence>
            {updateAvailable && isVisible && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="relative z-[100] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white overflow-hidden shadow-lg border-b border-white/10"
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    
                    <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8 flex items-center justify-between relative">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md border border-white/30 animate-pulse">
                                <Rocket className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                <span className="text-xs sm:text-sm font-black uppercase tracking-widest flex items-center gap-1.5">
                                    <Sparkles className="h-3 w-3 text-amber-300 fill-amber-300" />
                                    Evolution Available
                                </span>
                                <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-white/30" />
                                <p className="text-[10px] sm:text-xs font-medium text-white/90">
                                    A new Platinum-grade push {version ? `(v${version})` : ""} is ready for deployment.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4">
                            <Link 
                                href={`/${domain}/dashboard/settings`}
                                className="group flex items-center gap-2 px-3 py-1.5 bg-white text-blue-700 text-[10px] sm:text-xs font-black uppercase tracking-tighter rounded-full shadow-xl hover:bg-slate-100 transition-all active:scale-95"
                            >
                                Apply Changes
                                <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                            
                            <button 
                                onClick={() => setIsVisible(false)}
                                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="h-4 w-4 text-white/70" />
                            </button>
                        </div>
                    </div>
                    
                    {/* Progress Shine Effect */}
                    <motion.div 
                        className="absolute bottom-0 left-0 h-[2px] bg-white/40"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    )
}
