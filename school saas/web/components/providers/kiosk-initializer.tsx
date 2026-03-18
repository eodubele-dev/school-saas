"use client"

import { useEffect } from "react"
import { useKiosk } from "@/components/providers/kiosk-provider"

interface KioskInitializerProps {
    masterPin: string
}

/**
 * KioskInitializer: Hydrates the global KioskProvider with the tenant-specific PIN.
 */
export function KioskInitializer({ masterPin }: KioskInitializerProps) {
    const { setMasterPin } = useKiosk()

    useEffect(() => {
        if (masterPin) {
            console.log("KioskInitializer: Hydrating Master PIN... 🤙🏾🔐")
            setMasterPin(masterPin)
        }
    }, [masterPin, setMasterPin])

    return null
}
