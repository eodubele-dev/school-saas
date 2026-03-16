"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { History, Banknote, RefreshCw, LayoutDashboard, Fingerprint, BookOpenCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const features = [
    {
        title: "Forensic Audit Integrity",
        description: "Track every grade change and attendance modification with a permanent, immutable ledger. Instantly detect unauthorized attempts to alter academic performance records.",
        icon: History,
        color: "text-blue-400",
        bg: "bg-blue-400/10",
        border: "border-blue-400/20"
    },
    {
        title: "Revenue Recovery Loop",
        description: "Automate fee collection and reconciliation with direct bank integrations that eliminate manual receipt verification. Ensure that 100% of school revenue is accounted for.",
        icon: Banknote,
        color: "text-emerald-400",
        bg: "bg-emerald-400/10",
        border: "border-emerald-400/20"
    },
    {
        title: "Local-First Sync Engine",
        description: "Empower staff to record attendance and grades completely offline in remote campuses or during internet outages. The system automatically synchronizes data the moment connectivity is restored.",
        icon: RefreshCw,
        color: "text-cyan-400",
        bg: "bg-cyan-400/10",
        border: "border-cyan-400/20"
    },
    {
        title: "Global Command Center",
        description: "Manage a group of schools or multiple campuses from a single, unified executive dashboard. Switch between institutions instantly to monitor real-time financial health and performance.",
        icon: LayoutDashboard,
        color: "text-purple-400",
        bg: "bg-purple-400/10",
        border: "border-purple-400/20"
    },
    {
        title: "Anti-Evasion Ledger",
        description: "Monitor every student bus trip and campus exit with live manifests that ensure secure pickup and drop-off. Prevent unauthorized departures with digital oversight.",
        icon: Fingerprint,
        color: "text-amber-400",
        bg: "bg-amber-400/10",
        border: "border-amber-400/20"
    },
    {
        title: "Unified Academic Suite",
        description: "Host CBT exams, digital lesson plans, and automated report cards tailored for both British and Nigerian curricula. Streamline your entire academic workflow from classroom to evaluation.",
        icon: BookOpenCheck,
        color: "text-rose-400",
        bg: "bg-rose-400/10",
        border: "border-rose-400/20"
    }
]

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1] as any // Custom quintic ease-out
        }
    }
}

export function FeaturesSection() {
    return (
        <section id="features" className="py-32 bg-slate-950 px-6 border-t border-b border-border/50 relative overflow-hidden">
            {/* Parallax Background Effects */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 0.15, scale: 1 }}
                transition={{ duration: 2 }}
                className="absolute top-1/2 left-1/2 w-[1200px] h-[1200px] bg-blue-500/10 rounded-full blur-[160px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" 
            />
            
            <div className="container px-4 md:px-6 relative z-10 max-w-7xl mx-auto">
                <div className="text-center mb-20 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
                            Total Campus <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 animate-gradient-x">Governance.</span>
                        </h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-base md:text-lg font-normal leading-relaxed">
                            Beyond simple management. EduFlow provides the surgical precision required to run top-tier institutions in complex environments.
                        </p>
                    </motion.div>
                </div>

                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                >
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            variants={itemVariants}
                            className={cn(
                                "group relative p-8 rounded-2xl bg-[#050B20]/40 backdrop-blur-3xl border border-white/5 transition-all duration-700 overflow-hidden",
                                "hover:border-blue-500/50 hover:bg-[#070F2B]/90 hover:-translate-y-2 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]"
                            )}
                        >
                            {/* Animated Sweep Effect on Hover */}
                            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12" />
                            
                            {/* Inner Glow Effect */}
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center mb-8 transition-all duration-700 group-hover:scale-110 group-hover:shadow-[0_0_30px_-5px_currentColor] group-hover:rotate-6",
                                feature.bg,
                                feature.border,
                                feature.color
                            )}>
                                <feature.icon className="w-6 h-6" />
                            </div>
                            
                            <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors duration-500 tracking-tight">
                                {feature.title}
                            </h3>
                            <p className="text-slate-400 leading-relaxed text-sm font-normal opacity-70 group-hover:opacity-100 transition-opacity">
                                {feature.description}
                            </p>

                            {/* Corner Flare */}
                            <div className={cn(
                                "absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                            )} />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
