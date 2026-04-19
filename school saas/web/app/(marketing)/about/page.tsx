'use client'

import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { motion } from "framer-motion"
import { Sparkles, Leaf, Zap, Globe, Shield, BookOpen, Users, Building, ArrowRight } from "lucide-react"
import { GlowCursor } from "@/components/landing/ui/glow-cursor"
import { ScrollReveal } from "@/components/landing/ui/scroll-reveal"

export default function AboutUs() {
    return (
        <div className="min-h-screen bg-[#000000] text-white selection:bg-cyan-500 selection:text-black">
            <GlowCursor />
            <Navbar />

            <main className="pt-32 pb-24 relative overflow-hidden">
                {/* Background Narrative Glow */}
                <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
                <div className="absolute top-[60%] right-0 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[140px] pointer-events-none" />

                <div className="container px-4 md:px-6 relative z-10">
                    <div className="mb-24 text-center max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/30 border border-blue-500/20 text-blue-400 text-xs font-mono uppercase tracking-widest mb-8"
                        >
                            <Sparkles className="w-3 h-3 text-cyan-400" /> The_Mission_Statement
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]"
                        >
                            Elevating <br /> <span className="text-blue-500">African Education</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto"
                        >
                            We are building the Platinum standard of school management—eliminating paper, stopping fee leaks, and giving elite Proprietors the ultimate God-Mode.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="h-px w-32 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto mt-12"
                        />
                    </div>

                    {/* Bento Grid layout for The Vision */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-6xl mx-auto mb-32">
                        
                        {/* Huge Image Card */}
                        <ScrollReveal className="md:col-span-8">
                            <div className="bento-card h-full min-h-[400px] bg-[#252936]/80 backdrop-blur-md hover:bg-[#2D3245] border border-white/10 hover:border-blue-500/80 rounded-[32px] overflow-hidden group relative p-8 md:p-12 flex flex-col justify-end transition-all duration-500 shadow-2xl">
                                <div className="absolute inset-0 z-0">
                                    <div className="absolute inset-0 bg-blue-600/[0.02] mix-blend-overlay pointer-events-none" />
                                    {/* Abstract Data Grid Pattern SVG */}
                                    <svg className="absolute inset-0 w-full h-full opacity-20 group-hover:scale-105 transition-transform duration-1000" xmlns="http://www.w3.org/2000/svg">
                                        <defs>
                                            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-cyan-500/20"/>
                                            </pattern>
                                        </defs>
                                        <rect width="100%" height="100%" fill="url(#gridPattern)" />
                                    </svg>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                                </div>
                                
                                <div className="relative z-10 space-y-4 max-w-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                                            <Leaf className="w-6 h-6 text-cyan-400" />
                                        </div>
                                        <div className="font-bold text-white text-xl">The Zero-Paper Vision</div>
                                    </div>
                                    <p className="text-slate-300 text-lg sm:text-xl leading-relaxed">
                                        &quot;Our mission is to eliminate paper-based inefficiency and replace it with a Platinum-grade Operating System. No more manual report cards. No more lost ledgers.&quot;
                                    </p>
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Stat Card */}
                        <ScrollReveal className="md:col-span-4" delay={0.2}>
                            <div className="bento-card h-full bg-[#252936]/80 backdrop-blur-md hover:bg-[#2D3245] border border-white/10 hover:border-blue-500/80 rounded-[32px] p-8 relative overflow-hidden group flex flex-col justify-center items-center text-center transition-all duration-500 shadow-2xl">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.15)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                
                                <Globe className="w-12 h-12 text-slate-700 mb-6 group-hover:text-cyan-500 transition-colors duration-500" />
                                
                                <div className="text-6xl font-bold tracking-tighter text-white mb-2 group-hover:scale-110 transition-transform duration-500">
                                    500<span className="text-cyan-500">+</span>
                                </div>
                                <div className="text-sm text-slate-500 uppercase font-mono tracking-widest">
                                    Target Elite Schools By 2026
                                </div>
                            </div>
                        </ScrollReveal>
                        
                    </div>

                    {/* Core Pillars */}
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Our Core Philosophy</h2>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Built from the ground up to solve the actual, undocumented problems facing African institutions today.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: "Financial Integrity", desc: "Plugging every leak with forensic audit logs and automated ledger synchronization. Cash bleeding stops on day one.", icon: Shield },
                                { title: "Academic Velocity", desc: "From grading to terminals in seconds. AI-assisted remarks and instant parent notifications eliminate midnight marking.", icon: Zap },
                                { title: "Global Standards", desc: "Bringing Silicon Valley technology to the heart of African education with intense local expertise.", icon: Building },
                            ].map((pillar, i) => (
                                <ScrollReveal key={i} delay={i * 0.1}>
                                    <div className="h-full bg-[#252936]/80 backdrop-blur-md border border-white/10 p-8 rounded-[24px] group hover:border-blue-500/80 transition-all duration-500 shadow-xl hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] relative overflow-hidden">
                                        <div className="absolute right-0 top-0 w-32 h-32 bg-gradient-to-bl from-white/[0.05] to-transparent pointer-events-none rounded-bl-full" />
                                        
                                        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-cyan-500/10 transition-all duration-300">
                                            <pillar.icon className="w-6 h-6 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-4 text-white">{pillar.title}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed">{pillar.desc}</p>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
