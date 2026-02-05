"use client"

import React from 'react'
import { SMSWalletTrigger } from './sms-wallet-trigger'

export function SMSWalletTopupButton({ className, children }: { className?: string, children?: React.ReactNode }) {
    return (
        <SMSWalletTrigger>
            {(open) => (
                <button
                    onClick={open}
                    className={className || "bg-amber-500 text-black px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"}
                >
                    {children || "TOP UP TO ACTIVATE"}
                </button>
            )}
        </SMSWalletTrigger>
    )
}
