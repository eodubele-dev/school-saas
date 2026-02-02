'use client'

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { ExecutiveDashVisual } from "@/components/landing/visuals/executive-dash-visual"
import { Wallet, Users, ShieldCheck } from "lucide-react"

export function HeroOrbit() {
    return (
        <section className="relative min-h-[110vh] flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden bg-[#020410]">
            {/* Deep Obsidian-to-Midnight-Blue Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#020410] via-[#050B20] to-[#020410]" />

            {/* Tech Grid Pattern */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none"></div>
            <div className="absolute inset-0 bg-[lambda(x,y):linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

            {/* Nebula Depth Effect (Electric Blue & Cyan) */}
            <div className="absolute top-[-20%] left-[-10%] w-[1200px] h-[1200px] bg-[#007BFF]/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-[#00F5FF]/5 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Orbit Container */}
            <div className="relative z-10 w-full max-w-7xl px-6 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                {/* Text Content Left */}
                <div className="flex-1 text-center lg:text-left space-y-8 relative z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center rounded-full border border-cyan-500/30 bg-cyan-950/20 px-4 py-1.5 text-xs font-medium text-cyan-400 backdrop-blur-md shadow-[0_0_20px_rgba(0,245,255,0.1)]"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-cyan-400 mr-2 animate-pulse shadow-[0_0_10px_rgba(0,245,255,0.8)]"></span>
                        Operating System for Top 1% Schools
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1] drop-shadow-[0_2px_10px_rgba(0,123,255,0.3)]"
                    >
                        Unlock Your School's <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 animate-gradient-x">Full Potential.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed"
                    >
                        Eliminate fee leakage, automate NERDC report cards, and give your parents a world-class digital experience—even offline.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start"
                    >
                        {/* Primary CTA: Solid Blue with Cyan Glow */}
                        <Button size="lg" className="bg-[#007BFF] hover:bg-[#0069D9] text-white rounded-full px-8 h-14 text-base shadow-[0_0_30px_rgba(0,123,255,0.4)] hover:shadow-[0_0_40px_rgba(0,245,255,0.5)] border-t border-white/20 transition-all hover:scale-105 duration-300 relative overflow-hidden group">
                            <span className="relative z-10 flex items-center">
                                Start Free Pilot
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                        </Button>

                        {/* Secondary CTA: Ghost with Cyan Border */}
                        <Button size="lg" variant="outline" className="border-cyan-500/30 bg-cyan-950/10 hover:bg-cyan-900/20 text-cyan-100 hover:text-white rounded-full px-8 h-14 text-base backdrop-blur-md transition-all hover:border-cyan-400/50">
                            Book Executive Demo
                        </Button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="pt-2 flex items-center justify-center lg:justify-start gap-6 text-sm text-cyan-200/60 font-medium"
                    >
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-cyan-500" /> CBN Compliant</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-cyan-500" /> NDPR Secure</span>
                    </motion.div>
                </div>

                {/* Orbit Visual Right */}
                <div className="flex-1 w-full max-w-[650px] aspect-square relative flex items-center justify-center perspective-[2000px]">
                    {/* Orbit Rings (Thin, Cyan/Blue) */}
                    <div className="absolute border border-cyan-500/10 rounded-full w-[140%] h-[140%] animate-[spin_60s_linear_infinite]" />
                    <div className="absolute border border-blue-500/20 rounded-full w-[100%] h-[100%]" />
                    <div className="absolute border border-indigo-500/10 rounded-full w-[70%] h-[70%]" />

                    {/* Central Dashboard - God View */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, rotateX: 20 }}
                        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative z-20 w-[95%] transform transition-transform hover:scale-[1.03] duration-500 shadow-[0_0_100px_rgba(0,123,255,0.15)] rounded-2xl"
                    >
                        {/* Backlight Glow */}
                        <div className="absolute -inset-1 bg-gradient-to-b from-cyan-500/20 to-blue-600/20 rounded-[2rem] blur-xl opacity-50" />
                        <ExecutiveDashVisual />
                    </motion.div>

                    {/* Orbiting Action Orbs (Translucent Blue) */}
                    {/* Orb 1: Revenue (Cyan Glow) */}
                    <motion.div
                        className="absolute top-[0%] left-[5%] z-30"
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <div className="relative group cursor-pointer">
                            <div className="absolute inset-0 bg-cyan-400 rounded-full blur-2xl opacity-20 group-hover:opacity-50 transition-opacity duration-500" />
                            <div className="h-16 w-16 bg-[#0B1028]/80 backdrop-blur-md border border-cyan-500/30 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,245,255,0.1)] group-hover:border-cyan-400 transition-colors">
                                <Wallet className="h-6 w-6 text-cyan-400" />
                            </div>
                            {/* Floating Data Badge */}
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 bg-[#0B1028]/90 border border-cyan-500/20 px-4 py-2 rounded-xl whitespace-nowrap opacity-100 shadow-xl backdrop-blur-md">
                                <div className="text-[10px] text-cyan-200 uppercase font-bold tracking-wider">Collected Today</div>
                                <div className="text-lg font-bold text-white drop-shadow-[0_0_10px_rgba(0,245,255,0.5)]">₦2.5M</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Orb 2: Staff (Electric Blue) */}
                    <motion.div
                        className="absolute bottom-[15%] right-[-8%] z-30"
                        animate={{ y: [0, 20, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    >
                        <div className="relative group cursor-pointer">
                            <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 group-hover:opacity-50 transition-opacity duration-500" />
                            <div className="h-20 w-20 bg-[#0B1028]/80 backdrop-blur-md border border-blue-500/30 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,123,255,0.2)] group-hover:border-blue-400 transition-colors">
                                <Users className="h-8 w-8 text-blue-400" />
                            </div>
                            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-4 bg-[#0B1028]/90 border border-blue-500/20 px-4 py-2 rounded-xl whitespace-nowrap opacity-100 shadow-xl backdrop-blur-md text-right">
                                <div className="text-[10px] text-blue-200 uppercase font-bold tracking-wider">Attendance</div>
                                <div className="text-lg font-bold text-white drop-shadow-[0_0_10px_rgba(0,123,255,0.5)]">98%</div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
