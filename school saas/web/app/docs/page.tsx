import Link from "next/link"
import { ArrowRight, Cpu, ShieldCheck, Zap, Activity } from "lucide-react"

export default function DocsPage() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-6">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    System Architecture v4.0
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
                    The Operating System for <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Elite Schools</span>
                </h1>
                <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
                    EduFlow is not just a portal—it is a forensic-grade operating system designed to automate revenue collection, secure academic integrity, and streamline logistics.
                </p>
            </div>

            {/* Core Modules Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-20">
                <Link href="/docs/financial-integrity" className="group p-8 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.07] hover:border-cyan-500/30 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap className="w-24 h-24 text-cyan-500" />
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Zap className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">Revenue Engine</h3>
                    <p className="text-slate-400 mb-6 leading-relaxed">
                        Learn how the "Pay-to-Unlock" algorithm enforces fee collection automatically, recovering millions in lost revenue without confrontation.
                    </p>
                    <span className="inline-flex items-center text-sm font-bold text-cyan-500">
                        Read Technical Spec <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                </Link>

                <Link href="/docs/campus-security" className="group p-8 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.07] hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShieldCheck className="w-24 h-24 text-blue-500" />
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                        <ShieldCheck className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">Forensic Audit</h3>
                    <p className="text-slate-400 mb-6 leading-relaxed">
                        Understand the immutable logging system that tracks every grade change, ensuring zero-tampering and absolute parent trust.
                    </p>
                    <span className="inline-flex items-center text-sm font-bold text-blue-500">
                        View Security Whitepaper <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                </Link>
            </div>

            {/* Technical Stack Section */}
            <div className="p-8 rounded-2xl bg-[#000000] border border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-white mb-8">Built on Modern Infrastructure</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { label: "Encryption", value: "AES-256", icon: Lock },
                            { label: "Uptime", value: "99.99%", icon: Activity },
                            { label: "Architecture", value: "Serverless", icon: Cpu },
                            { label: "Sync", value: "Real-time", icon: Zap },
                        ].map((stat) => (
                            <div key={stat.label} className="flex flex-col gap-2">
                                <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">{stat.label}</span>
                                <div className="flex items-center gap-2 text-lg font-bold text-white">
                                    <stat.icon className="w-4 h-4 text-cyan-500" />
                                    {stat.value}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function Lock(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    )
}
