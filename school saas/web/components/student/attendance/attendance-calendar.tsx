"use client"

import { useState } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from "date-fns"
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AttendanceCalendarProps {
    history: any[]
}

export function AttendanceCalendar({ history }: AttendanceCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date())

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
    })

    // Pad the start of the month
    const startDay = getDay(startOfMonth(currentDate))
    const paddingDays = Array(startDay).fill(null)

    const getStatusForDay = (date: Date) => {
        const record = history.find(h => isSameDay(new Date(h.date), date))
        return record ? record.status : null
    }

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

    return (
        <div className="bg-slate-900 border border-white/5 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                    {format(currentDate, "MMMM yyyy")}
                </h3>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8 border-slate-700 bg-slate-800 hover:bg-slate-700">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 border-slate-700 bg-slate-800 hover:bg-slate-700">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-sm font-medium text-slate-500 py-2">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {paddingDays.map((_, i) => (
                    <div key={`pad-${i}`} className="h-10 md:h-14" />
                ))}

                {daysInMonth.map((date) => {
                    const status = getStatusForDay(date)
                    const isToday = isSameDay(date, new Date())

                    return (
                        <div
                            key={date.toString()}
                            className={cn(
                                "h-10 md:h-14 rounded-lg flex flex-col items-center justify-center relative border transition-all",
                                isToday ? "border-amber-500/50 bg-amber-500/5" : "border-slate-800/50 bg-slate-950",
                                status === 'present' && "bg-emerald-500/10 border-emerald-500/30",
                                status === 'absent' && "bg-red-500/10 border-red-500/30",
                                status === 'late' && "bg-amber-500/10 border-amber-500/30",
                                status === 'excused' && "bg-blue-500/10 border-blue-500/30"
                            )}
                        >
                            <span className={cn(
                                "text-sm",
                                isToday ? "text-amber-500 font-bold" : "text-slate-400"
                            )}>
                                {format(date, "d")}
                            </span>

                            {status === 'present' && <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-emerald-500 mt-1" />}
                            {status === 'absent' && <XCircle className="h-3 w-3 md:h-4 md:w-4 text-red-500 mt-1" />}
                            {status === 'late' && <Clock className="h-3 w-3 md:h-4 md:w-4 text-amber-500 mt-1" />}
                            {status === 'excused' && <span className="text-[10px] text-blue-400 mt-1 font-medium">EXC</span>}
                        </div>
                    )
                })}
            </div>

            <div className="mt-6 flex flex-wrap gap-4 justify-center text-xs text-slate-400">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Present
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" /> Late
                </div>
                <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" /> Absent
                </div>
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-blue-500/20 border border-blue-500 text-blue-500 flex items-center justify-center text-[8px]">E</span> Excused
                </div>
            </div>
        </div>
    )
}
