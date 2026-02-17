"use client"

import { useState, useEffect } from "react"

export interface TeacherWorkspaceData {
    profile: any
    activeClass: {
        id?: string
        name: string
        grade_level: string
        subject?: string
    }
    vitals: {
        present: number
        absent: number
        avgAttendance: number
    }
    metrics: {
        pendingAssignments: number
        upcomingExams: number
    }
    upcomingLessons: any[]
}

export function useTeacherData(pollingInterval = 30000) {
    const [data, setData] = useState<TeacherWorkspaceData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        try {
            // Get local date YYYY-MM-DD
            const d = new Date()
            const pad = (n: number) => n < 10 ? '0' + n : n
            const localDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
            const localTime = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`

            const response = await fetch(`/api/teacher/workspace?date=${localDate}&time=${localTime}`)
            if (!response.ok) throw new Error("Failed to fetch workspace data")
            const result = await response.json()
            setData(result)
            setError(null)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()

        if (pollingInterval > 0) {
            const interval = setInterval(fetchData, pollingInterval)
            return () => clearInterval(interval)
        }
    }, [pollingInterval])

    return { data, loading, error, refetch: fetchData }
}
