"use client"

import { useEffect, useState } from "react"
import { getRefreshedAttendanceStats, getTeacherClasses } from "@/lib/actions/attendance"
import { createClient } from "@/lib/supabase/client"

export function AttendancePip() {
    const [stats, setStats] = useState({ present: 0, total: 0 })
    const [classId, setClassId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const init = async () => {
            // 1. Get Teacher's Class
            const { success, data } = await getTeacherClasses()
            if (success && data && data.length > 0) {
                setClassId(data[0].id)
            } else {
                setLoading(false)
            }
        }
        init()
    }, [])

    useEffect(() => {
        if (!classId) return

        const fetchStats = async () => {
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
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 rounded-lg border border-slate-800">
            <div className="w-2 h-2 rounded-full bg-slate-600 animate-pulse" />
            <span className="text-[10px] font-mono text-slate-500">LOADING...</span>
        </div>
    )

    if (!classId) return null

    return (
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 rounded-lg border border-slate-800">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono text-slate-400">
                {stats.present}/{stats.total} PRESENT
            </span>
        </div>
    )
}
