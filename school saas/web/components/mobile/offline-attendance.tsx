"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Check, X, Clock, Wifi, WifiOff, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { syncAttendanceBatch } from "@/lib/actions/mobile-actions"

// Mock Students for Demo
const MOCK_STUDENTS = [
    { id: '1', name: 'Zainab Ali' },
    { id: '2', name: 'Emeka Okafor' },
    { id: '3', name: 'David Ibrahim' },
    { id: '4', name: 'Grace Adebayo' },
]

export function OfflineAttendance() {
    const [statusMap, setStatusMap] = useState<Record<string, 'present' | 'absent' | 'late'>>({})
    const [isOnline, setIsOnline] = useState(true)
    const [pendingSync, setPendingSync] = useState(0)
    const [syncing, setSyncing] = useState(false)

    // 1. Connectivity Listener
    useEffect(() => {
        setIsOnline(navigator.onLine)
        const handleOnline = () => setIsOnline(true)
        const handleOffline = () => setIsOnline(false)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        // Load Pending Syncs
        const pend = localStorage.getItem('edu_attendance_queue')
        if (pend) {
            setPendingSync(JSON.parse(pend).length)
        }

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    const toggleStatus = (studentId: string, status: 'present' | 'absent' | 'late') => {
        setStatusMap(prev => ({ ...prev, [studentId]: status }))

        // Save to Local Queue
        const newRecord = { studentId, status, timestamp: Date.now() }
        const queue = JSON.parse(localStorage.getItem('edu_attendance_queue') || '[]')
        queue.push(newRecord)
        localStorage.setItem('edu_attendance_queue', JSON.stringify(queue))
        setPendingSync(queue.length)
    }

    const handleSync = async () => {
        if (!isOnline) {
            toast.error("Still offline. Cannot sync.")
            return
        }

        setSyncing(true)
        const queue = JSON.parse(localStorage.getItem('edu_attendance_queue') || '[]')

        try {
            const res = await syncAttendanceBatch(queue)
            if (res.success) {
                toast.success(`Synced ${queue.length} records!`)
                localStorage.removeItem('edu_attendance_queue')
                setPendingSync(0)
            }
        } catch (e) {
            toast.error("Sync failed")
        } finally {
            setSyncing(false)
        }
    }

    return (
        <div className="space-y-4">
            {/* Sync Bar */}
            <div className={`p-3 rounded-lg flex items-center justify-between text-xs font-bold ${isOnline ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                <div className="flex items-center gap-2">
                    {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                    <span>{isOnline ? 'ONLINE' : 'OFFLINE MODE'}</span>
                </div>
                {pendingSync > 0 && (
                    <Button size="sm" variant="outline" className="h-7 text-xs border-white/10" onClick={handleSync} disabled={syncing || !isOnline}>
                        <RefreshCw className={`h-3 w-3 mr-1 ${syncing ? 'animate-spin' : ''}`} />
                        Sync ({pendingSync})
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 gap-3">
                {MOCK_STUDENTS.map(student => {
                    const status = statusMap[student.id]
                    return (
                        <Card key={student.id} className="p-4 bg-slate-900 border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border border-white/10">
                                    <AvatarFallback className="bg-slate-800 text-slate-300">{student.name.substring(0, 2)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-white">{student.name}</span>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    size="icon"
                                    className={`h-10 w-10 rounded-full transition-all ${status === 'present' ? 'bg-emerald-600 hover:bg-emerald-600 scale-110 ring-2 ring-emerald-500/50' : 'bg-slate-800 hover:bg-slate-700'}`}
                                    onClick={() => toggleStatus(student.id, 'present')}
                                >
                                    <Check className="h-5 w-5" />
                                </Button>
                                <Button
                                    size="icon"
                                    className={`h-10 w-10 rounded-full transition-all ${status === 'absent' ? 'bg-rose-600 hover:bg-rose-600 scale-110 ring-2 ring-rose-500/50' : 'bg-slate-800 hover:bg-slate-700'}`}
                                    onClick={() => toggleStatus(student.id, 'absent')}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                                <Button
                                    size="icon"
                                    className={`h-10 w-10 rounded-full transition-all ${status === 'late' ? 'bg-amber-500 hover:bg-amber-500 scale-110 ring-2 ring-amber-500/50' : 'bg-slate-800 hover:bg-slate-700'}`}
                                    onClick={() => toggleStatus(student.id, 'late')}
                                >
                                    <Clock className="h-5 w-5" />
                                </Button>
                            </div>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
