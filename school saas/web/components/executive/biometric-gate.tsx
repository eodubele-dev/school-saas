'use client'

import { useState } from "react"
import { ScanFace, Lock, Fingerprint, ShieldCheck } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

export function BiometricGate({ onUnlock }: { onUnlock: () => void }) {
    const [scanning, setScanning] = useState(false)
    const [error, setError] = useState(false)

    const handleScan = () => {
        setScanning(true)
        setError(false)

        // Simulate scanning delay
        setTimeout(() => {
            setScanning(false)
            onUnlock()
        }, 1500)
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-8">
            <div className="space-y-2">
                <div className="mx-auto h-16 w-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Lock className="h-8 w-8 text-amber-500" />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Executive Access</h1>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">
                    This dashboard contains sensitive financial data. Biometric verification required.
                </p>
            </div>

            <div className="relative">
                <AnimatePresence mode="wait">
                    {scanning ? (
                        <motion.div
                            key="scanning"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="relative"
                        >
                            <ScanFace className="h-32 w-32 text-amber-500 animate-pulse" />
                            <div className="absolute inset-0 border-t-2 border-amber-500 animate-[scan_1.5s_ease-in-out_infinite]" />
                        </motion.div>
                    ) : (
                        <motion.button
                            key="idle"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleScan}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl group-hover:bg-amber-500/30 transition-all" />
                            <Fingerprint className="relative h-32 w-32 text-slate-600 group-hover:text-amber-500 transition-colors" />
                            <div className="mt-4 text-xs font-mono text-slate-500 uppercase tracking-widest">
                                Tap to Verify ID
                            </div>
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
                <ShieldCheck className="h-3 w-3" />
                Secured by WebAuthn
            </div>
        </div>
    )
}
