"use client"

import { useState, useEffect } from "react"
import { formatDate } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, Save } from "lucide-react"
import { toast } from "sonner"
import { getAssignedClass, getClassStudents, markStudentAttendance, sendAbsenceSMS, clockOutStudent, getClassAttendance, StudentAttendanceDTO } from "@/lib/actions/student-attendance"
import { getClockInStatus } from "@/lib/actions/staff-clock-in"

export function StudentRegister() {
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [classInfo, setClassInfo] = useState<{ id: string, name: string } | null>(null)
    const [students, setStudents] = useState<any[]>([])
    const [attendance, setAttendance] = useState<Record<string, { status: 'present' | 'absent' | 'excused', remarks?: string, clockOutTime?: string }>>({})
    const [isVerified, setIsVerified] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            // 0. Check Clock-In Status first
            const statusRes = await getClockInStatus()
            if (!statusRes.success || !statusRes.data?.clockedIn) {
                setIsVerified(false)
                setLoading(false)
                return
            }
            setIsVerified(true)

            // 1. Get Assigned Class
            const classRes = await getAssignedClass()
            if (!classRes.success || !classRes.data) {
                // If no class, stop here (UI will show empty state)
                setLoading(false)
                return
            }

            setClassInfo(classRes.data)

            // 2. Get Students
            const studentsRes = await getClassStudents(classRes.data.id)
            if (studentsRes.success && studentsRes.data) {
                setStudents(studentsRes.data)

                // 3. Get Existing Attendance for Today
                const today = new Date().toISOString().split('T')[0]
                const attendanceRes = await getClassAttendance(classRes.data.id, today)

                const existingMap: any = {}
                if (attendanceRes.success && attendanceRes.data) {
                    attendanceRes.data.forEach((r: any) => {
                        existingMap[r.student_id] = {
                            status: r.status,
                            clockOutTime: r.clock_out_time
                        }
                    })
                }

                // Initialize state (merge existing with default present)
                const initial: any = {}
                studentsRes.data.forEach((s: any) => {
                    const existing = existingMap[s.id]
                    initial[s.id] = {
                        status: existing?.status || 'present',
                        clockOutTime: existing?.clockOutTime // Keep track of clock out
                    }
                })
                setAttendance(initial)
            }
        } catch (error) {
            toast.error("Failed to load class data")
        } finally {
            setLoading(false)
        }
    }

    const toggleStatus = (studentId: string) => {
        setAttendance(prev => {
            const current = prev[studentId]?.status || 'present'
            const next = current === 'present' ? 'absent' : current === 'absent' ? 'excused' : 'present'
            return {
                ...prev,
                [studentId]: { ...prev[studentId], status: next }
            }
        })
    }

    const handleSubmit = async () => {
        if (!classInfo) return

        setSubmitting(true)
        try {
            const records: StudentAttendanceDTO[] = Object.entries(attendance).map(([studentId, data]) => ({
                student_id: studentId,
                status: data.status,
                remarks: data.remarks
            }))

            // 1. Save to DB
            const saveRes = await markStudentAttendance(classInfo.id, new Date().toISOString().split('T')[0], records)
            if (!saveRes.success) throw new Error(saveRes.error)

            // 2. Send SMS if needed
            const absentIds = records.filter(r => r.status === 'absent').map(r => r.student_id)
            if (absentIds.length > 0) {
                await sendAbsenceSMS(absentIds)
                toast.success(`Saved & Sent SMS to ${absentIds.length} parents`)
            } else {
                toast.success("Attendance saved successfully")
            }

        } catch (error) {
            toast.error("Failed to submit attendance")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return <div className="h-64 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-500" /></div>
    }

    if (!isVerified) {
        return (
            <Card className="p-8 text-center bg-slate-900 border-white/5 flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-pulse" />
                </div>
                <div>
                    <h3 className="text-white font-bold">Session Locked</h3>
                    <p className="text-slate-400 text-sm mt-1">You must Clock In to access the Class Register.</p>
                </div>
            </Card>
        )
    }

    if (!classInfo) {
        return (
            <Card className="p-8 text-center bg-slate-900 border-white/5">
                <p className="text-slate-400">No class assigned to you found.</p>
            </Card>
        )
    }

    const absentCount = Object.values(attendance).filter(a => a.status === 'absent').length

    return (
        <Card className="flex flex-col h-[600px] bg-slate-900 border-white/5 overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-950/30">
                <div>
                    <h3 className="font-bold text-white text-lg">{classInfo.name} Register</h3>
                    <p className="text-xs text-slate-500">{formatDate(new Date())}</p>
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
                                    <Avatar className="h-10 w-10 border border-white/10">
                                        <AvatarImage src={student.photo_url} />
                                        <AvatarFallback className="bg-slate-800 text-slate-400 text-xs">
                                            {student.first_name[0]}{student.last_name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold text-sm text-slate-200">{student.first_name} {student.last_name}</p>
                                        <p className="text-xs text-slate-500">{student.admission_number}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => toggleStatus(student.id)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all w-24 border ${status === 'present' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' :
                                        status === 'absent' ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' :
                                            'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
                                        }`}
                                >
                                    {status.toUpperCase()}
                                </button>

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
                                            className="ml-2 h-8 bg-slate-800 border-white/10 text-slate-300 hover:bg-slate-700 hover:text-white"
                                            onClick={async (e) => {
                                                e.stopPropagation() // Prevent row click if any
                                                const promise = clockOutStudent(student.id, new Date().toISOString().split('T')[0], classInfo!.id)
                                                toast.promise(promise, {
                                                    loading: 'Clocking out...',
                                                    success: () => {
                                                        // Update local state to show as clocked out instantly
                                                        setAttendance(prev => ({
                                                            ...prev,
                                                            [student.id]: { ...prev[student.id], clockOutTime: new Date().toISOString() }
                                                        }))
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

            <div className="p-4 bg-slate-950/50 border-t border-white/5">
                <Button
                    className="w-full bg-[hsl(var(--school-accent))] hover:opacity-90 font-bold gap-2"
                    onClick={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> :
                        absentCount > 0 ? <Send className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                    {absentCount > 0 ? "Submit & Notify Parents" : "Submit Register"}
                </Button>
            </div>
        </Card>
    )
}
