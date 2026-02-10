'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Ban, ArrowUpCircle } from 'lucide-react'
import { SMSWalletTrigger } from './sms-wallet-trigger'

interface SMSWalletAlertProps {
    balance: number
}

/**
 * SMSWalletAlert Component
 * Implements the "Auto-Nudge" logic for institutional SMS balance.
 * Neon Amber for low balance (< 2000), Pulse Red for critical (<= 0).
 */
const HALT_THRESHOLD = 0 // Threshold where communication stops
const LOW_THRESHOLD = 2000 // Threshold for warning

export function SMSWalletAlert({ balance }: SMSWalletAlertProps) {
    const isLow = balance < LOW_THRESHOLD
    const isCritical = balance <= HALT_THRESHOLD

    if (balance >= LOW_THRESHOLD) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`border-b z-50 sticky top-0 transition-all duration-500 ${isCritical
                    ? 'bg-red-500/20 border-red-500/40 shadow-[inset_0_0_30px_rgba(239,68,68,0.1)]'
                    : 'bg-amber-500/20 border-amber-500/40 shadow-[inset_0_0_30px_rgba(245,158,11,0.1)]'
                    }`}
            >
                <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`h-11 w-11 rounded-2xl flex items-center justify-center border shadow-lg transition-all ${isCritical
                            ? 'bg-red-500/30 text-red-100 border-red-500/50 shadow-red-900/40'
                            : 'bg-amber-500/30 text-amber-100 border-amber-500/50 shadow-amber-900/40'
                            }`}>
                            {isCritical ? <Ban className="h-5 w-5 animate-pulse" /> : <AlertCircle className="h-5 w-5" />}
                        </div>

                        <div>
                            <p className="text-white text-sm font-black tracking-tight flex items-center gap-2">
                                {isCritical ? 'Institutional Communication Halted' : 'Low Communication Credits'}
                                {isCritical && <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />}
                            </p>
                            <p className="text-[10px] text-slate-100 font-mono uppercase tracking-widest mt-1 opacity-90">
                                Balance: <span className={isCritical ? 'text-red-300 font-black' : 'text-amber-300 font-black'}>
                                    ₦{balance.toLocaleString()}
                                </span>
                                <span className="mx-2 opacity-30 text-white">//</span>
                                Est. Units: <span className="text-white font-black underline decoration-white/20 underline-offset-2">~{Math.floor(balance / 5)}</span>
                            </p>
                        </div>
                    </div>

                    <SMSWalletTrigger>
                        {(open) => (
                            <button
                                onClick={open}
                                className={`group relative px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.03] active:scale-95 flex items-center gap-2 overflow-hidden shadow-2xl ${isCritical
                                    ? 'bg-red-600 text-white shadow-red-950/40'
                                    : 'bg-amber-600 text-white shadow-amber-950/40'
                                    }`}
                            >
                                <span className="relative z-10">Top Up Wallet</span>
                                <ArrowUpCircle className="h-3.5 w-3.5 relative z-10 transition-transform group-hover:-translate-y-0.5" />
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        )}
                    </SMSWalletTrigger>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
