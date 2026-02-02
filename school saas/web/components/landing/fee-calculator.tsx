'use client'

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { ShieldCheck } from "lucide-react"

export function FeeCalculator() {
    const [students, setStudents] = useState<number>(500)

    // Logic: Avg fee 150k, 20% leakage typical, we save 12% of that
    const termlyRevenue = students * 150000
    const recovered = Math.round(termlyRevenue * 0.12)

    const count = students === 2000 ? "2000+" : students

    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[500px] bg-cyan-500/5 blur-[100px] pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-white mb-4 tracking-tight drop-shadow-md">
                        Calculate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Lost Efficiency</span>
                    </h2>
                    <p className="text-lg text-slate-400">
                        See how much revenue EduFlow's automated debtor reminders could recover for you.
                    </p>
                </div>

                <div className="
                    bg-[#050B20]/60 backdrop-blur-[40px] border border-white/5 
                    rounded-[3rem] p-10 md:p-16 shadow-[0_0_50px_rgba(0,123,255,0.05)]
                    relative overflow-hidden group hover:border-cyan-500/20 transition-colors duration-500
                ">
                    {/* Glass Reflection */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                    <div className="space-y-14 relative z-10">
                        {/* Input Section */}
                        <div className="flex flex-col gap-8">
                            <div className="flex justify-between items-center text-white">
                                <span className="font-medium text-xl text-slate-300">Number of Students</span>
                                <span className="font-bold text-3xl font-mono text-cyan-400 bg-cyan-950/30 px-6 py-2 rounded-2xl border border-cyan-500/20 shadow-[0_0_15px_rgba(0,245,255,0.1)]">
                                    {count}
                                </span>
                            </div>

                            <Slider
                                value={[students]}
                                onValueChange={(val) => setStudents(val[0])}
                                min={50}
                                max={2000}
                                step={10}
                                className="py-2 cursor-grab active:cursor-grabbing"
                            />

                            <div className="flex justify-between text-xs text-slate-500 font-mono uppercase tracking-widest font-bold">
                                <span>Small School (50)</span>
                                <span>Enterprise (2000+)</span>
                            </div>
                        </div>

                        {/* Results Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-white/5">
                            <div className="space-y-3">
                                <div className="text-sm text-slate-500 font-bold uppercase tracking-widest">Est. Termly Revenue</div>
                                <div className="text-3xl font-bold text-slate-400 flex items-center opacity-80">
                                    <span className="text-lg mr-1 text-slate-600">₦</span>
                                    {termlyRevenue.toLocaleString()}
                                </div>
                            </div>

                            <div className="space-y-3 relative">
                                <div className="absolute -left-6 top-2 bottom-2 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent hidden md:block"></div>

                                <div className="text-sm text-cyan-400 font-bold uppercase tracking-widest animate-pulse flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4" />
                                    Potential Recovery <span className="text-[10px] bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20 text-cyan-300">Termly</span>
                                </div>
                                <div className="text-5xl md:text-6xl font-extrabold text-white flex items-center drop-shadow-[0_0_25px_rgba(0,245,255,0.4)]">
                                    <span className="text-3xl md:text-4xl mr-2 text-cyan-500 font-medium">₦</span>
                                    {recovered.toLocaleString()}
                                </div>
                                <p className="text-sm text-cyan-400/60 pt-2 font-light">
                                    *Based on 12% fee leakage reduction via automated SMS nudges.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
