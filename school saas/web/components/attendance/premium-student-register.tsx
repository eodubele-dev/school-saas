"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, Save, ChevronDown, Check, X, HelpCircle, WifiOff, Clock } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import { useOfflineSync } from "@/components/providers/offline-sync-provider"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getAssignedClass, getClassStudents, markStudentAttendance, sendAbsenceSMS, clockOutStudent, getClassAttendance, StudentAttendanceDTO } from "@/lib/actions/student-attendance"
import { getClockInStatus } from "@/lib/actions/staff-clock-in"

export function PremiumStudentRegister() {
    const { queueAction, isOnline } = useOfflineSync()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [classInfo, setClassInfo] = useState<{ id: string, name: string } | null>(null)
    const [students, setStudents] = useState<any[]>([])
    const [attendance, setAttendance] = useState<Record<string, { status: 'present' | 'absent' | 'excused', remarks?: string, clockOutTime?: string, smsSent?: boolean }>>({})
    const [savingStatus, setSavingStatus] = useState<Record<string, boolean>>({}) // Track per-student saving
    const [isVerified, setIsVerified] = useState(false)

    // Helper for local date YYYY-MM-DD
    const getLocalToday = () => {
        const d = new Date()
        const pad = (n: number) => n < 10 ? '0' + n : n
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    }

    useEffect(() => {
        loadData()
        // Poll for updates (Realtime) - Only if online
        const interval = setInterval(() => {
            if (navigator.onLine) loadData(true)
        }, 10000)
        return () => clearInterval(interval)
    }, [isOnline])

    const loadData = async (isBackground = false) => {
        if (!isBackground) setLoading(true)
        try {
            // 0. Check Clock-In Status first
            const statusRes = await getClockInStatus(getLocalToday())
            if (!statusRes.success || !statusRes.data?.clockedIn) {
                setIsVerified(false)
                if (!isBackground) setLoading(false)
                return
            }
            setIsVerified(true)

            // 1. Get Assigned Class
            const classRes = await getAssignedClass()
            if (!classRes.success || !classRes.data) {
                // If no class, stop here (UI will show empty state)
                if (!isBackground) setLoading(false)
                return
            }

            setClassInfo(classRes.data)

            // 2. Get Students
            const studentsRes = await getClassStudents(classRes.data.id)
            if (studentsRes.success && studentsRes.data) {
                setStudents(studentsRes.data)

                // 3. Get Existing Attendance for Today
                const today = getLocalToday()
                const attendanceRes = await getClassAttendance(classRes.data.id, today)

                const existingMap: any = {}
                if (attendanceRes.success && attendanceRes.data) {
                    attendanceRes.data.forEach((r: any) => {
                        existingMap[r.student_id] = {
                            status: r.status,
                            clockOutTime: r.clock_out_time,
                            smsSent: r.sms_sent
                        }
                    })
                }

                // Initialize state (merge existing with default present)
                const initial: any = {}
                studentsRes.data.forEach((s: any) => {
                    const existing = existingMap[s.id]
                    
                    // CRITICAL: Don't overwrite students currently being saved by the user
                    if (savingStatus[s.id]) return 

                    initial[s.id] = {
                        status: existing?.status || 'present',
                        clockOutTime: existing?.clockOutTime, // Keep track of clock out
                        smsSent: existing?.smsSent || false
                    }
                })
                setAttendance(prev => ({ ...prev, ...initial }))
                // Cache students and class info for offline view
                localStorage.setItem(`offline-students-${classRes.data.id}`, JSON.stringify(studentsRes.data))
                localStorage.setItem('offline-class-info', JSON.stringify(classRes.data))
            }
        } catch (error) {
            if (navigator.onLine) {
                toast.error("Failed to load class data")
            } else {
                // Try to load from cache if offline
                const cachedClass = localStorage.getItem('offline-class-info')
                if (cachedClass) setClassInfo(JSON.parse(cachedClass))
            }
        } finally {
            if (!isBackground) setLoading(false)
        }
    }

    const setStatus = async (studentId: string, next: 'present' | 'absent' | 'excused') => {
        if (!classInfo) return
        
        const current = attendance[studentId]?.status || 'present'
        if (current === next) return
        
        // 1. Optimistic Update & Set Saving
        setSavingStatus(prev => ({ ...prev, [studentId]: true }))
        setAttendance(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], status: next }
        }))

        try {
            if (isOnline) {
                // 2. Immediate Persistence
                const res = await markStudentAttendance(classInfo.id, getLocalToday(), [
                    { student_id: studentId, status: next, remarks: attendance[studentId]?.remarks }
                ])

                if (!res.success) {
                    // Rollback on error
                    setAttendance(prev => ({
                        ...prev,
                        [studentId]: { ...prev[studentId], status: current }
                    }))
                    toast.error(`Failed to save ${next} status`)
                } else {
                    router.refresh()
                }
            } else {
                // Offline Queuing
                queueAction({
                    type: 'STUDENT_ATTENDANCE',
                    payload: {
                        classId: classInfo.id,
                        date: getLocalToday(),
                        records: [{ student_id: studentId, status: next, remarks: attendance[studentId]?.remarks }]
                    }
                })
                toast.info("Saved locally. Will sync when online. 🤙🏾📦")
            }
        } catch (error) {
            // Rollback
            setAttendance(prev => ({
                ...prev,
                [studentId]: { ...prev[studentId], status: current }
            }))
            toast.error("Network error saving attendance")
        } finally {
            setSavingStatus(prev => ({ ...prev, [studentId]: false }))
        }
    }

    const handleNotifications = async () => {
        if (!classInfo) return

        setSubmitting(true)
        try {
            const records: StudentAttendanceDTO[] = Object.entries(attendance).map(([studentId, data]) => ({
                student_id: studentId,
                status: data.status,
                remarks: data.remarks
            }))

            // 2. Send SMS only for absentees who haven't been notified
            const absentIds = Object.entries(attendance)
                .filter(([_, data]) => data.status === 'absent' && !data.smsSent)
                .map(([id, _]) => id)

            if (absentIds.length > 0) {
                const res = await sendAbsenceSMS(absentIds)
                if (res.success) {
                    toast.success(`Sent absence ${res.count === 1 ? 'alert' : 'alerts'} to ${res.count} ${res.count === 1 ? 'parent' : 'parents'}`)
                    // Update local state to reflect SMS sent
                    setAttendance(prev => {
                        const next = { ...prev }
                        absentIds.forEach(id => {
                            if (next[id]) next[id] = { ...next[id], smsSent: true }
                        })
                        return next
                    })
                    router.refresh()
                } else {
                    toast.error("Failed to send some SMS alerts")
                }
            } else {
                toast.info("All absentees have already been notified.")
            }

        } catch (error) {
            toast.error("Failed to process notifications")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return <div className="h-64 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
    }

    if (!isVerified) {
        return (
            <Card className="p-8 text-center bg-card text-card-foreground border-border/50 flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-pulse" />
                </div>
                <div>
                    <h3 className="text-foreground font-bold">Session Locked</h3>
                    <p className="text-muted-foreground text-sm mt-1">You must Clock In to access the Class Register.</p>
                </div>
            </Card>
        )
    }

    if (!classInfo) {
        return (
            <Card className="p-8 text-center bg-card text-card-foreground border-border/50">
                <p className="text-muted-foreground">No class assigned to you found.</p>
            </Card>
        )
    }

    const absentCount = Object.values(attendance).filter(a => a.status === 'absent').length
    const notNotifiedCount = Object.values(attendance).filter(a => a.status === 'absent' && !a.smsSent).length

    return (
        <Card className="flex flex-col h-screen max-h-[650px] bg-card text-card-foreground border-border overflow-hidden rounded-3xl shadow-xl">
            <div className="p-4 sm:p-6 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/[0.01]">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-lg sm:text-xl tracking-tight">{classInfo.name} Register</h3>
                        {!isOnline && (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1 px-1.5 py-0 text-[10px]">
                                <WifiOff className="h-3 w-3" /> Offline
                            </Badge>
                        )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">{formatDate(new Date())}</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-none text-center sm:text-left px-3 py-1 rounded-full bg-rose-500/5 border border-rose-500/10">
                        <span className="text-[10px] font-bold text-rose-400">{absentCount} ABSENT</span>
                    </div>
                    <div className="flex-1 sm:flex-none text-center sm:text-left px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10">
                        <span className="text-[10px] font-bold text-emerald-400">{students.length - absentCount} PRESENT</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-1 sm:px-2">
                <div className="divide-y divide-white/[0.03]">
                    {students.map((student) => {
                        const status = attendance[student.id]?.status || 'present'
                        return (
                            <div key={student.id} className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-white/[0.02] transition-all duration-300 group rounded-2xl mx-1 sm:mx-2 my-1 gap-4">
                                <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
                                    <Avatar className="h-12 w-12 sm:h-14 sm:w-14 bg-slate-900/50 border border-white/5 shadow-inner shrink-0">
                                        <AvatarImage src={student.photo_url} className="object-cover" />
                                        <AvatarFallback className="bg-slate-900 text-slate-400 text-sm sm:text-lg font-medium">
                                            {student.first_name[0]}{student.last_name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-base sm:text-lg text-white tracking-tight leading-none mb-1.5 truncate">{student.first_name} {student.last_name}</p>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <p className="text-[10px] sm:text-[11px] text-slate-600 font-medium tracking-wider uppercase truncate">{student.admission_number}</p>
                                            {attendance[student.id]?.smsSent ? (
                                                <div className="text-[8px] sm:text-[9px] text-emerald-400/80 flex items-center gap-1 font-bold uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10">
                                                    <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                                                    Notified
                                                </div>
                                            ) : status === 'absent' ? (
                                                <div className="text-[8px] sm:text-[9px] text-rose-400/60 flex items-center gap-1 font-bold uppercase tracking-widest bg-rose-500/5 px-2 py-0.5 rounded-full border border-rose-500/10">
                                                    <div className="h-1 w-1 rounded-full bg-rose-400" />
                                                    Pending
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto mt-1 sm:mt-0 pt-3 sm:pt-0 border-t border-white/5 sm:border-none">
                                    <div className="flex gap-2 sm:gap-3 items-center">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        disabled={savingStatus[student.id]}
                                                        onClick={() => setStatus(student.id, 'present')}
                                                        className={`h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-full transition-all duration-500 border ${
                                                            status === 'present' 
                                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                                                            : 'bg-white/[0.03] border-white/[0.05] text-white/20 hover:text-white/40 hover:bg-white/[0.05]'
                                                        }`}
                                                    >
                                                        {savingStatus[student.id] && status === 'present' ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> : <Check className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />}
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-slate-900 border-slate-800 text-[10px] font-bold">PRESENT</TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        disabled={savingStatus[student.id]}
                                                        onClick={() => setStatus(student.id, 'absent')}
                                                        className={`h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-full transition-all duration-500 border ${
                                                            status === 'absent' 
                                                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.1)]' 
                                                            : 'bg-white/[0.03] border-white/[0.05] text-white/20 hover:text-white/40 hover:bg-white/[0.05]'
                                                        }`}
                                                    >
                                                        {savingStatus[student.id] && status === 'absent' ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> : <X className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />}
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-slate-900 border-slate-800 text-[10px] font-bold">ABSENT</TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        disabled={savingStatus[student.id]}
                                                        onClick={() => setStatus(student.id, 'excused')}
                                                        className={`h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-full transition-all duration-500 border ${
                                                            status === 'excused' 
                                                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.1)]' 
                                                            : 'bg-white/[0.03] border-white/[0.05] text-white/20 hover:text-white/40 hover:bg-white/[0.05]'
                                                        }`}
                                                    >
                                                        {savingStatus[student.id] && status === 'excused' ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> : <Clock className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />}
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-slate-900 border-slate-800 text-[10px] font-bold">LATE / EXCUSED</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>

                                    <div className="w-14 sm:w-16 flex justify-end">
                                        {status === 'present' && (
                                            attendance[student.id]?.clockOutTime ? (
                                                <div className="h-8 sm:h-9 px-2 sm:px-3 flex items-center justify-center bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 text-[8px] sm:text-[9px] font-black tracking-widest uppercase rounded-full">
                                                    OUT
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 sm:h-9 rounded-full bg-white/[0.02] border-white/5 text-[8px] sm:text-[9px] font-black tracking-widest hover:bg-white/[0.05] text-slate-500 hover:text-slate-300 transition-all uppercase px-2 sm:px-3"
                                                    onClick={async (e) => {
                                                        e.stopPropagation()
                                                        const promise = clockOutStudent(student.id, getLocalToday(), classInfo!.id)
                                                        toast.promise(promise, {
                                                            loading: '...',
                                                            success: () => {
                                                                setAttendance(prev => ({
                                                                    ...prev,
                                                                    [student.id]: { ...prev[student.id], clockOutTime: new Date().toISOString() }
                                                                }))
                                                                router.refresh()
                                                                return 'Clocked Out'
                                                            },
                                                            error: 'Error'
                                                        })
                                                    }}
                                                >
                                                    OUT
                                                </Button>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="p-4 sm:p-6 bg-white/[0.01] border-t border-white/5">
                <Button
                    className="w-full h-11 sm:h-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-[0_0_30px_rgba(37,99,235,0.2)] active:scale-95 border-none text-sm"
                    onClick={handleNotifications}
                    disabled={submitting || absentCount === 0 || notNotifiedCount === 0}
                >
                    {submitting ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> : <Send className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />}
                    {absentCount === 0 ? "No Absentees" : 
                     notNotifiedCount > 0 ? `Notify ${notNotifiedCount === 1 ? 'Parent' : 'Parents'} (${notNotifiedCount} New)` : 
                     "All Parents Notified"}
                </Button>
            </div>
        </Card>
    )
}
