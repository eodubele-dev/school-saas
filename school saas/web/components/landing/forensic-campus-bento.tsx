"use client"

import { motion } from "framer-motion"
import { Shield, Sparkles, AlertTriangle, UserCheck } from "lucide-react"
import { useExecutiveConversion } from "./executive-context"

export function ForensicCampusBento() {
    const { highlightedSection } = useExecutiveConversion()
    return (
        <section className="py-24 bg-[#000000] relative overflow-hidden">

            {/* Background: 5% Opacity Blue Wave Pattern */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='30' viewBox='0 0 60 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 15 20, 30 10 T 60 10' fill='none' stroke='%233B82F6' stroke-width='1.5'/%3E%3C/svg%3E")`,
                        backgroundSize: '60px 30px',
                        maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)' // Subtle fade
                    }}
                />
            </div>

            <div className="container px-4 md:px-6 relative z-10">

                {/* Section Header - Command Center Narrative */}
                <div className="mb-14 max-w-4xl mx-auto text-center">

                    <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-[1.1]">
                        The Institutional <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Command Center</span>.
                    </h2>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                        Total oversight of your campus performance, revenue, and demographics. <br className="hidden md:block" />
                        One dashboard to <span className="text-foreground font-medium">verify</span>, <span className="text-foreground font-medium">analyze</span>, and <span className="text-foreground font-medium">decide</span>.
                    </p>
                </div>

                {/* Single, High-Impact Feature Card - FULL VIEW & CLEAN */}
                <div className="relative">
                    {/* Atmospheric Glow */}
                    <div className="bg-glow left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />

                    <motion.div
                        id="audit-integrity"
                        whileHover={{ y: -8, scale: 1.01 }}
                        className={`w-full bento-card overflow-hidden relative group transition-all duration-700 shadow-[0_80px_150px_-30px_rgba(0,0,0,1)] hover:border-blue-500/50 ${highlightedSection === 'audit-integrity' ? 'ring-4 ring-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.5)] scale-[1.01] z-30' : ''}`}
                    >
                        {/* High Fidelity Mockup Image - Full Unconstrained View */}
                        <div className="relative z-0">
                            <img
                                src="/visuals/professional-forensic-mockup.png"
                                alt="EduFlow Command Center Dashboard"
                                className="w-full h-auto object-contain block opacity-100 group-hover:scale-[1.02] transition-transform duration-[3000ms] ease-out"
                            />
                            {/* Subtle Blue Glow Overlay */}
                            <div className="absolute inset-0 bg-blue-600/[0.01] mix-blend-overlay z-10 pointer-events-none" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
