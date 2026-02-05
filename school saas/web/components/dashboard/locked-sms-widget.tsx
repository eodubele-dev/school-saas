"use client"

import React from 'react'
import { LockedWidget } from './locked-widget'
import { SMSWalletTrigger } from './sms-wallet-trigger'

interface LockedSMSWidgetProps {
    children: React.ReactNode
    tier: string
    requiredTier?: string
    message?: string
}

export function LockedSMSWidget({
    children,
    tier,
    requiredTier = 'platinum',
    message = "Funding required to resume automated operations."
}: LockedSMSWidgetProps) {
    return (
        <SMSWalletTrigger>
            {(open) => (
                <LockedWidget
                    isLocked={true}
                    tier={tier}
                    requiredTier={requiredTier}
                    message={message}
                    onUpgrade={open}
                >
                    {children}
                </LockedWidget>
            )}
        </SMSWalletTrigger>
    )
}
