"use client"

import React, { useState } from 'react'
import { Activity, X } from 'lucide-react'
import { FinancialText } from '@/components/ui/financial-text'
import { SMSWalletTopupButton } from './sms-wallet-topup-button'

interface PilotBannerProps {
    smsBalance: number
}

export function PilotBanner({ smsBalance }: PilotBannerProps) {
    const [isVisible, setIsVisible] = useState(true)

    if (!isVisible) return null

    return (
        <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl relative overflow-hidden group/pilot">
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center animate-pulse">
                    <Activity className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">Lagos Pilot Mode Active</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500 text-black text-[10px] font-black uppercase">Term 1 Free</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Full ecosystem access enabled. System integrity logs: <span className="text-emerald-400 font-mono italic text-[10px]">VERIFIED</span></p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">SMS Balance</p>
                    <p className={`text-sm font-black ${smsBalance < 400 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {smsBalance.toLocaleString()} Units
                    </p>
                </div>
                {smsBalance < 400 && (
                    <SMSWalletTopupButton />
                )}
                <button
                    onClick={() => setIsVisible(false)}
                    className="p-1 hover:bg-emerald-500/10 rounded-lg text-emerald-500/40 hover:text-emerald-400 transition-all opacity-0 group-hover/pilot:opacity-100"
                    title="Dismiss"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
        </div>
    )
}
