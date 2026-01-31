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
            "fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm border",
            !isOnline ? "bg-red-50 text-red-600 border-red-200" :
                isSyncing ? "bg-blue-50 text-blue-600 border-blue-200" :
                    "bg-slate-50 text-slate-500 border-slate-200 opacity-50 hover:opacity-100"
        )}>
            {!isOnline ? (
                <>
                    <CloudOff className="h-3 w-3" />
                    <span>Offline</span>
                </>
            ) : isSyncing ? (
                <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>Syncing...</span>
                </>
            ) : (
                <>
                    <Cloud className="h-3 w-3" />
                    <span>Saved</span>
                </>
            )}
        </div>
    )
}
