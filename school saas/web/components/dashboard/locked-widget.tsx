'use client'

import { ShieldAlert, Zap, Crown } from "lucide-react"
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
        <div className="relative group h-full w-full overflow-hidden rounded-xl">
            {/* Premium Module Badge */}
            <div className="absolute top-3 right-3 z-30 px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-md flex items-center gap-2">
                <Crown className="h-2.5 w-2.5 text-cyan-500 dark:text-cyan-400" />
                <span className="text-[9px] font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-widest font-bold">Premium Module</span>
            </div>

            {/* Blurred Content Background (Data Preservation Visual) - Enhanced Blur */}
            <div className="blur-[10px] grayscale opacity-30 pointer-events-none select-none h-full overflow-hidden transition-all duration-300">
                {children}
            </div>

            {/* Lock Overlay - Modern Dashboard Glassmorphism */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f172a]/90 backdrop-blur-lg z-20 p-4 text-center rounded-xl border border-border/50 shadow-2xl">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,245,255,0.1)]"
                >
                    <ShieldAlert className="h-6 w-6 text-cyan-400" />
                </motion.div>

                <h3 className="text-base font-bold text-foreground mb-1 tracking-tight">Access Restricted</h3>
                <p className="text-[10px] text-muted-foreground mb-5 max-w-[220px] leading-relaxed uppercase tracking-widest font-medium">
                    {message}
                </p>

                <button
                    onClick={onUpgrade}
                    className="group relative px-5 py-2.5 bg-blue-600 border border-blue-500/50 text-foreground text-[10px] font-black uppercase tracking-widest rounded-lg hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all flex items-center gap-2 overflow-hidden"
                >
                    <span className="relative z-10">Expand Command Center</span>
                    <Zap className="h-3 w-3 fill-current relative z-10 text-foreground" />
                    <div className="absolute inset-0 bg-blue-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>

                <div className="mt-5 flex items-center gap-2 opacity-70">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse" />
                    <span className="text-[9px] font-mono text-slate-300 uppercase tracking-wider">Forensic Data Preserved in Soft-Lock</span>
                </div>
            </div>

            {/* Decorative Edge Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        </div>
    )
}
