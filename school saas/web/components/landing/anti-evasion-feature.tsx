"use client"

import { ShieldAlert, Network, CheckCircle2, LockKeyhole } from "lucide-react"
import { motion } from "framer-motion"

export function AntiEvasionFeature() {
    return (
        <section className="py-24 bg-slate-950 px-6 border-t border-b border-white/5 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-[1400px] mx-auto">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left Column: Copy & Value Proposition */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-8 z-10"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold tracking-wide uppercase"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            New: Inter-School Clearance Network
                        </motion.div>

                        <div className="space-y-6">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                                className="text-4xl md:text-5xl font-extrabold text-white leading-[1.1]"
                            >
                                Stop Fee Evasion <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-500">Dead in Its Tracks.</span>
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                                className="text-lg text-slate-400 leading-relaxed max-w-xl"
                            >
                                Tired of parents jumping to a new school just to avoid paying outstanding fees? EduFlow networks all our partner schools together to flag evasive parents <i>before</i> you admit them.
                            </motion.p>
                        </div>

                        <div className="space-y-5">
                            {[
                                { icon: Network, title: "Global Debt Dragnet", desc: "Instantly alerts your admin during registration if a parent owes money at any other EduFlow-powered institution.", color: "red" },
                                { icon: ShieldAlert, title: "Fuzzy-Match Fingerprinting", desc: "Parents changing numbers? Our algorithm checks student and parent names combined to prevent SIM-card evasion tactics.", color: "cyan" },
                                { icon: LockKeyhole, title: "100% Privacy Compliant", desc: "We protect your school's data. Exact debt amounts and school names are never shared—only a High/Medium confidence warning.", color: "green" }
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.5 + (i * 0.1), duration: 0.5 }}
                                    className="flex items-start gap-4"
                                >
                                    <div className={`mt-1 bg-${feature.color}-500/10 p-2 rounded-lg border border-${feature.color}-500/20 shrink-0`}>
                                        <feature.icon className={`h-5 w-5 text-${feature.color}-400`} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                                        <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Column: Visual Proof (Browser Mockup) */}
                    <motion.div
                        initial={{ opacity: 0, x: 30, scale: 0.95 }}
                        whileInView={{ opacity: 1, x: 0, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1, ease: "circOut" }}
                        className="relative z-10 lg:ml-auto w-full max-w-[600px]"
                    >
                        {/* Glow Behind Mockup */}
                        <motion.div
                            animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.05, 1] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 bg-gradient-to-tr from-red-500/20 to-amber-500/10 blur-3xl transform -rotate-6 scale-105 rounded-3xl"
                        />

                        {/* Glassmorphic Mockup Container */}
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="relative bg-[#050B20]/80 rounded-2xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl"
                        >
                            {/* Browser Top Bar */}
                            <div className="flex items-center px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-slate-700/50" />
                                    <div className="w-3 h-3 rounded-full bg-slate-700/50" />
                                    <div className="w-3 h-3 rounded-full bg-slate-700/50" />
                                </div>
                                <div className="mx-auto bg-slate-900 border border-white/5 rounded-md px-4 py-1 flex items-center gap-2">
                                    <LockKeyhole className="h-3 w-3 text-slate-500" />
                                    <span className="text-xs text-slate-500 font-mono">admin.eduflow/admissions</span>
                                </div>
                            </div>

                            {/* Image Payload */}
                            <div className="p-4 bg-slate-950/50">
                                <img
                                    src="/debt-alert-mockup.png"
                                    alt="Global Debt Alert Notification"
                                    className="w-full h-auto rounded-lg border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.15)] object-contain"
                                />
                            </div>
                        </motion.div>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}
