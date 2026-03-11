"use client"

import React, { createContext, useContext, useState } from 'react'
import { UpgradeModal } from '@/components/modals/upgrade-modal'

interface DashboardModalContextType {
    openUpgradeModal: () => void
}

const DashboardModalContext = createContext<DashboardModalContextType | undefined>(undefined)

export function DashboardModalProvider({
    children,
    currentTier,
    schoolName
}: {
    children: React.ReactNode
    currentTier: string
    schoolName: string
}) {
    const [isUpgradeOpen, setIsUpgradeOpen] = useState(false)

    return (
        <DashboardModalContext.Provider value={{ openUpgradeModal: () => setIsUpgradeOpen(true) }}>
            {children}
            <UpgradeModal
                isOpen={isUpgradeOpen}
                onClose={() => setIsUpgradeOpen(false)}
                currentTier={currentTier}
                tenantName={schoolName}
            />
        </DashboardModalContext.Provider>
    )
}

export function useDashboardModals() {
    const context = useContext(DashboardModalContext)
    if (context === undefined) {
        throw new Error('useDashboardModals must be used within a DashboardModalProvider')
    }
    return context
}
