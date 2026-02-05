'use client'

import { ShieldAlert, Zap } from "lucide-react"
import { motion } from "framer-motion"

interface LockedWidgetProps {
    children: React.ReactNode
    tier: string
    requiredTier?: string
    message?: string
    onUpgrade?: () => void
}

/**
 * LockedWidget Component
 * Implements the "Soft-Lock" logic: keeps data visible but inaccessible,
 * creating a high-performance nudge for institutional upgrades.
 */
export function LockedWidget({
    children,
    tier,
    requiredTier = 'platinum',
    message = "Upgrade to Platinum to unlock this institutional expansion module.",
    onUpgrade
}: LockedWidgetProps) {
    const normalizedTier = tier?.toLowerCase() || 'starter'
    // Pilot is considered 'Platinum-light' for now, so it unlocks most things.
    const isLocked = normalizedTier === 'starter' && requiredTier !== 'starter';

    if (!isLocked) return <>{children}</>;

    return (
        <div className="relative group overflow-hidden rounded-xl border border-white/5 bg-white/[0.01] h-full min-h-[250px]">
            {/* Blurred Content Background (Data Preservation Visual) */}
            <div className="blur-[6px] grayscale opacity-30 pointer-events-none select-none h-full overflow-hidden">
                {children}
            </div>

            {/* Lock Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-[2px] z-20 p-6 text-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,245,255,0.1)]"
                >
                    <ShieldAlert className="h-7 w-7 text-cyan-400" />
                </motion.div>

                <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Access Restricted</h3>
                <p className="text-[11px] text-slate-400 mb-8 max-w-[240px] leading-relaxed uppercase tracking-wider font-medium">
                    {message}
                </p>

                <button
                    onClick={onUpgrade}
                    className="group relative px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all flex items-center gap-2 overflow-hidden"
                >
                    <span className="relative z-10">Expand Command Center</span>
                    <Zap className="h-3 w-3 fill-current relative z-10" />
                    <div className="absolute inset-0 bg-cyan-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>

                <div className="mt-5 flex items-center gap-2 opacity-30">
                    <div className="h-1 w-1 rounded-full bg-slate-500 animate-pulse" />
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter">Forensic Data Preserved in Soft-Lock</span>
                </div>
            </div>

            {/* Decorative Edge Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        </div>
    )
}
