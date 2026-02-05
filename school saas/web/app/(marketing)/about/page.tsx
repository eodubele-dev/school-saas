'use client'

import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { motion } from "framer-motion"
import { Sparkles, Leaf, Zap, Globe, Shield } from "lucide-react"
import { GlowCursor } from "@/components/landing/ui/glow-cursor"

export default function AboutUs() {
    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-cyan-500 selection:text-black">
            <GlowCursor />
            <Navbar />

            <main className="pt-32 pb-24 px-6 relative overflow-hidden">
                {/* Background Narrative Glow */}
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px]" />

                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="mb-24 text-center">
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
                            className="text-5xl md:text-7xl font-bold tracking-tight mb-8"
                        >
                            Elevating <br /> <span className="text-cyan-400">African Education</span>
                        </motion.h1>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="h-px w-24 bg-gradient-to-r from-transparent via-cyan-500 to-transparent mx-auto"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-32">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-6 text-slate-300 text-lg leading-relaxed"
                        >
                            <p>
                                At EduFlow, we believe the administrative burden of running a school in West Africa shouldn't overshadow the mission of educating the next generation.
                            </p>
                            <p>
                                Every year, billions of Naira are lost to fee leakage, and thousands of hours are wasted on manual report cards and grade processing. Our mission is to eliminate paper-based inefficiency and replace it with a <strong>Platinum-grade Operating System</strong>.
                            </p>
                            <div className="flex items-center gap-4 pt-4">
                                <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                                    <Leaf className="w-6 h-6 text-cyan-400" />
                                </div>
                                <div>
                                    <div className="font-bold text-white">Zero-Paper Vision</div>
                                    <div className="text-sm text-slate-500 italic">Targeting 500+ schools by 2026</div>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="relative aspect-square rounded-[40px] border border-white/5 bg-[#111113] overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.15)_0%,transparent_70%)]" />
                            <div className="absolute inset-x-8 bottom-8 p-8 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10">
                                <div className="text-3xl font-bold text-white mb-1">99.9%</div>
                                <div className="text-xs text-slate-500 uppercase font-mono tracking-widest">System Architecture Uptime</div>
                            </div>
                            {/* Abstract Tech Patterns */}
                            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
                        </motion.div>
                    </div>

                    {/* Core Pillars */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Financial Integrity", desc: "Plugging every leak with forensic audit logs and automated ledger synchronization.", icon: Shield },
                            { title: "Academic Velocity", desc: "From grading to terminals in seconds. AI-assisted remarks and instant parent notifications.", icon: Zap },
                            { title: "Global Standards", desc: "Bringing Silicon Valley technology to the heart of African education with local expertise.", icon: Globe },
                        ].map((pillar, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + (i * 0.1) }}
                                className="bg-[#111113] border border-white/5 p-8 rounded-3xl group hover:bg-white/[0.02] transition-colors"
                            >
                                <pillar.icon className="w-8 h-8 text-cyan-400 mb-6 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold mb-4">{pillar.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{pillar.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
