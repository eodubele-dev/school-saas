'use client'

import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { motion } from "framer-motion"
import { Sparkles, TrendingUp, ShieldCheck, Quote, Building2, MapPin, ArrowUpRight, BarChart3, CheckCircle2 } from "lucide-react"
import { GlowCursor } from "@/components/landing/ui/glow-cursor"
import { ScrollReveal } from "@/components/landing/ui/scroll-reveal"

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
    },
    {
        proprietor: "Dr. Adebayo C.",
        school: "Future-Leaders Academy, Abuja",
        recovery: "Reduced debtors by 84%",
        quote: "EduFlow's anti-evasion gates mean nobody gets a result without clearing their balance. It essentially pays for itself within the first week of deployment.",
        impact: "Automated Debt Recovery"
    },
    {
        proprietor: "Chief Nnamdi O.",
        school: "Pinnacle Heights, Surulere",
        recovery: "₦1.5M saved on printing",
        quote: "Moving from manual registers to biometrics and from paper report cards to EduFlow saved us immense printing costs. The software is brilliant.",
        impact: "Cost Reduction"
    }
]

export default function SuccessStories() {
    return (
        <div className="min-h-screen bg-[#000000] text-white selection:bg-cyan-500 selection:text-black">
            <GlowCursor />
            <Navbar />

            <main className="pt-32 pb-24 relative overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
                <div className="absolute top-[40%] left-[-20%] w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[140px] pointer-events-none" />

                <div className="container px-4 md:px-6 relative z-10">
                    
                    {/* Header */}
                    <div className="text-center mb-20 max-w-4xl mx-auto">
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
                            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[1.1]"
                        >
                            The Revenue <br className="hidden md:block" />
                            <span className="text-blue-500">Recovery</span> Results
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
                        >
                            Discover how Lagos&apos; most elite institutions are eliminating paper reports and recovering millions in lost revenue using EduFlow.
                        </motion.p>
                    </div>

                    {/* Featured Mega Case Study */}
                    <ScrollReveal className="max-w-6xl mx-auto mb-24">
                        <div className="bento-card bg-gradient-to-br from-[#0F1115] to-[#0A0A0B] border border-border/50 rounded-[32px] overflow-hidden group">
                            <div className="grid grid-cols-1 lg:grid-cols-2">
                                <div className="p-8 md:p-12 flex flex-col justify-between">
                                    <div>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold uppercase mb-8 border border-emerald-500/20">
                                            <TrendingUp className="w-3 h-3" /> Featured Success
                                        </div>
                                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                                            How Executive College stopped a ₦4.2M yearly leakage.
                                        </h2>
                                        <p className="text-slate-400 text-lg leading-relaxed mb-8">
                                            "We were losing track of who paid what across three different ledgers. 
                                            EduFlow unified our accounting and academic gates. If they haven't paid, they don't see results. It's brilliant."
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold border border-white/10">
                                            AK
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-lg">Alhaji Kolawole O.</div>
                                            <div className="text-sm text-slate-500">Proprietor, Executive College</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#111318] p-8 md:p-12 border-l border-white/5 relative overflow-hidden flex flex-col justify-center">
                                    {/* Glass reflection */}
                                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/[0.05] to-transparent pointer-events-none" />
                                    
                                    <h3 className="text-sm uppercase tracking-widest text-slate-500 font-mono mb-8">The Platinum Impact</h3>
                                    
                                    <div className="space-y-6 relative z-10">
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                                                    <BarChart3 className="w-5 h-5" />
                                                </div>
                                                <span className="text-slate-300 font-medium">Debt Recovery Rate</span>
                                            </div>
                                            <span className="text-2xl font-bold text-white">98%</span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </div>
                                                <span className="text-slate-300 font-medium">Admin Efficiency</span>
                                            </div>
                                            <span className="text-2xl font-bold text-white">+60%</span>
                                        </div>

                                        <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                                                    <ShieldCheck className="w-5 h-5" />
                                                </div>
                                                <span className="text-slate-300 font-medium">Grade Tampering</span>
                                            </div>
                                            <span className="text-2xl font-bold text-white">0 Incidents</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-24">
                        {[
                            { label: "Total Revenue Recovered", val: "₦142M+", icon: TrendingUp, color: "text-emerald-400" },
                            { label: "Zero-Leakage Schools", val: "100%", icon: ShieldCheck, color: "text-blue-400" },
                            { label: "Elite Lagos Campuses", val: "24", icon: Building2, color: "text-cyan-400" },
                        ].map((stat, i) => (
                            <ScrollReveal key={i} delay={0.2 + (i * 0.1)}>
                                <div className="bg-[#0F1115] border border-border/50 p-8 rounded-[24px] relative group overflow-hidden hover:border-blue-500/50 transition-colors">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <stat.icon className={`w-10 h-10 ${stat.color} mb-4`} />
                                    <div className="text-4xl font-bold mb-2 text-white">{stat.val}</div>
                                    <div className="text-slate-500 text-sm font-mono uppercase tracking-widest">{stat.label}</div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>

                    {/* Masonry-Style Testimonials Bento */}
                    <div className="max-w-6xl mx-auto columns-1 md:columns-2 lg:columns-3 gap-6">
                        {testimonials.map((t, i) => (
                            <ScrollReveal key={i} delay={0.3 + (i % 3) * 0.1} className="break-inside-avoid mb-6 block w-full">
                                <div className="bg-[#0F1115] border border-border/50 p-8 rounded-[24px] flex flex-col justify-between hover:border-blue-500/50 transition-all shadow-lg hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] group h-full">
                                    <div>
                                        <div className="flex items-center gap-2 mb-6 text-emerald-400 font-mono text-xs font-bold uppercase">
                                            <TrendingUp className="w-3 h-3" /> {t.recovery}
                                        </div>
                                        <Quote className="w-8 h-8 text-white/5 mb-4 group-hover:text-cyan-500/20 transition-colors" />
                                        <p className="text-slate-300 leading-relaxed mb-8 sm:text-lg">&quot;{t.quote}&quot;</p>
                                    </div>
                                    <div className="flex items-center gap-4 mt-auto pt-6 border-t border-white/5">
                                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center font-bold text-white text-lg group-hover:bg-cyan-500/10 group-hover:text-cyan-400 transition-colors">
                                            {t.proprietor[0]}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white">{t.proprietor}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                                <MapPin className="w-3 h-3" /> {t.school}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
