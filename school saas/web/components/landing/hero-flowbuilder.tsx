"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { PlayCircle, Play, ChevronRight, Monitor } from "lucide-react"
import { useExecutiveConversion } from "./executive-context"
import { SITE_CONFIG } from "@/lib/constants/site-config"

export function HeroFlowBuilder() {
    const { openTenantPreview, triggerVideoDemo } = useExecutiveConversion()
    
    // Parallax Logic
    const ref = useRef<HTMLDivElement>(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 30 })
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 30 })

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"])
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"])

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
        <section id="home" className="relative min-h-[100vh] flex items-center justify-center pt-32 pb-20 overflow-hidden bg-[#000000]">

            {/* 1. Background: 'Blue Obsidian' Canvas (Lighting Only) */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-[#000000]">
                {/* Atmospheric Lighting */}
                <div
                    className="absolute top-[20%] left-[10%] w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-40 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #0066FF 0%, transparent 70%)' }}
                />
                <div
                    className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[120px] opacity-40 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #0066FF 0%, transparent 70%)' }}
                />
            </div>

            <div className="container relative z-10 px-4 md:px-6">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-12">

                    {/* LEFT: Copy & CTA */}
                    <div className="flex-1 text-center lg:text-left space-y-8 max-w-2xl mx-auto lg:mx-0 relative z-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-5xl md:text-7xl font-[800] tracking-tighter text-foreground leading-[1.05] drop-shadow-2xl">
                                <span className="text-blue-500">Supercharge</span> your campus, streamline your success.
                            </h1>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed"
                        >
                            Everything you need to run a top-tier institution. Automate finances, secure grades, and delight parents with a world-class experience.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
                        >
                            <button
                                onClick={openTenantPreview}
                                className="group relative px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-full overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-[0_20px_40px_rgba(37,99,235,0.4)] w-full sm:w-auto text-center border border-blue-500/50 z-10"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Access Portal (Web)
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>
                            <button
                                onClick={() => window.open(SITE_CONFIG.links.download.windows, '_blank')}
                                className="group px-8 py-4 bg-[#0F1115] hover:bg-slate-900 text-white font-semibold text-lg rounded-full border border-white/10 hover:border-white/20 transition-all hover:scale-[1.02] active:scale-95 w-full sm:w-auto flex items-center justify-center gap-3 shadow-2xl z-10"
                            >
                                <Monitor className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                                Download Desktop
                            </button>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center gap-6 justify-center lg:justify-start pt-4"
                        >
                            <button
                                onClick={triggerVideoDemo}
                                className="text-sm font-semibold text-slate-500 hover:text-white flex items-center gap-2 transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-600/20 group-hover:border-blue-500/50 transition-all">
                                    <Play className="w-3 h-3 fill-current text-slate-400 group-hover:text-blue-400" />
                                </div>
                                See it in action
                            </button>
                            <div className="h-4 w-px bg-white/10" />
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-mono font-semibold">
                                Windows · MacOS · Linux
                            </p>
                        </motion.div>
                    </div>

                    {/* RIGHT: Moody Cinematic Visual (Dark & Premium) */}
                    <div
                        className="flex-1 w-full max-w-[900px] relative hidden lg:block"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        ref={ref}
                    >
                        <motion.div
                            style={{ 
                                rotateX, 
                                rotateY, 
                                transformStyle: "preserve-3d",
                                perspective: "1500px" 
                            }}
                            className="w-full relative flex items-center justify-center p-4"
                        >
                            {/* Central Visual Element - High Contrast / Sharp Edges */}
                            <motion.div
                                style={{ transform: "translateZ(50px)" }}
                                className="relative w-full border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] overflow-hidden group bg-black"
                            >
                                {/* Main Image - Localized Cinematic Nigerian Visual */}
                                <img
                                    src="/visuals/teacher-hero-nigerian.png"
                                    alt="Cinematic Nigerian Teacher Experience"
                                    className="w-full h-auto object-contain block opacity-100 brightness-[0.85] contrast-[1.1] group-hover:scale-[1.02] transition-all duration-1000"
                                />

                                {/* Targeted Image Grid Overlay */}
                                <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.35]"
                                    style={{
                                        backgroundImage: `linear-gradient(rgba(34, 211, 238, 0.45) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(34, 211, 238, 0.45) 1.5px, transparent 1.5px)`,
                                        backgroundSize: '40px 40px',
                                    }}
                                />

                                {/* Subtle Edge Blending */}
                                <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 pointer-events-none" />
                                <div className="absolute inset-0 bg-blue-600/[0.05] mix-blend-overlay z-10 pointer-events-none" />
                                
                                {/* Dramatic Play Trigger */}
                                <motion.div 
                                    animate={{ 
                                        y: [0, -5, 0], 
                                        scale: [1, 1.05, 1],
                                        boxShadow: ["0 0 30px rgba(59,130,246,0.3)", "0 0 70px rgba(59,130,246,0.6)", "0 0 30px rgba(59,130,246,0.3)"]
                                    }} 
                                    transition={{ duration: 4, repeat: Infinity }}
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-7 rounded-full bg-blue-600/20 border border-blue-500/50 backdrop-blur-3xl z-20 cursor-pointer hover:bg-blue-600/40 transition-all duration-500 group/btn"
                                    onClick={triggerVideoDemo}
                                >
                                    <PlayCircle className="w-14 h-14 text-blue-400 group-hover/btn:text-white group-hover/btn:scale-110 transition-all" />
                                </motion.div>

                                {/* Tactile Edge Highlight (Cyan Neon) */}
                                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent z-10" />
                            </motion.div>

                            {/* Deep Background Glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[80%] bg-blue-600/15 blur-[140px] rounded-full pointer-events-none -z-10" />
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020410] to-transparent z-10" />

            {/* THE MASTER GRID - Moved to z-0 to sit BEHIND content */}
            <div className="absolute inset-0 z-0 pointer-events-none select-none">
                <div
                    className="absolute inset-0 opacity-[0.45]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(34, 211, 238, 0.45) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(34, 211, 238, 0.45) 1.5px, transparent 1.5px)`,
                        backgroundSize: '40px 40px',
                        maskImage: 'radial-gradient(circle at 75% 50%, black 20%, rgba(0,0,0,0.3) 60%, transparent 100%)'
                    }}
                />
            </div>
        </section>
    )
}
