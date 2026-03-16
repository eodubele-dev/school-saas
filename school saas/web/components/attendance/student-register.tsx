"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, Save, ChevronDown, Check, X, HelpCircle, WifiOff } from "lucide-react"
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

export function StudentRegister() {
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
        <Card className="flex flex-col h-[600px] bg-card text-card-foreground border-border/50 overflow-hidden">
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-slate-950/30">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-foreground text-lg">{classInfo.name} Register</h3>
                        {!isOnline && (
                            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1 px-1.5 py-0">
                                <WifiOff className="h-3 w-3" /> Offline
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(new Date())}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
                        {absentCount} Absent
                    </Badge>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        {students.length - absentCount} Present
                    </Badge>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="divide-y divide-white/5">
                    {students.map((student) => {
                        const status = attendance[student.id]?.status || 'present'
                        return (
                            <div key={student.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border border-border">
                                        <AvatarImage src={student.photo_url} />
                                        <AvatarFallback className="bg-slate-800 text-muted-foreground text-xs">
                                            {student.first_name[0]}{student.last_name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold text-sm text-slate-200">{student.first_name} {student.last_name}</p>
                                        <p className="text-xs text-muted-foreground">{student.admission_number}</p>
                                    </div>
                                </div>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            disabled={savingStatus[student.id]}
                                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all w-28 border flex items-center justify-center gap-2 ${
                                                status === 'present' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' :
                                                status === 'absent' ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' :
                                                'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                                            }`}
                                        >
                                            {savingStatus[student.id] ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <>
                                                    {status === 'present' && <Check className="h-3 w-3" />}
                                                    {status === 'absent' && <X className="h-3 w-3" />}
                                                    {status === 'excused' && <HelpCircle className="h-3 w-3" />}
                                                    {status.toUpperCase()}
                                                    <ChevronDown className="h-3 w-3 opacity-50" />
                                                </>
                                            )}
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
                                        <DropdownMenuItem className="focus:bg-emerald-500/10 focus:text-emerald-400 gap-2 cursor-pointer" onClick={() => setStatus(student.id, 'present')}>
                                            <Check className="h-4 w-4" /> Present
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="focus:bg-red-500/10 focus:text-red-400 gap-2 cursor-pointer" onClick={() => setStatus(student.id, 'absent')}>
                                            <X className="h-4 w-4" /> Absent
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="focus:bg-amber-500/10 focus:text-amber-400 gap-2 cursor-pointer" onClick={() => setStatus(student.id, 'excused')}>
                                            <HelpCircle className="h-4 w-4" /> Excused
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {status === 'present' && (
                                    attendance[student.id]?.clockOutTime ? (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="ml-2 h-8 bg-emerald-500/10 border-emerald-500/20 text-emerald-400 cursor-not-allowed opacity-80"
                                            disabled
                                        >
                                            CLOCKED OUT
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="ml-2 h-8 bg-slate-800 border-border text-slate-300 hover:bg-slate-700 hover:text-foreground"
                                            onClick={async (e) => {
                                                e.stopPropagation() // Prevent row click if any
                                                const promise = clockOutStudent(student.id, getLocalToday(), classInfo!.id)
                                                toast.promise(promise, {
                                                    loading: 'Clocking out...',
                                                    success: () => {
                                                        // Update local state to show as clocked out instantly
                                                        setAttendance(prev => ({
                                                            ...prev,
                                                            [student.id]: { ...prev[student.id], clockOutTime: new Date().toISOString() }
                                                        }))
                                                        router.refresh() // Sync stats/history
                                                        return 'Student clocked out!'
                                                    },
                                                    error: 'Failed to clock out'
                                                })
                                            }}
                                        >
                                            CHECK OUT
                                        </Button>
                                    )
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="p-4 bg-slate-950/50 border-t border-border/50">
                <Button
                    className="w-full bg-[var(--school-primary,#06b6d4)] hover:opacity-90 text-white font-bold gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleNotifications}
                    disabled={submitting || absentCount === 0 || notNotifiedCount === 0}
                >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {absentCount === 0 ? "No Absentees" : 
                     notNotifiedCount > 0 ? `Notify ${notNotifiedCount === 1 ? 'Parent' : 'Parents'} (${notNotifiedCount} New)` : 
                     absentCount === 1 ? "Parent Notified" : "All Parents Notified"}
                </Button>
            </div>
        </Card>
    )
}
