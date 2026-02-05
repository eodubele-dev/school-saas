'use client'

import { useState } from "react"
import { changeSubscriptionTier } from "@/lib/actions/subscription"
import { toast } from "sonner"
import { Rocket, ShieldCheck, Zap, Loader2 } from "lucide-react"
import { ProvisioningSuccess } from "@/components/onboarding/provisioning-success"

interface TierManagerProps {
    currentTier: string
    schoolName: string
    subdomain: string
}

/**
 * TierManager Component
 * Handles the logic and UI for transitioning between subscription levels.
 */
export function TierManager({ currentTier, schoolName, subdomain }: TierManagerProps) {
    const [isPending, setIsPending] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    const handleUpgrade = async (tier: string) => {
        setIsPending(true)
        try {
            const res = await changeSubscriptionTier(tier)
            if (res.success) {
                toast.success("Tier Transition Successful", {
                    description: res.message
                })

                // If upgrading to platinum, show the celebration
                if (res.isUpgrade && tier.toLowerCase() === 'platinum') {
                    setShowSuccess(true)
                    // Auto-hide the overlay after a duration and refresh
                    setTimeout(() => {
                        window.location.reload()
                    }, 4000)
                } else {
                    // Just refresh to update claims
                    window.location.reload()
                }
            } else {
                toast.error("Transition Failed", {
                    description: res.error
                })
            }
        } catch (error) {
            toast.error("An unexpected error occurred.")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <>
            <div className="bg-[#111113] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 group hover:border-cyan-500/30 transition-all">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center relative overflow-hidden">
                        <Rocket className="h-6 w-6 text-slate-400 group-hover:text-cyan-400 transition-colors relative z-10" />
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm">Institutional Tier Management</h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-0.5">
                            Status: <span className="text-cyan-400 font-black">{currentTier.toUpperCase()}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {currentTier.toLowerCase() !== 'platinum' && (
                        <button
                            onClick={() => handleUpgrade('platinum')}
                            disabled={isPending}
                            className="flex-1 md:flex-none px-5 py-2.5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        >
                            {isPending ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <>
                                    <span>Expand to Platinum</span>
                                    <Zap className="h-3 w-3 fill-current" />
                                </>
                            )}
                        </button>
                    )}

                    {currentTier.toLowerCase() === 'platinum' && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <ShieldCheck className="h-4 w-4 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Enterprise Secured</span>
                        </div>
                    )}
                </div>
            </div>

            <ProvisioningSuccess
                isVisible={showSuccess}
                schoolName={schoolName}
                subdomain={subdomain}
            />
        </>
    )
}
