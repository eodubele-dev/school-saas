"use client"

import { motion } from "framer-motion"
import { Shield, Sparkles, AlertTriangle, UserCheck } from "lucide-react"
import { useExecutiveConversion } from "./executive-context"

export function ForensicCampusBento() {
    const { highlightedSection } = useExecutiveConversion()
    return (
        <section className="py-24 bg-[#000000] relative overflow-hidden">

            {/* Background: 5% Opacity Blue Wave Pattern */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='30' viewBox='0 0 60 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 15 20, 30 10 T 60 10' fill='none' stroke='%233B82F6' stroke-width='1.5'/%3E%3C/svg%3E")`,
                        backgroundSize: '60px 30px',
                        maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)' // Subtle fade
                    }}
                />
            </div>

            <div className="container px-4 md:px-6 relative z-10">

                {/* Section Header - Left Aligned for Technical/Forensic Feel */}
                <div className="mb-14 max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        SYSTEM_ARCH_V2.0
                    </div>

                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-[1.1]">
                        Forensic-Level <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Campus Control</span>.
                    </h2>
                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed">
                        Replace 5 fragmented tools with one cohesive operating system. <br className="hidden md:block" />
                        Designed for <span className="text-white font-medium">speed</span>, <span className="text-white font-medium">security</span>, and <span className="text-white font-medium">clarity</span>.
                    </p>
                </div>

                {/* The Asymmetrical Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6 auto-rows-[minmax(180px,auto)] relative">
                    {/* Atmospheric Glow */}
                    <div className="bg-glow left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />

                    {/* 1. The 'Integrity' Anchor (Center-Stage) */}
                    {/* Spans 4 columns, 2 rows */}
                    <motion.div
                        id="audit-integrity"
                        whileHover={{ y: -5 }}
                        className={`md:col-span-4 md:row-span-2 bento-card overflow-hidden relative group transition-all duration-700 ${highlightedSection === 'audit-integrity' ? 'ring-4 ring-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.5)] scale-[1.02] z-30' : ''}`}
                    >
                        {/* Floating Label */}
                        <div className="absolute top-4 right-4 px-2 py-1 bg-cyan-950/80 border border-cyan-500/30 rounded text-[10px] font-mono text-cyan-400 z-20">
                            SEC_ENFORCED_V1
                        </div>

                        {/* Image */}
                        <div className="absolute inset-0 z-0">
                            <img
                                src="/visuals/audit-log-preview.png"
                                alt="System Audit Log"
                                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#020410] via-transparent to-transparent" />
                        </div>

                        {/* Content Overlay */}
                        <div className="absolute bottom-0 left-0 p-6 z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="w-5 h-5 text-cyan-400" />
                                <h3 className="text-xl font-bold text-white">System Integrity</h3>
                            </div>
                            <p className="text-slate-300 text-sm max-w-md">
                                Tamper-proof logs tracks every grade change and unauthorized access attempt.
                            </p>
                        </div>
                    </motion.div>


                    {/* 2. The 'Financial Command' Slot (Top Right) */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="md:col-span-2 md:row-span-1 bento-card overflow-hidden relative group"
                    >
                        {/* Floating Label */}
                        <div className="absolute top-4 right-4 px-2 py-1 bg-blue-950/80 border border-blue-500/30 rounded text-[10px] font-mono text-blue-400 z-20">
                            REV_STREAMS_LIVE
                        </div>

                        <div className="absolute inset-0 z-0">
                            {/* Crop top part of bursar command */}
                            <img
                                src="/visuals/bursar-command.png"
                                alt="Bursar Command Center"
                                className="w-full h-full object-cover object-top opacity-80 group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#020410] to-transparent" />
                        </div>

                        <div className="absolute bottom-0 left-0 p-6 z-10">
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-4 h-4 text-blue-400" />
                                <h3 className="text-lg font-bold text-white">Financial Command</h3>
                            </div>
                            <p className="text-slate-400 text-xs">Instant revenue clarity.</p>
                        </div>
                    </motion.div>

                    {/* 3. The 'Zero-Leakage' Slot (Bottom Left) */}
                    <motion.div
                        id="campus-logistics"
                        whileHover={{ y: -5 }}
                        className={`md:col-span-3 md:row-span-1 bento-card overflow-hidden relative group transition-all duration-700 ${highlightedSection === 'campus-logistics' ? 'ring-4 ring-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.5)] scale-[1.02] z-30' : ''}`}
                    >
                        <div className="absolute top-4 right-4 px-2 py-1 bg-amber-950/80 border border-amber-500/30 rounded text-[10px] font-mono text-amber-400 z-20">
                            LOGISTICS_SYNC
                        </div>

                        <div className="absolute inset-0 z-0">
                            <img
                                src="/visuals/inventory-leakage.png"
                                alt="Inventory Tracking"
                                className="w-full h-full object-cover object-top opacity-80 group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#020410] to-transparent" />
                        </div>

                        <div className="absolute bottom-0 left-0 p-6 z-10">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="w-4 h-4 text-amber-400" />
                                <h3 className="text-lg font-bold text-white">Zero-Leakage</h3>
                            </div>
                            <p className="text-slate-400 text-xs">Stop resource theft with inventory tracking.</p>
                        </div>
                    </motion.div>

                    {/* 4. Dorm Master (Bottom Right) */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="md:col-span-3 md:row-span-1 bento-card overflow-hidden relative group"
                    >
                        <div className="absolute top-4 right-4 px-2 py-1 bg-purple-950/80 border border-purple-500/30 rounded text-[10px] font-mono text-purple-400 z-20">
                            SAFETY_UPLINK
                        </div>

                        <div className="absolute inset-0 z-0">
                            <img
                                src="/visuals/dorm-alerts.png"
                                alt="Dorm Alerts"
                                className="w-full h-full object-cover object-right opacity-80 group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#020410] to-transparent" />
                        </div>

                        <div className="absolute bottom-0 left-0 p-6 z-10">
                            <div className="flex items-center gap-2 mb-1">
                                <UserCheck className="w-4 h-4 text-purple-400" />
                                <h3 className="text-lg font-bold text-white">Dorm-Master</h3>
                            </div>
                            <p className="text-slate-400 text-xs">Real-time student safety alerts.</p>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
