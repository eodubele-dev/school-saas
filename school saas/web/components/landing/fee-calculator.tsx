'use client'

import { useState, useEffect, useRef } from "react"
import { Slider } from "@/components/ui/slider"
import { ShieldCheck, MessageSquare, Send } from "lucide-react"
import { motion, useSpring, useTransform, animate } from "framer-motion"

// Odometer Component for the rolling numbers
function Counter({ value }: { value: number }) {
    const ref = useRef<HTMLSpanElement>(null)

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        const controls = animate(0, value, {
            duration: 1,
            onUpdate(value) {
                node.textContent = Math.round(value).toLocaleString();
            },
            ease: "easeOut"
        });

        return () => controls.stop();
    }, [value]);

    return <span ref={ref} />;
}

export function FeeCalculator() {
    const [students, setStudents] = useState<number>(500)

    // Logic: Avg fee 150k, 20% leakage typical, we save 12% of that
    const termlyRevenue = students * 150000
    const recovered = Math.round(termlyRevenue * 0.12)

    return (
        <section className="py-24 bg-slate-950 relative overflow-hidden">
            {/* Background: Clean minimalist slate */}


            <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">

                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-foreground mb-4 tracking-tight drop-shadow-md">
                        Calculate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Lost Efficiency</span>
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        See how much revenue EduFlow's automated debtor reminders could recover for you.
                    </p>
                </div>

                {/* The "Master Bento" Container */}
                <div className="rounded-[3rem] border border-cyan-500/20 bg-[#0B1221]/50 backdrop-blur-xl overflow-hidden relative shadow-[0_0_50px_rgba(0,245,255,0.05)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent pointer-events-none" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

                        {/* LEFT: The 'Glass-Control' Calculator */}
                        <div className="p-10 md:p-16 flex flex-col justify-center space-y-12 border-b lg:border-b-0 lg:border-r border-border/50 relative">
                            {/* Input Section */}
                            <div className="flex flex-col gap-10">
                                <div className="flex justify-between items-center text-foreground">
                                    <span className="font-medium text-xl text-slate-300">Number of Students</span>
                                    <span className="font-bold text-3xl font-mono text-cyan-400 bg-cyan-950/40 px-6 py-2 rounded-2xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                                        {students === 2000 ? "2000+" : students}
                                    </span>
                                </div>

                                <div className="relative">
                                    <Slider
                                        defaultValue={[500]}
                                        max={2000}
                                        min={50}
                                        step={10}
                                        value={[students]}
                                        onValueChange={(val) => setStudents(val[0])}
                                        className="py-4"
                                    />
                                    {/* Custom Glass Glow logic handles by shadcn/slider or we add explicit glow styling via CSS modules if needed, but Tailwind classes below handle the track color */}
                                    <style jsx global>{`
                                        .group:hover .bg-primary { background-color: #22d3ee !important; box-shadow: 0 0 15px #22d3ee; }
                                        span[role="slider"] { 
                                            background-color: white !important; 
                                            border-color: white !important; 
                                            box-shadow: 0 0 20px 2px rgba(255,255,255,0.6) !important;
                                        }
                                        span[data-orientation="horizontal"] > span { background-color: #06b6d4 !important; }
                                    `}</style>
                                </div>

                                <div className="flex justify-between text-xs text-muted-foreground font-mono uppercase tracking-widest font-bold">
                                    <span>Small School (50)</span>
                                    <span>Enterprise (2000+)</span>
                                </div>
                            </div>

                            {/* Dynamic Revenue Display */}
                            <div className="pt-10 border-t border-border/50 space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                        <ShieldCheck className="h-5 w-5 text-cyan-400" />
                                    </div>
                                    <span className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Potential Recovery</span>
                                </div>

                                <div className="text-5xl md:text-7xl font-black text-foreground flex items-center drop-shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                                    <span className="text-3xl md:text-5xl mr-2 text-cyan-500/80 font-medium">₦</span>
                                    {/* Digital Odometer */}
                                    <Counter value={recovered} />
                                </div>
                                <p className="text-sm text-muted-foreground font-medium">
                                    *Based on 12% fee leakage reduction via automated SMS nudges.
                                </p>
                            </div>
                        </div>

                        {/* RIGHT: The Photorealistic SMS Mockup */}
                        <div className="relative min-h-[500px] overflow-hidden flex items-center justify-center p-8 group">
                            {/* Radial Glow behind image */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                            <div className="relative z-10 w-full max-w-[420px]">
                                <img
                                    src="/visuals/parent-sms-nudge-mockup.png"
                                    alt="Parent receiving EduFlow efficiency alert"
                                    className="w-full h-auto drop-shadow-[0_40px_80px_rgba(0,0,0,0.8)] rounded-2xl group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                                />
                                {/* Glass Border Effect */}
                                <div className="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none" />
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    )
}
