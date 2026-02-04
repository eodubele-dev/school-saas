"use client"

import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FinalCloserCta() {
    return (
        <section className="py-32 bg-[#000000] relative overflow-hidden">

            {/* Massive Footer Glow Anchor */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140%] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="container px-4 md:px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative bento-card border-cyan-500/30 overflow-hidden"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
                        {/* LEFT: Image Side */}
                        <div className="relative h-[300px] lg:h-full overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/80 lg:to-black z-10" />
                            <img
                                src="/visuals/teacher-empowerment.png"
                                alt="Smiling Teacher in Lagos Classroom"
                                className="w-full h-full object-cover grayscale-[20%] sepia-[10%]"
                            />
                            {/* Cyan Overlay for consistency */}
                            <div className="absolute inset-0 bg-cyan-900/20 mix-blend-overlay z-0" />
                        </div>

                        {/* RIGHT: Copy Side */}
                        <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16 text-left relative z-20 bg-gradient-to-b from-transparent to-black lg:bg-none">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/50 border border-blue-500/30 text-blue-400 text-xs font-mono mb-6 w-fit">
                                <Sparkles className="w-3 h-3" />
                                MISSION_CRITICAL
                            </div>

                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                                Give Your Teachers <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Their Time Back.</span>
                            </h2>

                            <p className="text-lg text-slate-400 mb-10 max-w-md">
                                Join 50+ elite schools in Lagos transforming their campus operations today. Security, revenue, and logistics—solved.
                            </p>

                            <Button
                                className="h-14 px-8 text-lg font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-[0_0_40px_rgba(37,99,235,0.5)] animate-pulse w-fit group"
                            >
                                Book My Executive Demo
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
