"use client"

import { useState, useEffect } from "react"
import { formatDate } from "@/lib/utils"
import { MapPin, Clock, Navigation, CheckCircle, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

import {
    clockInStaff,
    clockOutStaff,
    getClockInStatus,
    getStaffAttendanceHistory
} from "@/lib/actions/staff-clock-in"
import { getCurrentPosition } from "@/lib/utils/geolocation"

interface ClockInStatus {
    clockedIn: boolean
    clockInTime: string | null
    clockOutTime: string | null
    distance: number | null
    verified: boolean
}

interface HistoryRecord {
    date: string
    status: string
    checkInTime: string | null
    checkOutTime: string | null
    distance: number | null
    verified: boolean
}

export function StaffClockIn() {
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [status, setStatus] = useState<ClockInStatus | null>(null)
    const [history, setHistory] = useState<HistoryRecord[]>([])
    const [locationError, setLocationError] = useState<string | null>(null)

    // Load initial status
    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const [statusRes, historyRes] = await Promise.all([
                getClockInStatus(),
                getStaffAttendanceHistory()
            ])

            if (statusRes.success && statusRes.data) {
                setStatus(statusRes.data)
            }

            if (historyRes.success && historyRes.data) {
                // Ensure the data matches the interface
                const cleanHistory = historyRes.data.map(item => ({
                    date: item.date,
                    status: item.status,
                    checkInTime: item.checkInTime,
                    checkOutTime: item.checkOutTime,
                    distance: item.distance,
                    verified: item.verified
                }))
                setHistory(cleanHistory)
            }
        } catch {
            toast.error("Failed to load clock-in data")
        } finally {
            setLoading(false)
        }
    }

    const handleClockIn = async () => {
        setActionLoading(true)
        setLocationError(null)

        try {
            // 1. Get Location
            toast.info("Requesting location access...")
            const position = await getCurrentPosition()
            const { latitude, longitude } = position.coords

            // 2. Submit Clock In
            toast.loading("Verifying location...", { id: "clock-in" })
            const result = await clockInStaff(latitude, longitude)

            if (result.success) {
                toast.success("Successfully clocked in!", { id: "clock-in" })
                loadData() // Refresh
            } else {
                toast.error(result.error || "Failed to clock in", { id: "clock-in" })
                if (result.error?.includes("radius") || result.error?.includes("away")) {
                    setLocationError(result.error)
                    if (result.debug) {
                        console.log("Geofence Debug:", result.debug)
                        setLocationError(`${result.error} (Debug: Expected ${result.debug.expected.latitude}, ${result.debug.expected.longitude} | You are at ${result.debug.actual.latitude}, ${result.debug.actual.longitude})`)
                    }
                }
            }
        } catch (error) {
            console.error(error)
            toast.error("Could not retrieve location. Please enable GPS.", { id: "clock-in" })
            setLocationError("Location access denied or unavailable. Please enable GPS to clock in.")
        } finally {
            setActionLoading(false)
        }
    }

    const handleClockOut = async () => {
        setActionLoading(true)
        try {
            const result = await clockOutStaff()
            if (result.success) {
                toast.success("Successfully clocked out!")
                loadData()
            } else {
                toast.error(result.error || "Failed to clock out")
            }
        } catch {
            toast.error("An error occurred")
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) {
        return <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Status Card */}
            <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Today&apos;s Attendance
                    </CardTitle>
                    <CardDescription>
                        Clock in when you arrive at school.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col items-center justify-center py-6 space-y-4">
                        <div className={`
                            relative flex items-center justify-center w-32 h-32 rounded-full border-4 
                            ${status?.clockedIn ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'}
                        `}>
                            {status?.clockedIn ? (
                                <CheckCircle className="h-12 w-12 text-green-500" />
                            ) : (
                                <MapPin className="h-12 w-12 text-slate-400" />
                            )}
                        </div>

                        <div className="text-center">
                            <h3 className="text-2xl font-bold">
                                {status?.clockedIn ? "Clocked In" : "Not Clocked In"}
                            </h3>
                            {status?.clockInTime && (
                                <p className="text-muted-foreground">
                                    Arrived at {status.clockInTime}
                                </p>
                            )}
                            {status?.clockOutTime && (
                                <p className="text-muted-foreground">
                                    Left at {status.clockOutTime}
                                </p>
                            )}
                        </div>

                        {status?.verified && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                                <Navigation className="h-3 w-3" />
                                Location Verified
                            </Badge>
                        )}
                    </div>

                    {locationError && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Location Error</AlertTitle>
                            <AlertDescription>{locationError}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex gap-4">
                        {!status?.clockedIn ? (
                            <Button
                                className="w-full h-12 text-lg"
                                onClick={handleClockIn}
                                disabled={actionLoading}
                            >
                                <MapPin className="mr-2 h-5 w-5" />
                                {actionLoading ? "Verifying..." : "Clock In Now"}
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                className="w-full h-12 text-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                onClick={handleClockOut}
                                disabled={actionLoading || !!status.clockOutTime}
                            >
                                {actionLoading ? "Processing..." : "Clock Out"}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* History Card */}
            <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader>
                    <CardTitle>Recent History</CardTitle>
                    <CardDescription>Your attendance records for the last 30 days.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {history.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No attendance history found.
                            </p>
                        ) : (
                            history.map((record, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-2 w-2 rounded-full ${record.status === 'present' ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <div>
                                            <p className="font-medium text-sm">
                                                {formatDate(record.date)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {record.checkInTime || '--:--'} - {record.checkOutTime || '--:--'}
                                            </p>
                                        </div>
                                    </div>
                                    {record.verified && (
                                        <CheckCircle className="h-4 w-4 text-green-500 opacity-50" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
