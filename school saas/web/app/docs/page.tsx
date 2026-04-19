import Link from "next/link"
import { 
    ArrowRight, Cpu, ShieldCheck, Zap, Activity, 
    TrendingUp, Users, Terminal, Database, ShieldAlert
} from "lucide-react"

export default function DocsPage() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area */}
            <div className="mb-20">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                    Documentation Index // v4.0.1
                </div>
                <h1 className="text-4xl lg:text-6xl font-black text-white mb-8 tracking-tighter leading-none">
                    Mission Control for <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">Elite Institutions</span>
                </h1>
                <p className="text-lg text-slate-400 leading-relaxed max-w-3xl font-medium">
                    EduFlow is West Africa&apos;s most advanced school operating system. This documentation covers everything from forensic fee recovery logic to high-security academic audit protocols.
                </p>
            </div>

            {/* Role-Based Discovery Hub */}
            <div className="mb-24">
                <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-8">Select Your Mission Track</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Role: Proprietor */}
                    <Link href="/docs/financial-integrity" className="group relative p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all duration-500 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl group-hover:bg-blue-600/10 transition-all" />
                        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center mb-8 border border-blue-500/20 group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Proprietor Hub</h3>
                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">Focus on ROI, revenue recovery statistics, and high-level compliance monitoring.</p>
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-400 group-hover:translate-x-1 transition-transform">
                            Enter Hub <ArrowRight className="w-4 h-4" />
                        </div>
                    </Link>

                    {/* Role: Bursar / Admin */}
                    <Link href="/docs/financial-integrity" className="group relative p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-amber-500/30 transition-all duration-500 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/5 blur-3xl group-hover:bg-amber-600/10 transition-all" />
                        <div className="w-12 h-12 rounded-2xl bg-amber-600/10 flex items-center justify-center mb-8 border border-amber-500/20 group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6 text-amber-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Academic Admin</h3>
                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">Technical guides on gradebook automation, anti-tampering logic, and fee enforcement.</p>
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
                            Enter Hub <ArrowRight className="w-4 h-4" />
                        </div>
                    </Link>

                    {/* Role: DevOps / IT */}
                    <Link href="/docs/campus-security" className="group relative p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-all duration-500 overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 blur-3xl group-hover:bg-emerald-600/10 transition-all" />
                        <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 flex items-center justify-center mb-8 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                            <Database className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Dev & Security</h3>
                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">Infrastructure specs, API authentication, and forensic audit log architecture.</p>
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                            Enter Hub <ArrowRight className="w-4 h-4" />
                        </div>
                    </Link>
                </div>
            </div>

            {/* Core Infrastructure Visualizer */}
            <div id="architecture" className="mb-24">
                <h2 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-8">Infrastructure Core</h2>
                <div className="p-10 rounded-[2.5rem] bg-[#000000] border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:24px_24px] pointer-events-none" />
                    
                    <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Multi-Tenant Vault Architecture</h3>
                            <p className="text-sm text-slate-400 leading-relaxed mb-8">
                                Every school is provisioned with a private, isolated database vault. Our architecture ensures that student data and financial ledgers never collide across the EduFlow network.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-blue-400 tracking-widest uppercase">Encryption Status</div>
                                    <div className="text-lg font-bold text-white">AES-256 (Military)</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 tracking-widest uppercase">Uptime Avg</div>
                                    <div className="text-lg font-bold text-white">99.999% SLA</div>
                                </div>
                            </div>
                        </div>

                        {/* Visual Rep (Mock) */}
                        <div className="relative">
                            <div className="aspect-video rounded-2xl bg-blue-600/5 border border-white/5 flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-32 h-32 rounded-full border border-blue-500/20 animate-[spin_10s_linear_infinite]" />
                                    <div className="w-24 h-24 rounded-full border border-cyan-500/20 absolute animate-[spin_15s_linear_infinite_reverse]" />
                                    <ShieldAlert className="w-12 h-12 text-blue-500 opacity-20" />
                                </div>
                                <div className="flex gap-4 relative z-10">
                                    <div className="p-4 rounded-xl bg-black/80 border border-white/10 shadow-2xl backdrop-blur-xl">
                                        <div className="text-[10px] font-mono text-slate-500 mb-2">AUTH_TOKEN</div>
                                        <div className="text-xs text-blue-400 font-mono">********-44x</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-black/80 border border-white/10 shadow-2xl translate-y-4 backdrop-blur-xl">
                                        <div className="text-[10px] font-mono text-slate-500 mb-2">REGION</div>
                                        <div className="text-xs text-emerald-400 font-mono">NG-LOS-1</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Links Footer */}
            <div className="flex flex-wrap gap-4 pt-12 border-t border-white/5">
                {['Security Audit', 'API Reference', 'Integrations Hub', 'Network Status'].map(tag => (
                    <button key={tag} className="px-5 py-2.5 rounded-full bg-white/[0.03] border border-white/5 text-xs font-bold text-slate-500 hover:text-white hover:border-white/10 transition-all">
                        {tag}
                    </button>
                ))}
            </div>
        </div>
    )
}
