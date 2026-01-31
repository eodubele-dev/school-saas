"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Save, Check, X, Clock, HelpCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

import {
    getClassAttendance,
    markBulkAttendance,
    getClassStudents,
    type AttendanceStatus
} from "@/lib/actions/attendance"

interface AttendanceRegisterProps {
    classes: { id: string; name: string }[]
}

interface Student {
    id: string
    name: string
    photo_url?: string
    status: AttendanceStatus
    smsSent?: boolean
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

    // Fetch data when class or date changes
    const fetchAttendanceData = useCallback(async () => {
        if (!selectedClassId) return

        setLoading(true)
        try {
            // 1. Get existing attendance
            const attendanceResult = await getClassAttendance(selectedClassId, selectedDate)

            if (!attendanceResult.success) {
                toast.error("Failed to load attendance")
                setLoading(false)
                return
            }

            // 2. Get class roster (if not all students are marked or first load)
            const studentsResult = await getClassStudents(selectedClassId)

            if (!studentsResult.success || !studentsResult.data) {
                toast.error("Failed to load students")
                setLoading(false)
                return
            }

            // 3. Merge data
            // Create a map of existing attendance
            const attendanceMap = new Map()
            attendanceResult.data?.forEach(record => {
                attendanceMap.set(record.student_id, {
                    status: record.status,
                    smsSent: record.sms_sent
                })
            })

            // Build student list
            const studentList: Student[] = studentsResult.data.map(s => {
                const existing = attendanceMap.get(s.id)
                return {
                    id: s.id,
                    name: s.full_name,
                    photo_url: s.photo_url,
                    status: existing ? existing.status : 'present', // Default to present
                    smsSent: existing ? existing.smsSent : false
                }
            })

            setStudents(studentList)
            calculateStats(studentList)

        } catch (error) {
            console.error(error)
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }, [selectedClassId, selectedDate])

    useEffect(() => {
        fetchAttendanceData()
    }, [fetchAttendanceData])

    // Calculate daily stats
    const calculateStats = (list: Student[]) => {
        const newStats = { present: 0, absent: 0, late: 0, excused: 0 }
        list.forEach(s => {
            newStats[s.status]++
        })
        setStats(newStats)
    }

    // Handle status toggle
    const toggleStatus = (studentId: string) => {
        setStudents(current => {
            const updated = current.map(s => {
                if (s.id === studentId) {
                    const statuses: AttendanceStatus[] = ['present', 'absent', 'late', 'excused']
                    const currentIndex = statuses.indexOf(s.status)
                    const nextStatus = statuses[(currentIndex + 1) % statuses.length]
                    return { ...s, status: nextStatus }
                }
                return s
            })
            calculateStats(updated)
            return updated
        })
    }



    // Mark all present
    const markAllPresent = () => {
        setStudents(current => {
            const updated = current.map(s => ({ ...s, status: 'present' as AttendanceStatus }))
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
                    <div className="p-8 text-center text-slate-500">Loading students...</div>
                ) : (
                    students.map(student => (
                        <Card key={student.id} className="overflow-hidden">
                            <CardContent className="p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={student.photo_url} />
                                        <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium text-slate-900">{student.name}</div>
                                        {student.smsSent && (
                                            <div className="text-xs text-green-600 flex items-center gap-1">
                                                <Check className="h-3 w-3" /> SMS Sent
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Status Toggle */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleStatus(student.id)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${getStatusColor(student.status)}`}
                                    >
                                        {getStatusIcon(student.status)}
                                        <span className="capitalize">{student.status}</span>
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Sticky Save Button (Mobile Friendly) */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 md:static md:bg-transparent md:border-0 md:p-0 z-10">
                <Button
                    className="w-full flex gap-2 items-center justify-center text-lg h-12 shadow-lg"
                    size="lg"
                    onClick={saveAttendance}
                    disabled={loading || saving || students.length === 0}
                >
                    {saving ? "Saving..." : "Save Attendance"}
                    {!saving && <Save className="h-5 w-5" />}
                </Button>
            </div>

            {/* Height spacer for mobile sticky button */}
            <div className="h-20 md:hidden"></div>
        </div>
    )
}
