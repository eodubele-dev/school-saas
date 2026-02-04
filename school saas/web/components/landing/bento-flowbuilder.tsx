"use client"

import { motion } from "framer-motion"
import { Shield, Sparkles, Wallet, ArrowRight, Check, AlertCircle } from "lucide-react"

export function BentoFlowBuilder() {
    return (
        <section className="py-24 bg-[#020410] relative overflow-hidden">
            <div className="container px-4 md:px-6 relative z-10">

                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Everything You Need, <span className="text-slate-500">In One View.</span>
                    </h2>
                    <p className="text-slate-400 text-lg">
                        Replace 5 fragmented tools with one cohesive operating system. Designed for speed, security, and clarity.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">

                    {/* Tile A: Finance Progress */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="group relative md:col-span-1 rounded-3xl bg-[#0B1221] border border-white/5 overflow-hidden p-6 flex flex-col justify-between"
                        style={{ boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.1)' }}
                    >
                        {/* Hover Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10">
                            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 text-blue-400">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Smart Finance</h3>
                            <p className="text-slate-400 text-sm">Automated fee collection with real-time tracking.</p>
                        </div>

                        <div className="relative z-10 space-y-3">
                            <div className="flex justify-between text-sm text-white">
                                <span>Term 1 Fees</span>
                                <span className="text-green-400 font-bold">100%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 shadow-[0_0_10px_#22c55e] w-full animate-pulse" />
                            </div>
                            <p className="text-xs text-slate-500">Target reached 2 days early</p>
                        </div>
                    </motion.div>

                    {/* Tile B: AI Remarks Feed */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="group relative md:col-span-1 rounded-3xl bg-[#0B1221] border border-white/5 overflow-hidden p-6 flex flex-col"
                        style={{ boxShadow: '0 0 0 1px rgba(168, 85, 247, 0.1)' }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10 flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">EduFlow AI</h3>
                                <p className="text-xs text-purple-400 animate-pulse">Generating remarks...</p>
                            </div>
                        </div>

                        <div className="relative z-10 flex-1 space-y-3">
                            <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 text-xs text-slate-300">
                                <span className="text-purple-400 font-bold block mb-1">Analyze: Student Performance</span>
                                "John has shown remarkable improvement in Mathematics, scoring 92% this term..."
                                <span className="inline-block w-1.5 h-4 ml-1 bg-purple-500 animate-blink align-middle" />
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                                <Check className="w-3 h-3 text-green-500" />
                                <span>Saved to report card</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Tile C: Security Audit Log (Spans full width on mobile, right on desktop) */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="group relative md:col-span-1 rounded-3xl bg-[#0B1221] border border-white/5 overflow-hidden p-6 flex flex-col"
                        style={{ boxShadow: '0 0 0 1px rgba(239, 68, 68, 0.1)' }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10 mb-6">
                            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 mb-4">
                                <Shield className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Grade Security</h3>
                            <p className="text-slate-400 text-sm">Tamper-proof audit logs.</p>
                        </div>

                        <div className="relative z-10 flex-1">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/50 border border-red-500/20">
                                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-white font-medium truncate">Grade Change Attempt</p>
                                        <p className="text-[10px] text-slate-500">Math 101 • 2 mins ago</p>
                                    </div>
                                    <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-bold uppercase">High</span>
                                </div>
                                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/30 border border-white/5 opacity-50">
                                    <Check className="w-4 h-4 text-slate-500 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-white font-medium truncate">Login: Bursar</p>
                                        <p className="text-[10px] text-slate-500">Success • 15 mins ago</p>
                                    </div>
                                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 text-[10px] font-bold uppercase">Log</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
