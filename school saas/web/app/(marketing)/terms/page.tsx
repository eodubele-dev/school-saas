import Link from "next/link"
import { ArrowLeft, Scale, Gavel } from "lucide-react"
import { SITE_CONFIG } from "@/lib/constants/site-config"
import { LegalBody } from "@/components/legal/legal-body"

export default function TermsAndConditions() {
    return (
        <div className="min-h-screen bg-black text-slate-200 py-24 px-4 md:px-8 relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
            <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full blur-[150px] opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #0066FF 0%, transparent 70%)' }} />

            <div className="max-w-4xl mx-auto relative z-10">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-400 mb-12 transition-all hover:-translate-x-1 group">
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Home
                </Link>

                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-2xl bg-blue-600/20 border border-blue-500/30">
                        <Scale className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Terms of Service</h1>
                        <p className="text-blue-400 font-mono text-xs mt-1 uppercase tracking-widest">NIGERIAN JURISDICTION • SaaS MASTER AGREEMENT</p>
                    </div>
                </div>

                <div className="mt-16">
                    <LegalBody type="terms" />
                </div>

                {/* Final CTA */}
                <div className="text-center py-12 mt-12 border-t border-white/10">
                    <p className="text-xs text-slate-700 uppercase tracking-[0.2em] mb-4">© 2026 EduFlow Synergy Systems</p>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">By continuing to use the platform, you uphold the integrity of Nigerian Education.</p>
                </div>
            </div>
        </div>
    )
}
