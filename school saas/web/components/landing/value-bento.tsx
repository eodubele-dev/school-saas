'use client'

import { Wallet, BrainCircuit, WifiOff, ShieldCheck } from "lucide-react"

const features = [
    {
        title: "Zero-Leakage Finance",
        desc: "Direct Paystack integration with automated 'Fee Reminders' via Termii SMS.",
        icon: Wallet,
        col: "lg:col-span-2",
        // Liquid Blue Gradient
        gradient: "from-blue-600/10 to-cyan-500/10 border-blue-500/20",
        iconColor: "text-blue-400",
        glow: "group-hover:shadow-[0_0_50px_rgba(0,123,255,0.2)]"
    },
    {
        title: "AI-Report Architect",
        desc: "Generate personalized behavioral remarks for 500 students in under 2 minutes.",
        icon: BrainCircuit,
        col: "lg:col-span-1",
        gradient: "from-cyan-900/10 to-blue-900/10 border-cyan-500/20",
        iconColor: "text-cyan-400",
        glow: "group-hover:shadow-[0_0_50px_rgba(0,245,255,0.2)]"
    },
    {
        title: "Offline-First Engine",
        desc: "No internet? No problem. Teachers work offline; we sync when the light comes back.",
        icon: WifiOff,
        col: "lg:col-span-1",
        gradient: "from-indigo-900/10 to-blue-900/10 border-indigo-500/20",
        iconColor: "text-indigo-400",
        glow: "group-hover:shadow-[0_0_50px_rgba(99,102,241,0.2)]"
    },
    {
        title: "Audit & Fraud Prevention",
        desc: "A permanent digital trail for every Naira and every Grade changed.",
        icon: ShieldCheck,
        col: "lg:col-span-2",
        gradient: "from-blue-900/10 to-cyan-900/10 border-blue-500/20",
        iconColor: "text-sky-400",
        glow: "group-hover:shadow-[0_0_50px_rgba(14,165,233,0.2)]"
    }
]

export function ValueBento() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[600px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
                        Everything You Need. <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Nothing You Don't.</span>
                    </h2>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Built specifically for the chaos of Nigerian private schools. Fast, offline-capable, and impossible to trick.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            className={`
                                relative group rounded-[2rem] border border-white/5 
                                bg-gradient-to-br from-white/[0.03] to-white/[0.01] 
                                backdrop-blur-[25px] p-10 
                                transition-all duration-500 
                                hover:border-cyan-500/30 hover:-translate-y-2
                                ${feature.col} ${feature.glow}
                            `}
                        >
                            {/* Liquid Pulse Border Animation */}
                            <div className="absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[1.5s] ease-in-out" />
                            </div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className={`h-16 w-16 rounded-2xl bg-[#0B1028]/50 border border-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner ${feature.iconColor.replace('text', 'bg').replace('400', '500')}/10`}>
                                    <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4 tracking-tight group-hover:text-cyan-100 transition-colors">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed text-lg font-light">
                                    {feature.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
