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
        <section className="py-24 bg-[#000000] relative overflow-hidden">
            {/* Background: 5% Opacity Blue Wave Pattern */}
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


            <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">

                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-white mb-4 tracking-tight drop-shadow-md">
                        Calculate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Lost Efficiency</span>
                    </h2>
                    <p className="text-lg text-slate-400">
                        See how much revenue EduFlow's automated debtor reminders could recover for you.
                    </p>
                </div>

                {/* The "Master Bento" Container */}
                <div className="rounded-[3rem] border border-cyan-500/20 bg-[#0B1221]/50 backdrop-blur-xl overflow-hidden relative shadow-[0_0_50px_rgba(0,245,255,0.05)]">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent pointer-events-none" />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

                        {/* LEFT: The 'Glass-Control' Calculator */}
                        <div className="p-10 md:p-16 flex flex-col justify-center space-y-12 border-b lg:border-b-0 lg:border-r border-white/5 relative">
                            {/* Input Section */}
                            <div className="flex flex-col gap-10">
                                <div className="flex justify-between items-center text-white">
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

                                <div className="flex justify-between text-xs text-slate-500 font-mono uppercase tracking-widest font-bold">
                                    <span>Small School (50)</span>
                                    <span>Enterprise (2000+)</span>
                                </div>
                            </div>

                            {/* Dynamic Revenue Display */}
                            <div className="pt-10 border-t border-white/5 space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                        <ShieldCheck className="h-5 w-5 text-cyan-400" />
                                    </div>
                                    <span className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Potential Recovery</span>
                                </div>

                                <div className="text-5xl md:text-7xl font-black text-white flex items-center drop-shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                                    <span className="text-3xl md:text-5xl mr-2 text-cyan-500/80 font-medium">₦</span>
                                    {/* Digital Odometer */}
                                    <Counter value={recovered} />
                                </div>
                                <p className="text-sm text-slate-500 font-medium">
                                    *Based on 12% fee leakage reduction via automated SMS nudges.
                                </p>
                            </div>
                        </div>

                        {/* RIGHT: The 3D Phone Mockup (SMS Nudge) */}
                        <div className="relative min-h-[500px] bg-[#050A15] overflow-hidden flex items-center justify-center p-10">
                            {/* Radial Glow behind phone */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[80px]" />

                            {/* The 3D CSS Phone */}
                            <div
                                className="relative w-[280px] h-[580px] bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl transform rotate-y-[-12deg] rotate-x-[5deg] hover:rotate-y-[0deg] transition-transform duration-700"
                                style={{
                                    boxShadow: '30px 30px 80px -20px rgba(0,0,0,0.6), 0 0 50px rgba(59, 130, 246, 0.1)',
                                }}
                            >
                                {/* Screen Content */}
                                <div className="absolute inset-0 bg-black rounded-[2.5rem] overflow-hidden border border-white/5 flex flex-col">

                                    {/* Fake Header details */}
                                    <div className="px-6 pt-10 pb-4 bg-slate-900/50 backdrop-blur-md border-b border-white/5 z-10 flex items-center justify-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-2">
                                                <ShieldCheck className="w-6 h-6 text-blue-500" />
                                            </div>
                                            <span className="text-white font-bold text-sm">EduFlow Alert</span>
                                            <span className="text-slate-500 text-[10px]">Today 9:42 AM</span>
                                        </div>
                                    </div>

                                    {/* Calculated Message Area */}
                                    <div className="flex-1 p-6 space-y-6 flex flex-col justify-end pb-20 bg-gradient-to-b from-slate-950 to-[#0B1221]">

                                        {/* Received Message Bubble */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ delay: 0.5 }}
                                            className="bg-[#2a2a2a] p-4 rounded-2xl rounded-tl-none border border-white/10 relative"
                                        >
                                            <p className="text-slate-200 text-sm leading-relaxed">
                                                Dear Parent, <br />
                                                <span className="text-white font-bold">Chioma's Result is ready.</span>
                                            </p>
                                            <p className="text-slate-200 text-sm mt-3 pb-3 border-b border-white/10">
                                                Outstanding Balance: <span className="text-red-400 font-bold">₦45,000</span>
                                            </p>
                                            <div className="mt-3">
                                                <a href="#" className="inline-flex items-center gap-1 text-blue-400 text-xs font-bold hover:underline">
                                                    Tap to Pay & View Result
                                                    <Send className="w-3 h-3" />
                                                </a>
                                            </div>

                                            {/* Tiny 'Now' label */}
                                            <span className="absolute -bottom-5 left-0 text-[10px] text-slate-600">Delivered</span>
                                        </motion.div>

                                        {/* Reply Box (Fake) */}
                                        <div className="mt-4 flex gap-2 opacity-50">
                                            <div className="h-10 bg-slate-800 rounded-full flex-1" />
                                            <div className="h-10 w-10 bg-slate-800 rounded-full" />
                                        </div>

                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    )
}
