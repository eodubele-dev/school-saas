"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShieldCheck, Fingerprint, LockKeyhole, Loader2, AlertCircle } from "lucide-react"
import { checkStatus, authenticate } from "@tauri-apps/plugin-biometric"
import { isDesktop } from "@/lib/utils/desktop"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

/**
 * Biometric Guard (Platinum Elite) 🛡️🔐🏾🇳🇬
 * Protects the dashboard with native Windows Hello authentication.
 */
export function BiometricGuard({ children }: { children: React.ReactNode }) {
    const [isUnlocked, setIsUnlocked] = useState(false)
    const [isSupported, setIsSupported] = useState<boolean | null>(() => {
        if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('eduflow-biometrics-supported')
            if (cached === 'true') return true
            if (cached === 'false') return false
        }
        return null
    })
    const [isAuthenticating, setIsAuthenticating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (isDesktop()) {
            // Only verify support if it hasn't been cached as unsupported
            if (isSupported === null) {
                verifyBiometricSupport()
            } else if (isSupported === false) {
                // If cached as unsupported, unlock immediately
                setIsUnlocked(true)
            }
        } else {
            setIsUnlocked(true)
        }
    }, [isSupported]) // Depend on isSupported to re-run if it changes from null

    const verifyBiometricSupport = async () => {
        try {
            console.log("Biometric Guard: Verifying system support... 🤙🏾🔐")
            
            const status = await checkStatus()
            const available = status.isAvailable
            setIsSupported(available)
            
            if (typeof window !== 'undefined') {
                localStorage.setItem('eduflow-biometrics-supported', available.toString())
            }
            
            if (!available) {
                setIsUnlocked(true)
            }
        } catch (err) {
            setIsSupported(false)
            setIsUnlocked(true)
        }
    }

    const handleAuthenticate = async () => {
        setIsAuthenticating(true)
        setError(null)
        try {
            await authenticate("Please verify your identity to access the Platinum Command Center.")
            setIsUnlocked(true)
            toast.success("Identity Verified. Welcome back, Principal. 🤙🏾💎")
        } catch (err: any) {
            console.error("Authentication Failed:", err)
            setError(err.message || "Verification failed. Please try again.")
            toast.error("Biometric verification failed.")
        } finally {
            setIsAuthenticating(false)
        }
    }

    if (!mounted) {
        // Optimization: If NOT on desktop (web browser), bypass early to prevent blank page
        if (!isDesktop()) return <>{children}</>

        // High-fidelity hydration guard: If we suspect desktop, hide dashboard until mounted
        if (typeof window !== 'undefined' && (window as any).__TAURI__) {
            return <div className="fixed inset-0 bg-slate-950 z-[9998]" />
        }
        return <>{children}</>
    }

    // High-fidelity protection: If biometrics are active, hide the dashboard until unlocked
    const showLock = isSupported === true && !isUnlocked
    const showDashboard = isUnlocked || isSupported === false

    return (
        <>
            <AnimatePresence mode="wait">
                {showLock && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-slate-950 flex items-center justify-center p-6"
                    >
                        {/* Overlay to hide dashboard entirely while locked */}
                        <div className="absolute inset-0 bg-slate-950 z-[-1]" />
                        
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl text-center space-y-8 relative overflow-hidden"
                        >
                            {/* Background Pulse */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -z-10" />

                            <div className="flex justify-center">
                                <div className="p-4 bg-primary/20 rounded-2xl border border-primary/30">
                                    <LockKeyhole className="w-12 h-12 text-primary" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-white tracking-tight">Executive Lockdown</h2>
                                <p className="text-slate-400 text-sm">
                                    Your workstation is protected by **Biometric Gatekeeper**. 
                                    Please authenticate to resume institutional command.
                                </p>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm"
                                >
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            <div className="space-y-4">
                                <Button
                                    size="lg"
                                    className="w-full h-14 text-lg rounded-2xl gap-3 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
                                    onClick={handleAuthenticate}
                                    disabled={isAuthenticating}
                                >
                                    {isAuthenticating ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            <Fingerprint className="w-6 h-6" />
                                            Unlock Workstation
                                        </>
                                    )}
                                </Button>
                                
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black flex items-center justify-center gap-2">
                                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                    Biometric Guard Active
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {showDashboard ? children : (
                <div className="fixed inset-0 bg-slate-950 z-[9998]" />
            )}
        </>
    )
}
