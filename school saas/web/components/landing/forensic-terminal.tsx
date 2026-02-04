"use client"

import { useRef } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { ShieldCheck, Activity, Globe, Eye, Lock } from "lucide-react"

export function ForensicTerminal() {
    const ref = useRef<HTMLDivElement>(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 })
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 })

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"])
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"])

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = ref.current?.getBoundingClientRect()
        const width = rect?.width
        const height = rect?.height

        if (!width || !height) return

        const mouseX = e.clientX - (rect.left + width / 2)
        const mouseY = e.clientY - (rect.top + height / 2)

        const xPct = mouseX / width
        const yPct = mouseY / height

        x.set(xPct)
        y.set(yPct)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    return (
        <section className="py-24 bg-[#020410] relative overflow-hidden">

            {/* Copy Section */}
            <div className="container px-4 md:px-6 relative z-10 mb-16 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/20 border border-red-500/20 text-red-400 text-xs font-mono mb-6">
                        <Activity className="w-3 h-3 animate-pulse" />
                        Live System Monitor
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        The Truth, <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">In Real-Time.</span>
                    </h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Eliminate the "Nigeria Factor" in your administration. From grade changes to invoice deletions, every action on your campus is logged, flagged, and immutable.
                    </p>
                </motion.div>
            </div>

            {/* The Forensic Terminal Display */}
            <div className="container px-4 md:px-6 relative z-10 perspective-1000">
                {/* Atmospheric Glow */}
                <div className="bg-glow left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />

                <div
                    className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto items-center"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    ref={ref}
                >

                    {/* LEFT WIDGET: Security Score */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="hidden lg:flex flex-col items-center justify-center w-48 h-48 bento-card p-4"
                    >
                        <div className="relative w-24 h-24 flex items-center justify-center mb-3">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                                <circle cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset="0" strokeLinecap="round" />
                            </svg>
                            <ShieldCheck className="absolute w-8 h-8 text-emerald-500" />
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">100%</div>
                            <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Integrity Score</div>
                        </div>
                    </motion.div>


                    {/* CENTER: The Terminal (Screenshot) */}
                    <motion.div
                        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                        className="flex-1 w-full relative group"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bento-card overflow-hidden shadow-2xl">

                            {/* Glossy Reflection */}
                            <div className="absolute inset-0 z-20 bg-gradient-to-br from-white/5 to-transparent pointer-events-none mix-blend-overlay" />

                            {/* Header Bar */}
                            <div className="h-8 bg-[#0f172a] border-b border-white/10 flex items-center px-4 gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                                </div>
                                <div className="ml-4 flex items-center gap-2 px-2 py-0.5 bg-black/50 rounded border border-white/5 text-[10px] text-slate-400 font-mono">
                                    <Lock className="w-2.5 h-2.5" />
                                    secure_logs.sys
                                </div>
                                <div className="ml-auto flex items-center gap-2">
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    <span className="text-[10px] text-green-400 font-bold uppercase">Live Feed</span>
                                </div>
                            </div>

                            {/* MAIN IMAGE */}
                            <div className="relative group/image">
                                <img
                                    src="/visuals/audit-log-preview.png"
                                    alt="System Audit Log Dashboard"
                                    className="w-full h-auto object-cover opacity-90 group-hover/image:opacity-100 transition-opacity duration-500"
                                />

                                {/* Overlay Gradient at bottom to fade into card */}
                                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#030712] to-transparent" />

                                {/* INTERACTIVE TOOLTIP overlay on "Grade Change" - Positioned relatively approx */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 1 }}
                                    className="absolute top-[40%] left-[10%] max-w-[200px] z-30"
                                >
                                    <div className="relative">
                                        {/* Target Ring */}
                                        <div className="absolute -left-2 -top-2 w-4 h-4 border border-red-500 rounded-full animate-ping" />
                                        <div className="absolute -left-1 -top-1 w-2 h-2 bg-red-500 rounded-full" />

                                        {/* Tooltip Box */}
                                        <div className="ml-4 bg-slate-900/90 border border-red-500/30 p-3 rounded-lg backdrop-blur-md shadow-xl">
                                            <h4 className="text-red-400 text-xs font-bold flex items-center gap-1 mb-1">
                                                <ShieldCheck className="w-3 h-3" />
                                                Unauthorized Edit
                                            </h4>
                                            <p className="text-[10px] text-slate-300 leading-tight">
                                                Automatic detection of unauthorized score modifications.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT WIDGET: Device Pulse */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="hidden lg:flex flex-col w-48 bento-card p-4"
                    >
                        <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
                            <Globe className="w-4 h-4 text-blue-400" />
                            <span className="text-xs font-bold text-white uppercase">Access Log</span>
                        </div>
                        <div className="space-y-3">
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <div className={`mt-1 w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} />
                                    <div>
                                        <p className="text-[10px] text-white font-mono">192.168.1.10{i}</p>
                                        <p className="text-[9px] text-slate-500">Lagos, NG • Chrome</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

        </section>
    )
}
