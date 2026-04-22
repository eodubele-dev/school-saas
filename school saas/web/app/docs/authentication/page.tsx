import Link from "next/link"
import { Key, ChevronRight, Hash, Shield, Lock, Fingerprint } from "lucide-react"
import { Callout } from "@/components/docs/callout"

export default function AuthenticationDoc() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="mb-12 border-b border-white/5 pb-12">
                <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 tracking-[0.2em] uppercase mb-4">
                    <Hash className="w-3 h-3" />
                    Module: Developer_Resources
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight">
                    Authentication Protocol
                </h1>
                <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
                    Secure programmatic access to the EduFlow API using JWT and institutional API Keys.
                </p>
            </div>

            <div className="prose prose-invert prose-slate max-w-none text-slate-300">
                <p className="text-lg leading-relaxed">
                    EduFlow utilizes a dual-authentication mechanism: <strong>Session-based JWTs</strong> for front-end clients, and <strong>Cryptographic API Keys</strong> for server-to-server integrations.
                </p>

                <h2 id="api-keys" className="text-2xl font-bold text-white mt-16 mb-6">Generating API Keys</h2>
                <p>
                    API keys are bound to your institution's tenant and should be treated with the same security protocols as a master password.
                </p>
                <ol className="space-y-4 text-slate-300">
                    <li>Log in to the EduFlow Dashboard as an <strong>Owner</strong>.</li>
                    <li>Navigate to <strong>School Settings &gt; Developer & API</strong>.</li>
                    <li>Click <strong>Generate New Key</strong>. You will be prompted to name the key (e.g., "Library System Integration").</li>
                    <li>Copy the key immediately. <strong>It will never be shown again.</strong></li>
                </ol>

                <Callout type="warning" title="KEY ROTATION">
                    If you suspect an API key has been compromised, revoke it immediately from the dashboard. This will sever access for any system using that key within milliseconds.
                </Callout>

                <h2 id="headers" className="text-2xl font-bold text-white mt-16 mb-6">Authentication Headers</h2>
                <p>
                    Include your API key in the <code>Authorization</code> header of every HTTP request made to the EduFlow REST API.
                </p>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 my-6 font-mono text-sm">
                    <span className="text-emerald-400">Authorization:</span> Bearer eduflow_live_xxxxxxxxxxxxxxxxx
                </div>

                {/* Pagination Footer */}
                <div className="mt-24 pt-8 border-t border-white/5 flex items-center justify-between not-prose">
                    <Link href="/docs/campus-security" className="group flex flex-col items-start gap-2">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Previous Article</span>
                        <span className="flex items-center gap-2 text-sm text-white font-bold group-hover:text-emerald-400 transition-colors">
                            <ChevronRight className="w-4 h-4 rotate-180" />
                            Forensic Security
                        </span>
                    </Link>
                    <Link href="/docs/webhooks" className="group flex flex-col items-end gap-2 text-right">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Next Article</span>
                        <span className="flex items-center gap-2 text-sm text-white font-bold group-hover:text-emerald-400 transition-colors">
                            Webhooks
                            <ChevronRight className="w-4 h-4" />
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
