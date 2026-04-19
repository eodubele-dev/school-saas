"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
    BookOpen, Shield, Lock, CreditCard, ChevronRight, 
    Terminal, Activity, Search, Command, Menu, X,
    LayoutDashboard, Key, Globe, Newspaper
} from "lucide-react"
import { Toaster, toast } from "sonner"
import { cn } from "@/lib/utils"

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-slate-300 font-sans selection:bg-cyan-900 selection:text-white relative overflow-hidden">
            <Toaster position="top-center" theme="dark" />

            {/* Immersive Background Elements */}
            <div className="fixed inset-0 bg-grid-white/[0.02] bg-[size:32px_32px] pointer-events-none" />
            <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
            <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none opacity-50" />

            {/* Global Sticky Header */}
            <header className={cn(
                "fixed top-0 w-full z-[100] transition-all duration-300 border-b",
                scrolled ? "bg-[#0A0A0B]/80 backdrop-blur-xl border-white/10 h-14" : "bg-transparent border-transparent h-20"
            )}>
                <div className="container mx-auto max-w-[1600px] px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] group-hover:scale-105 transition-transform">E</div>
                            <span className="font-bold text-lg text-white tracking-tight group-hover:text-cyan-400 transition-colors">EduFlow <span className="text-slate-500 font-light">Docs</span></span>
                        </Link>

                        {/* Breadcrumbs (Visual Only for now) */}
                        <nav className="hidden md:flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">
                            <span>Platform</span>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-slate-300">Documentation</span>
                        </nav>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Status Light */}
                        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Mainnet Live</span>
                        </div>

                        <Link href="/" className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/5 shadow-xl">
                            <ChevronRight className="w-3 h-3 rotate-180" />
                            Exit to Site
                        </Link>

                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 text-slate-400 hover:text-white"
                        >
                            {isMobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto max-w-[1600px] flex">
                
                {/* 1. Primary Navigation Sidebar (Left) */}
                <aside className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 bg-[#0A0A0B] lg:bg-transparent border-r border-white/5 pt-24 pb-10 transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:flex lg:flex-col",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}>
                    {/* Search Field */}
                    <div className="px-6 mb-8">
                        <div 
                            onClick={() => toast.info("Neural Search Indexing", { description: "Global documentation search is being indexed for your region." })}
                            className="flex items-center gap-3 px-4 h-10 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 cursor-pointer group transition-all"
                        >
                            <Search className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                            <span className="text-sm text-slate-500 flex-1">Search docs...</span>
                            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                                <Command className="w-2.5 h-2.5 text-slate-600" />
                                <span className="text-[10px] font-mono text-slate-600">K</span>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
                        {/* Section 1 */}
                        <div>
                            <h5 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 px-2">Core Infrastructure</h5>
                            <ul className="space-y-1">
                                <li>
                                    <Link href="/docs" className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-white bg-blue-600/10 border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]">
                                        <LayoutDashboard className="w-4 h-4 text-blue-400" />
                                        Getting Started
                                    </Link>
                                </li>
                                <li>
                                    <button onClick={() => toast.info("Immersion Sessions", { description: "Interactive tutorials are launching in Q3." })} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer text-left">
                                        <Globe className="w-4 h-4" />
                                        Platform Overview
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Section 2 */}
                        <div>
                            <h5 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 px-2">Advanced Modules</h5>
                            <ul className="space-y-1 text-slate-400 font-medium">
                                <li>
                                    <Link href="/docs/financial-integrity" className="group flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:text-white hover:bg-white/5 transition-all">
                                        <CreditCard className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" /> 
                                        Financial Integrity
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/docs/campus-security" className="group flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:text-white hover:bg-white/5 transition-all">
                                        <Shield className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" /> 
                                        Forensic Security
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Section 3 */}
                        <div>
                            <h5 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 px-2">Developer Resources</h5>
                            <ul className="space-y-1 text-slate-400 font-medium tracking-tight">
                                <li>
                                    <button onClick={() => toast.info("REST API Keys", { description: "API key generation is available in the Institution Control Panel." })} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:text-white hover:bg-white/5 transition-all text-left">
                                        <Key className="w-4 h-4 text-slate-600" />
                                        Authentication
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => toast.info("Webhook Protocol", { description: "Detailed webhook events for tuition payments are available in v4.2." })} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:text-white hover:bg-white/5 transition-all text-left">
                                        <Terminal className="w-4 h-4 text-slate-600" />
                                        Webhooks
                                    </button>
                                </li>
                                <li>
                                    <button onClick={() => toast.info("Developer Changelog", { description: "Viewing the 2026 Q1 security patches." })} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm hover:text-white hover:bg-white/5 transition-all text-left">
                                        <Newspaper className="w-4 h-4 text-slate-600" />
                                        Changelog
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </nav>

                    {/* Footer Contact (Floating Card Style) */}
                    <div className="mt-auto p-4 mb-4">
                        <div className="bg-[#111112] border border-white/5 rounded-2xl p-4 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600/10 blur-2xl group-hover:bg-blue-600/20 transition-all" />
                            <h6 className="text-[11px] font-black text-white mb-1 uppercase tracking-wider">Enterprise Support</h6>
                            <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">Dedicated engineering support for institutional deployments.</p>
                            <a href="mailto:support@eduflow.ng" className="block text-center text-[10px] font-bold text-white bg-white/5 hover:bg-blue-600 border border-white/10 px-3 py-2 rounded-xl transition-all w-full">
                                Contact Engineering
                            </a>
                        </div>
                    </div>
                </aside>

                {/* 2. Main Content Area (Center) */}
                <main className="flex-1 min-w-0 py-12 lg:py-24 px-6 lg:px-20 relative z-10 transition-all duration-500">
                    <div className="max-w-4xl mx-auto">
                        {children}
                    </div>
                </main>

                {/* 3. Section Navigation (Right) - Standard for high-tier Docs */}
                <aside className="hidden xl:block w-72 shrink-0 h-screen sticky top-0 pt-24 pb-10 px-8">
                    <h5 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-6">On this page</h5>
                    <nav className="space-y-4 text-sm font-medium">
                        <div className="space-y-2 border-l border-white/5 pl-4">
                            <a href="#overview" className="block text-cyan-400 border-l-2 border-cyan-400 -ml-[17px] pl-4 transition-all">Overview</a>
                            <a href="#architecture" className="block text-slate-500 hover:text-slate-300 transition-colors">Architecture</a>
                            <a href="#security" className="block text-slate-500 hover:text-slate-300 transition-colors">Forensic Security</a>
                            <a href="#scalability" className="block text-slate-500 hover:text-slate-300 transition-colors">Scalability Protocol</a>
                        </div>
                        
                        <div className="pt-8 space-y-4">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Share Knowledge</p>
                            <button className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition-colors">
                                <ChevronRight className="w-3 h-3" />
                                Copy Article Link
                            </button>
                        </div>
                    </nav>
                </aside>
            </div>
        </div>
    )
}
