import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Check, X, Clock, HelpCircle, Save, Send } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import {
    getClassAttendance,
    markBulkAttendance,
    getClassStudents,
    clockOutStudent,
    sendAbsenceSMS,
    type AttendanceStatus
} from "@/lib/actions/student-attendance"

interface AttendanceRegisterProps {
    classes: { id: string; name: string }[]
}

interface Student {
    id: string
    name: string
    photo_url?: string
    status: AttendanceStatus
    smsSent?: boolean
    clockOutTime?: string | null
}

export function AttendanceRegister({ classes }: AttendanceRegisterProps) {
    const router = useRouter()

    // State
    const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || "")
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [students, setStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, excused: 0 })
    const [savingStatus, setSavingStatus] = useState<Record<string, boolean>>({}) // Track per-student saving

    // Polling for real-time updates
    useEffect(() => {
        const interval = setInterval(() => fetchAttendanceData(true), 10000)
        return () => clearInterval(interval)
    }, [fetchAttendanceData])

    // Fetch data when class or date changes
    const fetchAttendanceData = useCallback(async (isBackground = false) => {
        if (!selectedClassId) return

        if (!isBackground) setLoading(true)
        try {
            // 1. Get existing attendance
            const attendanceResult = await getClassAttendance(selectedClassId, selectedDate)

            if (!attendanceResult.success) {
                toast.error("Failed to load attendance")
                if (!isBackground) setLoading(false)
                return
            }

            // 2. Get class roster (if not all students are marked or first load)
            const studentsResult = await getClassStudents(selectedClassId)

            if (!studentsResult.success || !studentsResult.data) {
                toast.error("Failed to load students")
                if (!isBackground) setLoading(false)
                return
            }

            // 3. Merge data
            // Create a map of existing attendance
            const attendanceMap = new Map()
            attendanceResult.data?.forEach(record => {
                attendanceMap.set(record.student_id, {
                    status: record.status,
                    smsSent: record.sms_sent,
                    clockOutTime: record.clock_out_time
                })
            })

            // Build student list
            const studentList: Student[] = studentsResult.data.map(s => {
                const existing = attendanceMap.get(s.id)
                
                // CRITICAL: Don't overwrite students currently being saved by the user
                if (savingStatus[s.id]) return null;

                return {
                    id: s.id,
                    name: s.full_name,
                    photo_url: s.photo_url,
                    status: existing ? existing.status : 'present', // Default to present
                    smsSent: existing ? existing.smsSent : false,
                    clockOutTime: existing ? existing.clockOutTime : null
                }
            }).filter(Boolean) as Student[]

            setStudents(studentList)
            calculateStats(studentList)

        } catch (error) {
            console.error(error)
            toast.error("An error occurred")
        } finally {
            if (!isBackground) setLoading(false)
        }
    }, [selectedClassId, selectedDate])

    useEffect(() => {
        fetchAttendanceData()
    }, [fetchAttendanceData])

    // Calculate daily stats
    const calculateStats = (list: Student[]) => {
        const newStats = { present: 0, absent: 0, late: 0, excused: 0 }
        list.forEach(s => {
            if (s.status in newStats) {
                newStats[s.status as keyof typeof newStats]++
            }
        })
        setStats(newStats)
    }

    const setStatus = async (studentId: string, nextStatus: AttendanceStatus) => {
        const currentStudent = students.find(s => s.id === studentId)
        if (!currentStudent || currentStudent.status === nextStatus) return

        // 1. Optimistic Update
        const oldStatus = currentStudent.status
        setSavingStatus(prev => ({ ...prev, [studentId]: true }))
        setStudents(current => {
            const updated = current.map(s => {
                if (s.id === studentId) {
                    return { ...s, status: nextStatus }
                }
                return s
            })
            calculateStats(updated)
            return updated
        })

        try {
            // 2. Immediate Persistence (optional for bulk register, but helps real-time)
            await markBulkAttendance([{
                studentId: studentId,
                classId: selectedClassId,
                status: nextStatus
            }], selectedDate)
            
            router.refresh()
        } catch (error) {
            // Rollback
            setStudents(current => {
                const updated = current.map(s => {
                    if (s.id === studentId) {
                        return { ...s, status: oldStatus }
                    }
                    return s
                })
                calculateStats(updated)
                return updated
            })
            toast.error("Failed to sync change")
        } finally {
            setSavingStatus(prev => ({ ...prev, [studentId]: false }))
        }
    }



    // Mark all present
    const markAllPresent = () => {
        setStudents(current => {
            const updated = current.map(s => ({ ...s, status: 'present' as AttendanceStatus, smsSent: false }))
            calculateStats(updated)
            return updated
        })
        toast.success("Marked all as present")
    }

    // Save changes
    const saveAttendance = async () => {
        setSaving(true)
        try {
            const payload = students.map(s => ({
                studentId: s.id,
                classId: selectedClassId,
                status: s.status
            }))

            const result = await markBulkAttendance(payload, selectedDate)

            if (result.success) {
                toast.success(`Attendance saved! SMS sent to ${result.marked} parents.`)
                router.refresh()
            } else {
                toast.error(`Saved with errors. Failed: ${result.failed}`)
            }
        } catch {
            toast.error("Failed to save attendance")
        } finally {
            setSaving(false)
        }
    }

    // Helper for status badge color
    const getStatusColor = (status: AttendanceStatus) => {
        switch (status) {
            case 'present': return 'bg-green-100 text-green-700 hover:bg-green-200'
            case 'absent': return 'bg-red-100 text-red-700 hover:bg-red-200'
            case 'late': return 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            case 'excused': return 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            default: return 'bg-slate-100 text-slate-700'
        }
    }

    // Helper for status icon
    const getStatusIcon = (status: AttendanceStatus) => {
        switch (status) {
            case 'present': return <Check className="h-4 w-4" />
            case 'absent': return <X className="h-4 w-4" />
            case 'late': return <Clock className="h-4 w-4" />
            case 'excused': return <HelpCircle className="h-4 w-4" />
        }
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Header Controls */}
            <Card>
                <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Class</Label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                value={selectedClassId}
                                onChange={(e) => setSelectedClassId(e.target.value)}
                            >
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="flex justify-between items-center text-sm pt-2 border-t">
                        <span className="text-green-600 font-medium">Present: {stats.present}</span>
                        <span className="text-red-600 font-medium">Absent: {stats.absent}</span>
                        <span className="text-orange-600 font-medium">Late: {stats.late}</span>
                        <span className="text-blue-600 font-medium">Excused: {stats.excused}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Student List */}
            <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                    <h3 className="font-semibold text-lg text-slate-800">
                        Students ({students.length})
                    </h3>
                    <Button variant="ghost" size="sm" onClick={markAllPresent}>
                        Mark All Present
                    </Button>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading students...</div>
                ) : (
                    students.map(student => (
                        <Card 
                            key={student.id} 
                            className="bg-[#0B0F1A] border-slate-800/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group"
                        >
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12 border-2 border-slate-800 group-hover:border-blue-500/30 transition-colors">
                                        <AvatarImage src={student.photo_url} className="object-cover" />
                                        <AvatarFallback className="bg-slate-900 text-slate-400 font-bold">
                                            {student.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-bold text-lg text-white tracking-tight">{student.name}</div>
                                        {student.smsSent ? (
                                            <div className="text-[10px] text-emerald-400/80 flex items-center gap-1 font-black uppercase tracking-widest mt-0.5">
                                                <div className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                                                Notified
                                            </div>
                                        ) : student.status === 'absent' ? (
                                            <div className="text-[10px] text-rose-400/60 flex items-center gap-1 font-bold uppercase tracking-widest mt-0.5">
                                                <div className="h-1 w-1 rounded-full bg-rose-400" />
                                                Pending Alert
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Direct Status Actions (Mockup Style) */}
                                    <div className="flex gap-2 p-1.5 bg-slate-950/50 rounded-full border border-slate-800/50">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={() => setStatus(student.id, 'present')}
                                                        className={`h-10 w-10 flex items-center justify-center rounded-full transition-all duration-300 ${
                                                            student.status === 'present' 
                                                            ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50 scale-110' 
                                                            : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'
                                                        }`}
                                                    >
                                                        <Check className="h-5 w-5" />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-slate-900 border-slate-800">Present</TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={() => setStatus(student.id, 'absent')}
                                                        className={`h-10 w-10 flex items-center justify-center rounded-full transition-all duration-300 ${
                                                            student.status === 'absent' 
                                                            ? 'bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/50 scale-110' 
                                                            : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'
                                                        }`}
                                                    >
                                                        <X className="h-5 w-5" />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-slate-900 border-slate-800">Absent</TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <button
                                                        onClick={() => setStatus(student.id, 'late')}
                                                        className={`h-10 w-10 flex items-center justify-center rounded-full transition-all duration-300 ${
                                                            student.status === 'late' 
                                                            ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/50 scale-110' 
                                                            : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'
                                                        }`}
                                                    >
                                                        <Clock className="h-5 w-5" />
                                                    </button>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-slate-900 border-slate-800">Late</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>

                                    {student.status === 'present' && student.clockOutTime && (
                                        <Badge variant="outline" className="h-10 px-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-black tracking-widest uppercase rounded-xl">
                                            Checked Out
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Sticky Action Footer (Mobile Friendly) */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900 border-t border-slate-700 md:static md:bg-transparent md:border-0 md:p-0 z-10 space-y-3">
                <Button
                    className="w-full flex gap-2 items-center justify-center text-lg h-12 shadow-lg bg-[var(--school-primary,#06b6d4)] hover:opacity-90 text-white border-0"
                    size="lg"
                    onClick={saveAttendance}
                    disabled={loading || saving || students.length === 0}
                >
                    {saving && !students.some(s => s.status === 'absent' && !s.smsSent) ? "Saving..." : "Save Attendance"}
                    {!saving && <Save className="h-5 w-5" />}
                </Button>

                {/* Notify Parents Button Consistent with Individual View */}
                {students.some(s => s.status === 'absent') && (
                    <Button
                        className="w-full h-11 bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white font-bold gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleNotifications}
                        disabled={loading || saving || !students.some(s => s.status === 'absent' && !s.smsSent)}
                    >
                        <Send className="h-4 w-4" />
                        {students.filter(s => s.status === 'absent' && !s.smsSent).length > 0 ? (
                            `Notify ${students.filter(s => s.status === 'absent' && !s.smsSent).length === 1 ? 'Parent' : 'Parents'} (${students.filter(s => s.status === 'absent' && !s.smsSent).length} New)`
                        ) : (
                            students.filter(s => s.status === 'absent').length === 1 ? "Parent Notified" : "All Parents Notified"
                        )}
                    </Button>
                )}
            </div>

            {/* Height spacer for mobile sticky button */}
            <div className="h-20 md:hidden"></div>
        </div>
    )
}
