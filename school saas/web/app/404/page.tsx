"use client"

import { School, ArrowLeft } from "lucide-react"

export default function NotFoundPage() {
    const handleReturn = () => {
        // Strip custom subdomains and return to primary root
        const protocol = window.location.protocol
        const host = window.location.host
        
        let rootDomain = host;
        
        // Strip subdomain for localhost and normal domains
        if (host.includes('.eduflow.ng')) rootDomain = 'eduflow.ng'
        else if (host.includes('localhost')) {
            if (host.split('.').length > 1) {
                rootDomain = host.split('.').slice(1).join('.')
            }
        }

        window.location.href = `${protocol}//${rootDomain}`
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#0A0A0B] px-4 relative overflow-hidden font-sans selection:bg-cyan-900 selection:text-white">
            {/* Background elements to match marketing login */}
            <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-md p-[1px] rounded-2xl bg-gradient-to-b from-red-500/30 to-transparent shadow-2xl">
                <div className="w-full bg-black/60 backdrop-blur-xl border-none rounded-2xl text-white p-8 text-center flex flex-col items-center">
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-red-950/30 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)] overflow-hidden">
                        <School className="h-10 w-10 text-red-400" />
                    </div>
                    
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-3">
                        Campus Not Found
                    </h1>
                    
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                        We could not verify a school associated with this secure gateway address. 
                        Please verify the URL or contact your school's system administrator.
                    </p>

                    <button
                        onClick={handleReturn}
                        className="w-full h-12 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg border border-white/10 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 text-slate-400" />
                        Return to EduFlow Registry
                    </button>
                    
                    <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        ERR_TENANT_NOT_FOUND
                    </div>
                </div>
            </div>
        </div>
    )
}
