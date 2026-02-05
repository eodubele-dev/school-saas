"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Shield, Smartphone, Zap, BarChart3, Users, Building2, Layout, BookOpen, Clock, Heart, Quote, Globe } from "lucide-react"
import Link from "next/link"
import { useExecutiveConversion } from "./executive-context"

const modules = [
    {
        title: "Forensic Audit",
        desc: "Grade change & audit logs",
        icon: <Shield className="w-5 h-5 text-cyan-400" />,
        id: "audit-integrity"
    },
    {
        title: "Revenue Engine",
        desc: "Automated fee recovery",
        icon: <Zap className="w-5 h-5 text-emerald-400" />,
        id: "revenue-engine"
    },
    {
        title: "Campus Logistics",
        desc: "Dorm & Transport sync",
        icon: <Building2 className="w-5 h-5 text-amber-400" />,
        id: "campus-logistics"
    },
    {
        title: "God-View Dashboard",
        desc: "Executive command center",
        icon: <Layout className="w-5 h-5 text-blue-400" />,
        id: "god-view"
    },
    {
        title: "Parent App",
        desc: "Real-time engagement",
        icon: <Smartphone className="w-5 h-5 text-purple-400" />,
        id: "parent-app"
    },
    {
        title: "Academic Suite",
        desc: "Lesson plans & results",
        icon: <BookOpen className="w-5 h-5 text-rose-400" />,
        id: "academics"
    }
]

export function MegaMenu() {
    const { isMegaMenuOpen, closeMegaMenu, scrollToSection } = useExecutiveConversion()

    return (
        <AnimatePresence>
            {isMegaMenuOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeMegaMenu}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[45]"
                    />

                    {/* Menu Content */}
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.98, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
                        exit={{ opacity: 0, y: -20, scale: 0.98, x: "-50%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed top-24 left-1/2 w-[95%] max-w-5xl bg-[#0A0A0B]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] z-50 overflow-hidden"
                    >
                        <div className="grid md:grid-cols-4 h-full">
                            {/* Left Side: Module Highlights (Bento Style) */}
                            <div className="md:col-span-3 p-8 border-r border-white/5">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-sm font-mono text-slate-500 uppercase tracking-widest">Ecosystem Highlights</h3>
                                    <div className="h-px flex-1 mx-6 bg-white/5" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {modules.map((mod) => (
                                        <button
                                            key={mod.title}
                                            onClick={() => {
                                                scrollToSection(mod.id, true)
                                                closeMegaMenu()
                                            }}
                                            className="flex flex-col items-start text-left p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/30 hover:bg-white/10 transition-all group"
                                        >
                                            <div className="p-2 rounded-lg bg-black/40 mb-3 group-hover:scale-110 transition-transform">
                                                {mod.icon}
                                            </div>
                                            <div className="text-white font-bold text-sm mb-1">{mod.title}</div>
                                            <div className="text-slate-500 text-xs leading-relaxed">{mod.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Right Side: Quick Stats / CTA */}
                            <div className="bg-gradient-to-br from-blue-600/10 to-transparent p-8 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2 text-cyan-400 mb-6">
                                        <Heart className="w-4 h-4" />
                                        <span className="text-xs font-bold font-mono">TRUST_CENTER</span>
                                    </div>
                                    <div className="space-y-4">
                                        <Link
                                            href="/success-stories"
                                            onClick={closeMegaMenu}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/30 hover:bg-white/10 transition-all group/item"
                                        >
                                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                                <Quote className="w-4 h-4 text-emerald-400" />
                                            </div>
                                            <div>
                                                <div className="text-white text-xs font-bold mb-0.5">Success Stories</div>
                                                <div className="text-[10px] text-slate-500">₦142M+ Recovered</div>
                                            </div>
                                        </Link>
                                        <Link
                                            href="/about"
                                            onClick={closeMegaMenu}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-white/10 transition-all group/item"
                                        >
                                            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                <Globe className="w-4 h-4 text-blue-400" />
                                            </div>
                                            <div>
                                                <div className="text-white text-xs font-bold mb-0.5">About Us</div>
                                                <div className="text-[10px] text-slate-500">Mission & Vision</div>
                                            </div>
                                        </Link>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-white/5">
                                    <div className="text-slate-300 text-sm font-medium mb-4">Ready for Platinum?</div>
                                    <button
                                        onClick={() => {
                                            scrollToSection('pricing')
                                            closeMegaMenu()
                                        }}
                                        className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 group text-sm"
                                    >
                                        View Pricing
                                        <Zap className="w-3 h-3 fill-black group-hover:animate-pulse" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
