import { notFound } from "next/navigation"
import { getVerifiedResultData } from "@/lib/actions/verification"
import { ResultSheet } from "@/components/results/result-sheet"
import { ShieldCheck, ShieldAlert } from "lucide-react"

export default async function VerifyResultPage({
    params,
    searchParams
}: {
    params: { domain: string, id: string }
    searchParams: { term?: string, session?: string }
}) {
    const { id } = params
    const term = searchParams.term
    const session = searchParams.session

    // 1. Strict Parameter Validation
    if (!term || !session) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="bg-red-950/50 border border-red-500/50 p-8 rounded-2xl max-w-lg text-center backdrop-blur-sm">
                    <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-black text-red-500 mb-2 uppercase tracking-wider">Verification Failed</h1>
                    <p className="text-red-200/80">The QR Code scanned is missing critical dimensional metadata (Term/Session). It appears to be an outdated or manually tampered code.</p>
                </div>
            </div>
        )
    }

    // 2. Cryptographic Fetch via Service Role
    const data = await getVerifiedResultData(id, term, session)

    // 3. Fraud Detection
    if (!data) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <div className="bg-red-950/50 border border-red-500/50 p-8 rounded-2xl max-w-lg text-center backdrop-blur-sm animate-in zoom-in duration-500">
                    <ShieldAlert className="w-20 h-20 text-red-500 mx-auto mb-4 animate-pulse" />
                    <h1 className="text-3xl font-black text-red-500 mb-3 uppercase tracking-wider drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">Fraud Alert</h1>
                    <p className="text-red-200/90 text-lg">No authentic system record matches this document's signature in our secure cloud database.</p>
                    <div className="mt-6 p-4 bg-red-950/80 rounded-lg border border-red-500/30">
                        <p className="text-sm font-mono text-red-400">WARNING: The physical document you are holding may be a forgery.</p>
                    </div>
                </div>
            </div>
        )
    }

    // 4. Authentic Render View
    return (
        <div className="min-h-screen bg-slate-200 flex flex-col font-sans selection:bg-emerald-500/30">
            {/* Secure Verification Header */}
            <div className="bg-emerald-700 text-white p-4 sticky top-0 z-50 shadow-2xl flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 border-b-4 border-emerald-500">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md shadow-inner border border-white/10">
                        <ShieldCheck className="w-7 h-7 text-emerald-50 drop-shadow-md" />
                    </div>
                    <div className="text-center sm:text-left">
                        <h1 className="font-black tracking-widest uppercase text-sm drop-shadow-sm text-emerald-50">EduFlow Secure Anchor</h1>
                        <p className="text-emerald-200/90 text-xs font-semibold tracking-wide">Cloud-Verified Digital Twin</p>
                    </div>
                </div>
                <div className="bg-emerald-950/60 px-5 py-2 rounded-full border border-emerald-400/40 flex items-center gap-2.5 shadow-inner">
                    <div className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-50 drop-shadow-md">Verified Authentic</span>
                </div>
            </div>

            {/* Document Render Zone */}
            <div className="flex-1 w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-200 via-slate-300 to-slate-400 py-12 px-4 flex justify-center overflow-auto pb-24">
                <div className="pointer-events-none relative transition-all duration-700 animate-in fade-in slide-in-from-bottom-8">
                    {/* Security Watermark Underlay */}
                    <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.03] overflow-hidden pointer-events-none">
                        <ShieldCheck className="w-[800px] h-[800px] text-emerald-900 -rotate-12" />
                    </div>
                    
                    {/* The Actual Result Component */}
                    <div className="relative z-10 shadow-[0_20px_60px_rgba(0,0,0,0.3)] ring-1 ring-slate-900/5 rounded-sm overflow-hidden bg-white">
                        <ResultSheet data={data} />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-950 text-slate-500 p-4 text-center text-xs font-semibold tracking-widest uppercase border-t border-white/5">
                Blockchain-grade metadata synced via EduFlow Validation Engine.
            </div>
        </div>
    )
}
