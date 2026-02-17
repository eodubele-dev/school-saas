"use client"

import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { getStaffAttendanceHistory } from "@/lib/actions/staff-clock-in"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function AttendanceHistory() {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [history, setHistory] = useState<any[]>([])

    useEffect(() => {
        const fetchHistory = async () => {
            const res = await getStaffAttendanceHistory(60)
            if (res.success && res.data) {
                setHistory(res.data)
            }
        }

        fetchHistory()

        // Poll for realtime updates
        const interval = setInterval(fetchHistory, 10000)
        return () => clearInterval(interval)
    }, [])

    const derivedLateDays: Date[] = []
    const derivedPresentDays: Date[] = []

    history.forEach(h => {
        if (!h.checkInTime) return
        const [hours] = h.checkInTime.split(':').map(Number)
        if (hours > 8 || (hours === 8 && Number(h.checkInTime.split(':')[1]) > 0)) {
            derivedLateDays.push(new Date(h.date))
        } else {
            derivedPresentDays.push(new Date(h.date))
        }
    })

    const days = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    })

    const startDay = getDay(startOfMonth(currentMonth)) // 0 = Sunday

    return (
        <Card className="p-4 bg-slate-900 border-white/5">
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-widest px-2">My History</h3>

            <div className="flex items-center justify-between mb-4 px-2">
                <button onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} className="text-slate-400 hover:text-white">
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-bold text-white">{format(currentMonth, 'MMMM yyyy')}</span>
                <button onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} className="text-slate-400 hover:text-white">
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} className="text-slate-500 font-bold py-1">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: startDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}
                {days.map((day) => {
                    const isPresent = derivedPresentDays.some(d => isSameDay(d, day))
                    const isLate = derivedLateDays.some(d => isSameDay(d, day))

                    return (
                        <div
                            key={day.toISOString()}
                            className={`
                                aspect-square flex items-center justify-center rounded-md text-sm font-medium
                                ${!isSameMonth(day, currentMonth) ? 'text-slate-600' : 'text-slate-300'}
                                ${isPresent ? 'bg-cyan-500 text-white font-bold' : ''}
                                ${isLate ? 'bg-amber-500 text-white font-bold' : ''}
                                ${!isPresent && !isLate && isSameMonth(day, currentMonth) ? 'hover:bg-white/5' : ''}
                            `}
                        >
                            {format(day, 'd')}
                        </div>
                    )
                })}
            </div>

            <div className="flex gap-4 mt-6 text-xs px-2 justify-center">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                    <span className="text-slate-400">On Time</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-slate-400">Late</span>
                </div>
            </div>
        </Card>
    )
}
