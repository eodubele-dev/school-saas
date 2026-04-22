import Link from "next/link"
import { Globe, ChevronRight, Hash, Layers, Network, Server, Cpu } from "lucide-react"

export default function PlatformOverviewDoc() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="mb-12 border-b border-white/5 pb-12">
                <div className="flex items-center gap-2 text-[10px] font-mono text-purple-400 tracking-[0.2em] uppercase mb-4">
                    <Hash className="w-3 h-3" />
                    Module: Core_Architecture
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight">
                    Platform Overview
                </h1>
                <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
                    Understanding the architectural components, multi-tenant isolation, and data flow of the EduFlow ecosystem.
                </p>
            </div>

            <div className="prose prose-invert prose-slate max-w-none text-slate-300">
                <p className="text-lg leading-relaxed">
                    EduFlow is not a single application, but a distributed ecosystem designed to handle the complex operational requirements of modern educational institutions. This document provides a high-level overview of our technical architecture.
                </p>

                <h2 id="architecture" className="text-2xl font-bold text-white mt-16 mb-6">Multi-Tenant Architecture</h2>
                <p>
                    Every institution operates within a strictly isolated "Tenant". This guarantees absolute data privacy and security. The tenant identifier is often the subdomain (e.g., <code>https://lincoln.eduflow.ng</code>).
                </p>
                <div className="grid sm:grid-cols-3 gap-6 my-10 not-prose">
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                        <Layers className="w-6 h-6 text-purple-400 mb-4" />
                        <h4 className="text-white font-bold mb-2">Row-Level Security</h4>
                        <p className="text-xs text-slate-400">Database queries are automatically restricted at the Postgres level ensuring cross-tenant data leakage is cryptographically impossible.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                        <Server className="w-6 h-6 text-blue-400 mb-4" />
                        <h4 className="text-white font-bold mb-2">Edge Delivery</h4>
                        <p className="text-xs text-slate-400">Assets and static pages are served from edge nodes closest to the user via AWS Amplify, reducing latency to &lt;50ms.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                        <Network className="w-6 h-6 text-emerald-400 mb-4" />
                        <h4 className="text-white font-bold mb-2">Real-time Sync</h4>
                        <p className="text-xs text-slate-400">WebSockets power instant chat, live attendance tracking, and immediate payment confirmations without page refreshes.</p>
                    </div>
                </div>

                <h2 id="roles" className="text-2xl font-bold text-white mt-16 mb-6">Role-Based Access Control (RBAC)</h2>
                <p>
                    The platform morphs its interface based on the authenticated user's role. A Bursar sees a vastly different application compared to a Teacher or a Parent.
                </p>
                <ul>
                    <li><strong>Administrators & Owners:</strong> Have global access to system configurations, financial audits, and security settings.</li>
                    <li><strong>Bursars:</strong> Restricted to the Financial Suite, managing ledgers, payroll, and debt networks.</li>
                    <li><strong>Teachers:</strong> Focused on academic delivery, lesson planning, and student behavioral tracking.</li>
                    <li><strong>Parents & Students:</strong> Provided with read-only views of results, attendance, and interactive portals for fee payment.</li>
                </ul>

                {/* Pagination Footer */}
                <div className="mt-24 pt-8 border-t border-white/5 flex items-center justify-between not-prose">
                    <Link href="/docs/setup-guide" className="group flex flex-col items-start gap-2">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Previous Article</span>
                        <span className="flex items-center gap-2 text-sm text-white font-bold group-hover:text-purple-400 transition-colors">
                            <ChevronRight className="w-4 h-4 rotate-180" />
                            Setup Guide
                        </span>
                    </Link>
                    <Link href="/docs/financial-integrity" className="group flex flex-col items-end gap-2 text-right">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Next Article</span>
                        <span className="flex items-center gap-2 text-sm text-white font-bold group-hover:text-purple-400 transition-colors">
                            Financial Integrity
                            <ChevronRight className="w-4 h-4" />
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
