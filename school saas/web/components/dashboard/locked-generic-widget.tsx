"use client"

import React from 'react'
import { LockedWidget } from './locked-widget'
import { useDashboardModals } from './dashboard-modal-provider'

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
    const { openUpgradeModal } = useDashboardModals()

    return (
        <LockedWidget
            tier={tier}
            requiredTier={requiredTier}
            message={message}
            onUpgrade={openUpgradeModal}
        >
            {children}
        </LockedWidget>
    )
}
