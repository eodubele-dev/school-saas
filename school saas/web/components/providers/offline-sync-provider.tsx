"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import { clockInStaff, clockOutStaff } from "@/lib/actions/staff-clock-in"
import { markStudentAttendance } from "@/lib/actions/student-attendance"

type OfflineAction = {
    id: string
    type: 'CLOCK_IN' | 'CLOCK_OUT' | 'STUDENT_ATTENDANCE'
    payload: any
    timestamp: number
}

interface OfflineSyncContextType {
    isOnline: boolean
    queueLength: number
    queueAction: (action: Omit<OfflineAction, 'id' | 'timestamp'>) => void
    syncNow: () => Promise<void>
}

const OfflineSyncContext = createContext<OfflineSyncContextType | undefined>(undefined)

const STORAGE_KEY = "edu-flow-offline-queue"

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
    const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true)
    const [queue, setQueue] = useState<OfflineAction[]>([])
    const [isSyncing, setIsSyncing] = useState(false)

    // Load queue on mount
    useEffect(() => {
        const savedQueue = localStorage.getItem(STORAGE_KEY)
        if (savedQueue) {
            try {
                setQueue(JSON.parse(savedQueue))
            } catch (e) {
                console.error("Failed to parse offline queue", e)
            }
        }

        const handleOnline = () => {
            setIsOnline(true)
            toast.success("Back online! Resuming synchronization... 🤙🏾📡")
        }
        const handleOffline = () => {
            setIsOnline(false)
            toast.warning("Network connection lost. Offline mode active. 🤙🏾🔌")
        }

        window.addEventListener("online", handleOnline)
        window.addEventListener("offline", handleOffline)

        return () => {
            window.removeEventListener("online", handleOnline)
            window.removeEventListener("offline", handleOffline)
        }
    }, [])

    // Persist queue changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
    }, [queue])

    const processAction = async (action: OfflineAction) => {
        try {
            switch (action.type) {
                case 'CLOCK_IN':
                    await clockInStaff(action.payload.latitude, action.payload.longitude, action.payload.date)
                    break
                case 'CLOCK_OUT':
                    await clockOutStaff(action.payload.date)
                    break
                case 'STUDENT_ATTENDANCE':
                    await markStudentAttendance(action.payload.classId, action.payload.date, action.payload.records)
                    break
            }
            return true
        } catch (error) {
            console.error(`Failed to sync action ${action.id}`, error)
            return false
        }
    }

    const syncNow = useCallback(async () => {
        // Prevent sync during Kiosk Mode transitions
        if (isSyncing || queue.length === 0 || !navigator.onLine || (typeof window !== "undefined" && (window as any).__EDUFLOW_KIOSK_LOCKING__)) return

        setIsSyncing(true)
        const currentQueue = [...queue]
        const remainingQueue: OfflineAction[] = []

        toast.info(`Syncing ${currentQueue.length} pending records... 🤙🏾⏳`)

        for (const action of currentQueue) {
            const success = await processAction(action)
            if (!success) {
                remainingQueue.push(action)
            }
        }

        setQueue(remainingQueue)
        setIsSyncing(false)

        if (remainingQueue.length === 0) {
            toast.success("All records synchronized successfully! 🤙🏾💎")
        } else {
            toast.error(`Failed to sync ${remainingQueue.length} records. Will retry later.`)
        }
    }, [queue, isSyncing])

    // Auto-sync when coming online
    useEffect(() => {
        if (isOnline && queue.length > 0) {
            syncNow()
        }
    }, [isOnline, queue.length, syncNow])

    const queueAction = useCallback((action: Omit<OfflineAction, 'id' | 'timestamp'>) => {
        const newAction: OfflineAction = {
            ...action,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now()
        }
        setQueue(prev => [...prev, newAction])
        
        if (!navigator.onLine) {
            toast.info("Offline: Action queued for sync. 🤙🏾📦")
        }
    }, [])

    return (
        <OfflineSyncContext.Provider value={{ isOnline, queueLength: queue.length, queueAction, syncNow }}>
            {children}
            {queue.length > 0 && (
                <div className="fixed bottom-4 right-4 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-slate-900 border border-blue-500/30 rounded-full px-4 py-2 flex items-center gap-3 shadow-2xl backdrop-blur-md">
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-xs font-bold text-slate-200">
                            {isOnline ? `Syncing ${queue.length} records...` : `${queue.length} records waiting for sync`}
                        </span>
                        {isOnline && (
                             <button 
                                onClick={syncNow}
                                className="text-[10px] uppercase font-black text-blue-400 hover:text-blue-300 transition-colors ml-2"
                             >
                                Force Sync
                             </button>
                        )}
                    </div>
                </div>
            )}
        </OfflineSyncContext.Provider>
    )
}

export const useOfflineSync = () => {
    const context = useContext(OfflineSyncContext)
    if (context === undefined) {
        throw new Error("useOfflineSync must be used within an OfflineSyncProvider")
    }
    return context
}
