"use client"

import Link from "next/link"
import { BookOpen, Shield, Lock, CreditCard, ChevronRight, Terminal, Activity } from "lucide-react"
import { Toaster, toast } from "sonner"

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-[#0A0A0B] text-slate-300 font-sans selection:bg-cyan-900 selection:text-white">
            <Toaster position="top-center" theme="dark" />
            {/* Top Bar (Mobile/Tablet only - simplified) */}
            <div className="lg:hidden border-b border-white/10 p-4 bg-[#0A0A0B]/80 backdrop-blur-md sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-2">
                    <span className="font-bold text-white tracking-tight">EduFlow <span className="text-cyan-400">Docs</span></span>
                </Link>
            </div>

            <div className="container mx-auto max-w-7xl flex flex-col lg:flex-row">
                {/* Sticky Sidebar */}
                <aside className="hidden lg:block w-72 shrink-0 border-r border-white/5 h-screen sticky top-0 pt-24 pb-10 overflow-y-auto custom-scrollbar">
                    <div className="px-6 mb-10">
                        <Link href="/" className="flex items-center gap-2 mb-2 group">
                            <span className="font-bold text-xl text-white tracking-tight group-hover:text-cyan-400 transition-colors">EduFlow</span>
                            <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-slate-400">v4.0</span>
                        </Link>
                        <p className="text-xs text-slate-500 font-medium">Enterprise Operating System</p>
                    </div>

                    <nav className="px-4 space-y-8">
                        {/* Section 1 */}
                        <div>
                            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Core Concepts</h5>
                            <ul className="space-y-1">
                                <li>
                                    <Link href="/docs" className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium text-white bg-white/5 border border-white/5">
                                        <BookOpen className="w-4 h-4 text-cyan-400" />
                                        Architecture Overview
                                    </Link>
                                </li>
                                <li>
                                    <button onClick={() => toast("System Status Dashboard", { description: "Real-time uptime monitoring is coming in v4.1" })} className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer text-left">
                                        <Activity className="w-4 h-4" />
                                        System Health
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Section 2 */}
                        <div>
                            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Financial Integrity</h5>
                            <ul className="space-y-1">
                                <li>
                                    <Link href="/docs/financial-integrity" className="group flex items-center justify-between px-2 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                                        <span className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" /> Fee Recovery Logic</span>
                                    </Link>
                                </li>
                                <li>
                                    <button onClick={() => toast("Payment Gateway Integration", { description: "Detailed Paystack & Monnify API docs are reserved for partners." })} className="w-full group flex items-center justify-between px-2 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer text-left">
                                        <span className="flex items-center gap-2"><Lock className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" /> Payment Gateways</span>
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Section 3 */}
                        <div>
                            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Security & Audit</h5>
                            <ul className="space-y-1">
                                <li>
                                    <Link href="/docs/campus-security" className="group flex items-center justify-between px-2 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                                        <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" /> Immutable Logs</span>
                                    </Link>
                                </li>
                                <li>
                                    <button onClick={() => toast("API Reference", { description: "Full Swagger documentation is available upon request." })} className="w-full group flex items-center justify-between px-2 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer text-left">
                                        <span className="flex items-center gap-2"><Terminal className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" /> API Reference</span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </nav>

                    {/* Footer Contact */}
                    <div className="absolute bottom-10 px-6">
                        <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/20 rounded-xl p-4">
                            <h6 className="text-xs font-bold text-blue-400 mb-1">Need Integration Help?</h6>
                            <p className="text-[10px] text-slate-400 mb-3">Our engineering team is available for enterprise setups.</p>
                            <a href="mailto:engineering@eduflow.ng" className="block text-center text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded transition-colors w-full">
                                Contact Engineering
                            </a>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 py-12 lg:py-24 px-6 lg:px-16">
                    <div className="max-w-4xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
