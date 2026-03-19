"use client"

import { useIsFetching, useIsMutating } from "@tanstack/react-query"
import { Cloud, CloudOff, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function SyncStatus() {
    const isFetching = useIsFetching()
    const isMutating = useIsMutating()
    const [isOnline, setIsOnline] = useState(true)

    useEffect(() => {
        setIsOnline(navigator.onLine)

        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    const isSyncing = isFetching > 0 || isMutating > 0

    return (
        <div className={cn(
            "fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest transition-all shadow-2xl backdrop-blur-xl border",
            !isOnline ? "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]" :
                isSyncing ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]" :
                    "bg-[#0A0A0B]/80 text-slate-500 border-white/5 opacity-50 hover:opacity-100"
        )}>
            {!isOnline ? (
                <>
                    <CloudOff className="h-3 w-3 animate-pulse" />
                    <span>System Offline</span>
                </>
            ) : isSyncing ? (
                <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>Synchronizing...</span>
                </>
            ) : (
                <>
                    <Cloud className="h-3 w-3 text-emerald-500" />
                    <span>Vault Secured</span>
                </>
            )}
        </div>
    )
}
