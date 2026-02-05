"use client"

import React from 'react'
import { LockedWidget } from './locked-widget'
import { toast } from 'sonner'

interface LockedGenericWidgetProps {
    children: React.ReactNode
    tier: string
    requiredTier?: string
    message?: string
}

export function LockedGenericWidget({
    children,
    tier,
    requiredTier = 'platinum',
    message
}: LockedGenericWidgetProps) {
    const handleUpgrade = () => {
        toast.info("Institutional Expansion", {
            description: "This module is part of the Platinum expansion. Contact support to upgrade your institution."
        })
    }

    return (
        <LockedWidget
            tier={tier}
            requiredTier={requiredTier}
            message={message}
            onUpgrade={handleUpgrade}
        >
            {children}
        </LockedWidget>
    )
}
