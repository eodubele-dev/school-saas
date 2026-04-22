import Link from "next/link"
import { ArrowLeft, Shield, FileText } from "lucide-react"
import { SITE_CONFIG } from "@/lib/constants/site-config"
import { LegalBody } from "@/components/legal/legal-body"

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-black text-slate-200 py-24 px-4 md:px-8 relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
            <div className="absolute -top-[10%] -right-[10%] w-[50vw] h-[50vw] rounded-full blur-[150px] opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #0066FF 0%, transparent 70%)' }} />

            <div className="max-w-4xl mx-auto relative z-10">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-400 mb-12 transition-all hover:-translate-x-1 group">
                    <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Home
                </Link>

                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-2xl bg-blue-600/20 border border-blue-500/30">
                        <Shield className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">Privacy Policy</h1>
                        <p className="text-blue-400 font-mono text-xs mt-1 uppercase tracking-widest">NDPR-2019 & NDPA-2023 COMPLIANT</p>
                    </div>
                </div>

                <div className="mt-16">
                    <LegalBody type="privacy" />
                </div>

                {/* Footer Contact */}
                <div className="border-t border-white/10 pt-12 text-center pb-24 mt-12">
                    <FileText className="w-10 h-10 text-slate-700 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-white mb-4">Questions or Remediation Requests?</h3>
                    <div className="text-slate-500 space-y-2 text-sm">
                        <p>{SITE_CONFIG.name} Legal Department</p>
                        <p>{SITE_CONFIG.hq.address}</p>
                        <p className="text-blue-400 font-mono">support@eduflow.ng</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
