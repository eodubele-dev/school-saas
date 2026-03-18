"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { isDesktop } from "@/lib/utils/desktop"
import { upsertVaultRecord, getVaultRecord } from "@/lib/utils/vault-db"
import { getAdminStats } from "@/lib/actions/dashboard"
import { toast } from "sonner"

interface OfflineVaultContextType {
    isOnline: boolean
    isSynced: boolean
    lastSync: Date | null
    syncNow: () => Promise<void>
}

const OfflineVaultContext = createContext<OfflineVaultContextType | undefined>(undefined)

export function OfflineVaultProvider({ children }: { children: ReactNode }) {
    const [isOnline, setIsOnline] = useState(true)
    const [isSynced, setIsSynced] = useState(false)
    const [lastSync, setLastSync] = useState<Date | null>(null)

    useEffect(() => {
        if (!isDesktop()) return

        // Monitor connectivity
        const updateStatus = () => setIsOnline(navigator.onLine)
        window.addEventListener("online", updateStatus)
        window.addEventListener("offline", updateStatus)
        updateStatus()

        // Initial sync
        syncNow()

        // Periodic background sync (every 10 minutes)
        const interval = setInterval(() => {
            if (navigator.onLine) syncNow()
        }, 10 * 60 * 1000)

        return () => {
            window.removeEventListener("online", updateStatus)
            window.removeEventListener("offline", updateStatus)
            clearInterval(interval)
        }
    }, [])

    const syncNow = async () => {
        // Prevent sync during Kiosk Mode transitions to avoid 'Failed to fetch' server action aborts
        if (!isDesktop() || !navigator.onLine || (window as any).__EDUFLOW_KIOSK_LOCKING__) return

        try {
            console.log("Vault Sync Starting... 🤙🏾🗄️")
            
            // 1. Fetch Fresh Pulse (Admin Stats)
            const stats = await getAdminStats()
            if (stats) {
                await upsertVaultRecord("admin_pulse", "dashboard", stats)
            }

            // 2. Fetch other critical data points as needed
            // (Teachers, Classes, etc can be added here)

            setLastSync(new Date())
            setIsSynced(true)
            console.log("Vault Sync Complete. 🤙🏾💎")
        } catch (err) {
            console.error("Vault Sync Failed:", err)
        }
    }

    return (
        <OfflineVaultContext.Provider value={{ isOnline, isSynced, lastSync, syncNow }}>
            {children}
        </OfflineVaultContext.Provider>
    )
}

export function useOfflineVault() {
    const context = useContext(OfflineVaultContext)
    if (context === undefined) {
        throw new Error("useOfflineVault must be used within an OfflineVaultProvider")
    }
    return context
}
