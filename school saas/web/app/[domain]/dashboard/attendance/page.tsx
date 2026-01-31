/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getClassStudents, markAttendanceWithGeofence } from "@/lib/actions/attendance-geofence"
import { toast } from "sonner"
import { MapPin, UserCheck, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react"

export default function AttendancePage() {
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [students, setStudents] = useState<any[]>([])
    const [selectedClass, setSelectedClass] = useState("")
    const [attendanceMap, setAttendanceMap] = useState<Record<string, 'present' | 'absent' | 'late'>>({})
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null)
    const [locError, setLocError] = useState<string | null>(null)

    // 1. Get GPS on Mount
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocError("Geolocation is not supported by your browser.")
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                })
            },
            (error) => {
                setLocError("Unable to retrieve location. Please enable GPS.")
                console.error(error)
            }
        )
    }, [])

    // 2. Fetch Students when Class Selected
    const handleClassChange = async (value: string) => {
        setSelectedClass(value)
        setLoading(true)
        try {
            const list = await getClassStudents(new Date(), value)
            setStudents(list)

            // Initialize all as Present
            const initialMap: any = {}
            list.forEach((s: any) => initialMap[s.id] = 'present')
            setAttendanceMap(initialMap)
        } catch (e) {
            toast.error("Failed to load students")
        } finally {
            setLoading(false)
        }
    }

    const toggleStatus = (studentId: string) => {
        setAttendanceMap(prev => {
            const current = prev[studentId]
            const next = current === 'present' ? 'absent' : current === 'absent' ? 'late' : 'present'
            return { ...prev, [studentId]: next }
        })
    }

    const handleSubmit = async () => {
        if (!location) {
            toast.error("Waiting for GPS location...")
            return
        }

        setSubmitting(true)

        // Prepare payload
        const studentPayload = Object.entries(attendanceMap).map(([id, status]) => ({
            studentId: id,
            status: status
        }))

        try {
            const result = await markAttendanceWithGeofence(
                "class_id_placeholder_needs_real_id", // In real app, would get ID from Select
                new Date(),
                location,
                studentPayload
            )

            if (result.success) {
                toast.success(result.message)
            } else {
                toast.error(result.error)
            }
        } catch (e) {
            toast.error("An unexpected error occurred")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">One-Tap Register</h2>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        {location ? (
                            <span className="text-green-600 flex items-center text-xs bg-green-50 px-2 py-1 rounded-full">
                                <MapPin className="h-3 w-3 mr-1" /> GPS Active
                            </span>
                        ) : (
                            <span className="text-red-500 flex items-center text-xs bg-red-50 px-2 py-1 rounded-full">
                                <AlertTriangle className="h-3 w-3 mr-1" /> {locError || "Locating..."}
                            </span>
                        )}
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Mark Attendance</CardTitle>
                    <CardDescription>Select a class to begin.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Select onValueChange={handleClassChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="JSS 1">JSS 1</SelectItem>
                            <SelectItem value="JSS 2">JSS 2</SelectItem>
                            <SelectItem value="SS 1">SS 1</SelectItem>
                        </SelectContent>
                    </Select>

                    {loading && <div className="flex justify-center py-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}

                    {!loading && students.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center pb-2 border-b">
                                <span className="text-sm font-medium text-muted-foreground">{students.length} Students</span>
                                <span className="text-xs text-muted-foreground">Tap to toggle status</span>
                            </div>

                            <div className="grid gap-2">
                                {students.map((student) => {
                                    const status = attendanceMap[student.id]
                                    return (
                                        <div
                                            key={student.id}
                                            onClick={() => toggleStatus(student.id)}
                                            className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-slate-50 transition-colors select-none"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{student.full_name.substring(0, 2)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{student.full_name}</span>
                                            </div>

                                            <BadgeStatus status={status} />
                                        </div>
                                    )
                                })}
                            </div>

                            <Button
                                className="w-full mt-6 gap-2"
                                size="lg"
                                onClick={handleSubmit}
                                disabled={submitting || !location}
                            >
                                {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                Submit Register
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

function BadgeStatus({ status }: { status: string }) {
    if (status === 'present') {
        return <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wide flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Present</div>
    }
    if (status === 'late') {
        return <div className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wide">Late</div>
    }
    return <div className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wide">Absent</div>
}
