"use client"

import React from 'react'
import { SMSWalletModal } from './sms-wallet-modal'

interface SMSWalletTriggerProps {
    children: (open: () => void) => React.ReactNode
}

export function SMSWalletTrigger({ children }: SMSWalletTriggerProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <>
            {children(() => setOpen(true))}
            <SMSWalletModal open={open} onOpenChange={setOpen} />
        </>
    )
}
