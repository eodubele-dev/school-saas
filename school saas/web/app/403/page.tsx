"use client"

import { ShieldAlert, ArrowLeft, LogOut, Home } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function ForbiddenContent() {
    const searchParams = useSearchParams()
    const reason = searchParams.get('reason')
    const isUpgrade = reason === 'upgrade'

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[#080C18] text-white p-6 relative overflow-hidden">
            {/* Background glow effects */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-red-800/10 rounded-full blur-[60px] pointer-events-none" />

            {/* Card */}
            <div className="relative z-10 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
                            <ShieldAlert className="h-12 w-12 text-red-400" />
                        </div>
                        <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-red-500 rounded-full animate-ping" />
                        <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-red-500 rounded-full" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                    {isUpgrade ? "Plan Upgrade Required" : "Access Denied"}
                </h1>

                {/* Message */}
                <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
                    {isUpgrade
                        ? "This feature requires a higher subscription plan. Please contact your administrator to upgrade."
                        : "Your account does not have permission to view this area. This attempt has been logged for security purposes."
                    }
                </p>

                {/* Action buttons */}
                <div className="flex flex-col gap-3">
                    <Link
                        href="/dashboard"
                        className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all active:scale-95 shadow-lg shadow-blue-500/20"
                    >
                        <Home className="h-4 w-4" />
                        Return to Dashboard
                    </Link>
                    <div className="flex gap-3">
                        <Link
                            href="javascript:history.back()"
                            onClick={(e) => { e.preventDefault(); window.history.back() }}
                            className="flex items-center justify-center gap-2 flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold text-sm transition-all"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Go Back
                        </Link>
                        <Link
                            href="/login"
                            className="flex items-center justify-center gap-2 flex-1 py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold text-sm transition-all"
                        >
                            <LogOut className="h-4 w-4" />
                            Switch Account
                        </Link>
                    </div>
                </div>

                {/* Error code */}
                <p className="text-[10px] text-slate-600 mt-8 font-mono tracking-widest uppercase">
                    Error Code: {isUpgrade ? "403_PLAN_REQUIRED" : "403_FORBIDDEN_ZONE"}
                </p>
            </div>

            {/* Subtle grid background */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.02]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />
        </div>
    )
}

export default function ForbiddenPage() {
    return (
        <Suspense fallback={
            <div className="h-screen w-full flex items-center justify-center bg-[#080C18]">
                <div className="animate-pulse text-slate-500">Loading...</div>
            </div>
        }>
            <ForbiddenContent />
        </Suspense>
    )
}
