"use client"

import { motion } from "framer-motion"
import { Check, Lock, Sparkles, Smartphone, ChevronRight } from "lucide-react"
import { useExecutiveConversion } from "./executive-context"

export function RevenueEngineBento() {
    const { highlightedSection } = useExecutiveConversion()
    return (
        <section id="revenue-engine" className={`py-24 bg-[#000000] relative overflow-hidden transition-all duration-1000 ${highlightedSection === 'revenue-engine' ? 'ring-inset ring-8 ring-emerald-500/20 shadow-[inset_0_0_100px_rgba(16,185,129,0.1)]' : ''}`}>

            {/* Background: 5% Opacity Blue Wave Pattern (Matching Forensic Section) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='30' viewBox='0 0 60 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 15 20, 30 10 T 60 10' fill='none' stroke='%233B82F6' stroke-width='1.5'/%3E%3C/svg%3E")`,
                        backgroundSize: '60px 30px',
                        maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)'
                    }}
                />
            </div>

            <div className="container px-4 md:px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left: The 3D Phone Mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative perspective-1000 flex justify-center lg:justify-end"
                    >
                        {/* Atmospheric Glow */}
                        <div className="bg-glow left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />

                        {/* The Phone Container */}
                        <div
                            className="relative w-[300px] h-[600px] bg-[#1a1a1a] rounded-[3rem] border-8 border-[#2a2a2a] shadow-2xl transform rotate-y-[-15deg] rotate-x-[5deg] hover:rotate-y-[-5deg] transition-transform duration-700"
                            style={{
                                boxShadow: '50px 50px 100px -20px rgba(0,0,0,0.5), 0 30px 60px -30px rgba(0, 255, 255, 0.1)',
                            }}
                        >
                            {/* Inner Glow / Screen */}
                            <div className="absolute inset-0 bg-black rounded-[2.5rem] overflow-hidden border border-white/5 relative">
                                {/* Status Bar (Fake) */}
                                <div className="absolute top-0 w-full h-8 flex justify-between px-6 pt-3 z-30">
                                    <div className="text-[10px] text-white font-medium">9:41</div>
                                    <div className="flex gap-1">
                                        <div className="w-4 h-2.5 bg-white rounded-[1px]" />
                                        <div className="w-0.5 h-2.5 bg-white/30 rounded-[1px]" />
                                    </div>
                                </div>

                                {/* App UI - Header */}
                                <div className="pt-12 px-6 pb-6 bg-[#0B1221] border-b border-white/10 z-20 relative">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">E</div>
                                        <div>
                                            <h3 className="text-white text-sm font-bold">EduCare High</h3>
                                            <p className="text-slate-400 text-xs">Term 2 Result Sheet</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
                                            <div>
                                                <div className="text-white text-xs font-bold">Chioma Okeke</div>
                                                <div className="text-emerald-400 text-[10px]">Promoted</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* The "Tease" - Blurred Content */}
                                <div className="relative p-6 pt-8 space-y-4 filter blur-[8px] opacity-60 select-none pointer-events-none">
                                    {/* Fake Table Rows */}
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="flex justify-between py-2 border-b border-white/10">
                                            <div className="w-24 h-3 bg-slate-700/50 rounded" />
                                            <div className="w-8 h-3 bg-green-500/50 rounded" />
                                            <div className="w-8 h-3 bg-slate-700/50 rounded" />
                                        </div>
                                    ))}
                                    <div className="flex justify-between py-2 border-b border-white/10">
                                        <div className="w-24 h-3 bg-slate-700/50 rounded" />
                                        <div className="w-8 h-3 bg-red-500/50 rounded" />
                                        <div className="w-8 h-3 bg-slate-700/50 rounded" />
                                    </div>
                                </div>
                                {/* The Paywall Overlay */}
                                <div className="absolute inset-0 top-[100px] z-30 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-transparent via-black/80 to-black">
                                    <div className="w-full bg-[#1e293b]/90 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col items-center text-center shadow-2xl">
                                        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                                            <Lock className="w-6 h-6 text-red-500" />
                                        </div>
                                        <h4 className="text-white font-bold text-lg mb-1">Result Locked</h4>
                                        <p className="text-slate-400 text-xs mb-6 max-w-[200px]">
                                            Please clear outstanding fees to view full academic performance.
                                        </p>
                                        <div className="text-2xl font-bold text-white mb-6 text-glow-cyan">₦45,000</div>

                                        <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse flex items-center justify-center gap-2 transition-all">
                                            Pay Now <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Floating 'Payment Verified' Badge (Visual Flourish) */}
                                    <div className="mt-6 bg-[#0B1221] border border-emerald-500/30 p-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce-slow min-w-[200px]">
                                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <Check className="w-3 h-3 text-emerald-400" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-emerald-400 font-bold uppercase">Payment Verified</div>
                                            <div className="text-[10px] text-slate-400">Just now • Via Transfer</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>


                    {/* Right: Typography & Context */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="space-y-8 text-left"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/30 border border-blue-500/20 text-blue-400 text-xs font-mono">
                            <Smartphone className="w-3 h-3" />
                            REVENUE_RECOVERY IsActive:True
                        </div>

                        <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                            Automated <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Revenue Recovery.</span>
                        </h2>

                        <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all duration-700 max-w-fit ${highlightedSection === 'revenue-engine' ? 'bg-emerald-500/20 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)] scale-105' : 'bg-white/5 border-white/10'}`}>
                            <Sparkles className="w-5 h-5 text-emerald-400" />
                            <div>
                                <div className="text-white font-bold tracking-tight text-lg">₦9M Recovery Hook</div>
                                <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest leading-none">Lagos Pilot Success</div>
                            </div>
                        </div>

                        <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-lg">
                            Stop chasing parents. Simply lock the results. <br />
                            The <span className="text-white font-medium">psychological urgency</span> of a blurred report card drives instant payments.
                        </p>

                        <div className="flex flex-col gap-4">
                            {[
                                "Blurred Results enforce fee payment automatically.",
                                "Parents can still see attendance & daily reports.",
                                "Instant automated receipt generation."
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 text-slate-300">
                                    <div className="min-w-[20px] h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-blue-400" />
                                    </div>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
