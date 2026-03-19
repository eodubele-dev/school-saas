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

                    {/* Left: The Photorealistic Phone Mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative flex justify-center lg:justify-end group"
                    >
                        {/* Atmospheric Glow */}
                        <div className="bg-glow left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60" />

                        {/* High Fidelity Mockup Image */}
                        <div className="relative z-10 max-w-[500px] w-full">
                            <img
                                src="/visuals/revenue-recovery-phone-mockup.png"
                                alt="Realistic smartphone mockup showing the EduFlow result lock screen"
                                className="w-full h-auto drop-shadow-[0_50px_100px_rgba(0,0,0,0.8)] group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                            />
                            
                            {/* Decorative Glow Ring */}
                            <div className="absolute inset-0 border border-emerald-500/10 rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        </div>
                    </motion.div>


                    {/* Right: Typography & Context */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="space-y-8 text-left"
                    >

                        <h2 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                            Automated <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Revenue Recovery.</span>
                        </h2>

                        <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all duration-700 max-w-fit ${highlightedSection === 'revenue-engine' ? 'bg-orange-500/20 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.4)] scale-105' : 'bg-secondary/50 border-border'}`}>
                            <Sparkles className="w-5 h-5 text-orange-500" />
                            <div>
                                <div className="text-foreground font-bold tracking-tight text-lg">₦9M Recovery Hook</div>
                                <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest leading-none">Lagos Pilot Success</div>
                            </div>
                        </div>

                        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
                            Stop chasing parents. Simply lock the results. <br />
                            The <span className="text-foreground font-medium">psychological urgency</span> of a blurred report card drives instant payments.
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
