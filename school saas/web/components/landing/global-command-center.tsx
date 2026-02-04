"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Map, TrendingUp, Building2, Globe, ShieldCheck } from "lucide-react"

const campuses = [
    { id: "lekki", name: "Lekki Campus", subdomain: "lekki.eduflow.ng", students: 1250, revenue: "₦450M" },
    { id: "ikeja", name: "Ikeja Campus", subdomain: "ikeja.eduflow.ng", students: 850, revenue: "₦280M" },
    { id: "surulere", name: "Surulere Campus", subdomain: "surulere.eduflow.ng", students: 600, revenue: "₦195M" },
]

export function GlobalCommandCenter() {
    const [selectedCampus, setSelectedCampus] = useState(campuses[0])

    return (
        <section className="py-24 bg-[#0A0A0B] relative overflow-hidden">
            <div className="container px-4 md:px-6 relative z-10">

                {/* Section Header */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-800/50 text-blue-400 text-xs font-mono">
                        <Globe className="w-3 h-3" />
                        MULTI_TENANT_ARCHITECTURE
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white">
                        Scale Your Legacy, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">Not Your Stress.</span>
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        Manage multiple campuses from one dashboard. Unified financials, centralized security, and campus-specific logistics—all in one Platinum environment.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bento-card p-2 md:p-8 bg-[#0F1115]/50 border-white/5">

                    {/* LEFT: The Empire Map */}
                    <div className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 group">
                        <img
                            src="/visuals/lagos-empire-map.png"
                            alt="Lagos Command Center Map"
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-transparent opacity-80" />

                        {/* Floating Metric Overlay */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-xl flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-400 uppercase font-bold">Total Group Revenue</div>
                                    <div className="text-xl font-bold text-white tracking-widest">₦925,000,000</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Glowing Marker for Selected Campus */}
                        {selectedCampus.id === 'lekki' && (
                            <div className="absolute top-[60%] right-[30%] w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_30px_rgba(34,211,238,0.8)] animate-ping" />
                        )}
                        {/* We could add markers for others based on map position, but for static generated map, visual cues are enough */}
                    </div>

                    {/* RIGHT: Campus Switcher Logic */}
                    <div className="space-y-8 p-4">
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-white">Centralized Command</h3>
                            <p className="text-slate-400 text-sm">
                                Switch between campus databases instantly. Each branch runs on an isolated partition, ensuring zero data leakage between Surulere and Lekki.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {campuses.map((campus) => (
                                <button
                                    key={campus.id}
                                    onClick={() => setSelectedCampus(campus)}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${selectedCampus.id === campus.id
                                            ? "bg-blue-600/10 border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.1)]"
                                            : "bg-white/5 border-white/5 hover:bg-white/10"
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedCampus.id === campus.id ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-500"
                                            }`}>
                                            <Building2 className="w-4 h-4" />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-white font-bold">{campus.name}</div>
                                            <div className="text-xs font-mono text-slate-500">{campus.subdomain}</div>
                                        </div>
                                    </div>

                                    {selectedCampus.id === campus.id && (
                                        <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded">
                                            <ShieldCheck className="w-3 h-3" />
                                            ACTIVE
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800/50 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs text-slate-400 font-mono">
                                SYSTEM STATUS: <span className="text-white">FORENSIC LOGS SYNCING ACROSS ALL NODES</span>
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
