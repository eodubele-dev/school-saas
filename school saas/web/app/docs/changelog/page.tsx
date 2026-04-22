import Link from "next/link"
import { Newspaper, ChevronRight, Hash, Rocket, Bug, ShieldAlert } from "lucide-react"

export default function ChangelogDoc() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="mb-12 border-b border-white/5 pb-12">
                <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400 tracking-[0.2em] uppercase mb-4">
                    <Hash className="w-3 h-3" />
                    Module: Developer_Resources
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight">
                    Developer Changelog
                </h1>
                <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
                    Track the evolution of the EduFlow platform. Major feature releases, security patches, and API updates.
                </p>
            </div>

            <div className="prose prose-invert prose-slate max-w-none text-slate-300">
                
                <h2 id="v4-2" className="text-2xl font-bold text-white mt-8 mb-6 border-b border-white/5 pb-2">
                    <span className="text-cyan-400 mr-4">v4.2</span>
                    April 2026
                </h2>
                <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                        <div className="mt-1"><Rocket className="w-5 h-5 text-emerald-400" /></div>
                        <div>
                            <h4 className="text-white font-bold mb-1">Financial Integrity Module</h4>
                            <p className="text-sm text-slate-400">Introduced the automated "Result Blur" feature for accounts with outstanding debt. Integrated seamless Paystack checkout directly into the parent portal.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="mt-1"><Rocket className="w-5 h-5 text-emerald-400" /></div>
                        <div>
                            <h4 className="text-white font-bold mb-1">Mobile Executive Dashboard</h4>
                            <p className="text-sm text-slate-400">Added a streamlined mobile view for School Owners to track real-time revenue and attendance on the go.</p>
                        </div>
                    </div>
                </div>

                <h2 id="v4-1" className="text-2xl font-bold text-white mt-16 mb-6 border-b border-white/5 pb-2">
                    <span className="text-cyan-400 mr-4">v4.1</span>
                    March 2026
                </h2>
                <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                        <div className="mt-1"><ShieldAlert className="w-5 h-5 text-amber-400" /></div>
                        <div>
                            <h4 className="text-white font-bold mb-1">Forensic Security & Gate Control</h4>
                            <p className="text-sm text-slate-400">Deployed strict RBAC for gate personnel and added SMS Gatekeeper service to alert parents instantly upon student exit.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="mt-1"><Bug className="w-5 h-5 text-rose-400" /></div>
                        <div>
                            <h4 className="text-white font-bold mb-1">Fix: Attendance Sync Issue</h4>
                            <p className="text-sm text-slate-400">Resolved a race condition where concurrent teacher attendance submissions could overwrite previous entries in edge cases.</p>
                        </div>
                    </div>
                </div>

                <h2 id="v4-0" className="text-2xl font-bold text-white mt-16 mb-6 border-b border-white/5 pb-2">
                    <span className="text-cyan-400 mr-4">v4.0</span>
                    January 2026
                </h2>
                <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                        <div className="mt-1"><Rocket className="w-5 h-5 text-emerald-400" /></div>
                        <div>
                            <h4 className="text-white font-bold mb-1">EduFlow Core Rewrite</h4>
                            <p className="text-sm text-slate-400">Migrated to Next.js 14 App Router, implemented global edge caching, and introduced the dark-mode primary aesthetic for Platinum-tier schools.</p>
                        </div>
                    </div>
                </div>

                {/* Pagination Footer */}
                <div className="mt-24 pt-8 border-t border-white/5 flex items-center justify-between not-prose">
                    <Link href="/docs/webhooks" className="group flex flex-col items-start gap-2">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Previous Article</span>
                        <span className="flex items-center gap-2 text-sm text-white font-bold group-hover:text-cyan-400 transition-colors">
                            <ChevronRight className="w-4 h-4 rotate-180" />
                            Webhooks
                        </span>
                    </Link>
                    <Link href="/docs" className="group flex flex-col items-end gap-2 text-right opacity-50">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">End of Series</span>
                        <span className="flex items-center gap-2 text-sm text-white font-bold">
                            Return Home
                            <ChevronRight className="w-4 h-4" />
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
