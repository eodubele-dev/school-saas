"use client"

import { useEffect, useState } from "react"
import { getRefreshedAttendanceStats, getTeacherClasses } from "@/lib/actions/attendance"
import { createClient } from "@/lib/supabase/client"

export function AttendancePip({ classId: propClassId }: { classId?: string }) {
    const [stats, setStats] = useState({ present: 0, total: 0 })
    const [classId, setClassId] = useState<string | null>(propClassId || null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (propClassId) {
            setClassId(propClassId)
            return
        }

        const init = async () => {
            // 1. Get Teacher's Class (Fallback if no prop)
            const { success, data } = await getTeacherClasses()
            if (success && data && data.length > 0) {
                setClassId(data[0].id)
            } else {
                setLoading(false)
            }
        }
        init()
    }, [propClassId])

    useEffect(() => {
        if (!classId) return

        const fetchStats = async () => {
            if (typeof window !== "undefined" && (window as any).__EDUFLOW_KIOSK_LOCKING__) return
            const date = new Date().toISOString().split('T')[0]
            const result = await getRefreshedAttendanceStats(classId, date)
            if (result.success) {
                setStats({ present: result.present, total: result.total })
            }
            setLoading(false)
        }

        fetchStats()

        // Real-time Subscription
        const supabase = createClient()
        const channel = supabase
            .channel('attendance-pip')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'student_attendance',
                    filter: `class_id=eq.${classId}`
                },
                () => {
                    fetchStats() // Refresh on any change
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [classId])

    if (loading) return (
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-card text-card-foreground/50 rounded-lg border border-border">
            <div className="w-2 h-2 rounded-full bg-slate-600 animate-pulse" />
            <span className="text-[10px] font-mono text-muted-foreground">LOADING...</span>
        </div>
    )

    if (!classId) return null

    if (stats.total === 0) return (
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-card text-card-foreground/50 rounded-lg border border-border">
            <div className="w-2 h-2 rounded-full bg-amber-500/50" />
            <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                NO STUDENTS
            </span>
        </div>
    )

    return (
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-card text-card-foreground/50 rounded-lg border border-border">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap">
                {stats.present}/{stats.total} PRESENT
            </span>
        </div>
    )
}
