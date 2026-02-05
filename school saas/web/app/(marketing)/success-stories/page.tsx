'use client'

import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { motion } from "framer-motion"
import { Sparkles, TrendingUp, ShieldCheck, Quote, Building2, MapPin } from "lucide-react"
import { GlowCursor } from "@/components/landing/ui/glow-cursor"

const testimonials = [
    {
        proprietor: "Alhaji Kolawole O.",
        school: "Executive International College, Lekki",
        recovery: "₦4.2M recovered in Term 1",
        quote: "Before EduFlow, fee leakage was our biggest silent killer. The automated enforcement and forensic audit logs changed everything. We now have 100% financial clarity.",
        impact: "Zero-Paper Operations"
    },
    {
        proprietor: "Mrs. Chinelo A.",
        school: "Blue-Horizon Academy, Victoria Island",
        recovery: "₦2.8M recovered in 3 months",
        quote: "The parent portal and instant result delivery reduced our administrative overhead by 60%. My staff can finally focus on teaching instead of data entry.",
        impact: "60% Admin Efficiency"
    },
    {
        proprietor: "Pastor David E.",
        school: "Grace-Point Schools, Ikeja",
        recovery: "₦3.1M increased collection rate",
        quote: "The CBT system and automated report generation is mind-blowing. Our parents love the transparency, and the God-Mode app keeps me in control even when I'm traveling.",
        impact: "AI-Powered Grading"
    }
]

export default function SuccessStories() {
    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white selection:bg-cyan-500 selection:text-black">
            <GlowCursor />
            <Navbar />

            <main className="pt-32 pb-24 px-6 relative overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px]" />

                <div className="max-w-7xl mx-auto relative z-10">
                    {/* Header */}
                    <div className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-6"
                        >
                            <Sparkles className="w-3 h-3" /> Platinum_Case_Studies
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
                        >
                            The Revenue <span className="text-cyan-400">Recovery</span> Results
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed"
                        >
                            Discover how Lagos' most elite institutions are eliminating paper reports and recovering millions in lost revenue using EduFlow.
                        </motion.p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
                        {[
                            { label: "Total Revenue Recovered", val: "₦142M+", icon: TrendingUp, color: "text-emerald-400" },
                            { label: "Zero-Leakage Schools", val: "100%", icon: ShieldCheck, color: "text-blue-400" },
                            { label: "Elite Lagos Campuses", val: "24", icon: Building2, color: "text-cyan-400" },
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + (i * 0.1) }}
                                className="bg-[#111113] border border-white/5 p-8 rounded-3xl relative group overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <stat.icon className={`w-10 h-10 ${stat.color} mb-4`} />
                                <div className="text-3xl font-bold mb-1">{stat.val}</div>
                                <div className="text-slate-500 text-sm font-mono uppercase tracking-widest">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Testimonials Bento */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {testimonials.map((t, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + (i * 0.1) }}
                                className="bg-[#111113] border border-white/5 p-8 rounded-3xl flex flex-col justify-between hover:border-cyan-500/30 transition-all group"
                            >
                                <div>
                                    <div className="flex items-center gap-2 mb-6 text-emerald-400 font-mono text-xs font-bold">
                                        <TrendingUp className="w-4 h-4" /> {t.recovery}
                                    </div>
                                    <Quote className="w-10 h-10 text-white/10 mb-6 group-hover:text-cyan-500/20 transition-colors" />
                                    <p className="text-slate-300 leading-relaxed mb-8 italic">"{t.quote}"</p>
                                </div>
                                <div className="flex items-center gap-4 mt-auto pt-6 border-t border-white/5">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-bold text-white text-lg">
                                        {t.proprietor[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">{t.proprietor}</div>
                                        <div className="text-xs text-slate-500 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> {t.school}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
