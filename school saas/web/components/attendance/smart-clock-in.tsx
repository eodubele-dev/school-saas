"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Clock, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { clockInStaff, clockOutStaff, getClockInStatus, getSchoolCoordinates } from "@/lib/actions/staff-clock-in"
import { GeofenceFailureAlert } from "./geofence-failure-alert"
import { AttendanceDisputeView } from "./attendance-dispute-view"
import { isWithinRadius } from "@/lib/utils/geolocation"
import { createClient } from "@/lib/supabase/client"

interface SmartClockInProps {
    onClockIn?: () => void
}

export function SmartClockIn({ onClockIn }: SmartClockInProps) {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<{
        clockedIn: boolean
        clockInTime: string | null
        isLate: boolean
    }>({ clockedIn: false, clockInTime: null, isLate: false })
    const [isWithinRange, setIsWithinRange] = useState<boolean | null>(null)
    const [showFailureAlert, setShowFailureAlert] = useState(false)
    const [showDisputeView, setShowDisputeView] = useState(false)
    const [failedDistance, setFailedDistance] = useState(0)
    const [failedAttemptId, setFailedAttemptId] = useState('')
    const [schoolLocation, setSchoolLocation] = useState<{ latitude: number, longitude: number, radius_meters: number } | null>(null)

    useEffect(() => {
        loadStatus()
        initGeofencing()
    }, [])

    const initGeofencing = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
        if (profile) {
            const coords = await getSchoolCoordinates(profile.tenant_id)
            setSchoolLocation(coords)

            // Continuous Proximity Monitoring
            if ("geolocation" in navigator) {
                const watchId = navigator.geolocation.watchPosition((pos) => {
                    if (coords) {
                        const { verified } = isWithinRadius(
                            pos.coords.latitude,
                            pos.coords.longitude,
                            coords.latitude,
                            coords.longitude,
                            coords.radius_meters
                        )
                        setIsWithinRange(verified)
                    }
                }, () => {
                    setIsWithinRange(null)
                }, { enableHighAccuracy: true })

                return () => navigator.geolocation.clearWatch(watchId)
            }
        }
    }

    const loadStatus = async () => {
        const res = await getClockInStatus()
        if (res.success && res.data) {
            // Check if late (after 8:00 AM)
            let isLate = false
            if (res.data.clockInTime) {
                const [hours, minutes] = res.data.clockInTime.split(':').map(Number)
                if (hours > 8 || (hours === 8 && minutes > 0)) {
                    isLate = true
                }
            }

            setStatus({
                clockedIn: res.data.clockedIn,
                clockInTime: res.data.clockInTime,
                isLate
            })
        }
    }

    const handleClockIn = async () => {
        setLoading(true)
        try {
            if (!("geolocation" in navigator)) {
                toast.error("Geolocation is not supported by your browser")
                return
            }

            navigator.geolocation.getCurrentPosition(async (position) => {
                const res = await clockInStaff(position.coords.latitude, position.coords.longitude)

                if (res.success) {
                    toast.success("Clocked in successfully!")
                    loadStatus()
                    if (onClockIn) onClockIn()
                } else {
                    if (res.verified === false) {
                        setFailedDistance(Math.round(res.distance || 0))
                        setFailedAttemptId(res.auditLogId || '') // I'll need to update the server action result type
                        setShowFailureAlert(true)
                    } else {
                        toast.error(res.error || "Failed to clock in")
                    }
                }
                setLoading(false)
            }, () => {
                toast.error("Location access denied. Please enable GPS.")
                setLoading(false)
            })

        } catch (error) {
            toast.error("An error occurred")
            setLoading(false)
        }
    }

    const handleClockOut = async () => {
        setLoading(true)
        try {
            const res = await clockOutStaff()
            if (res.success) {
                toast.success("Clocked out successfully!")
                setStatus(prev => ({ ...prev, clockedIn: false }))
            } else {
                toast.error(res.error || "Failed to clock out")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="p-6 bg-slate-900 border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative flex flex-col items-center justify-center text-center gap-4">
                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium uppercase tracking-widest">
                    <MapPin className="h-4 w-4" />
                    Smart Attendance
                </div>

                {!status.clockedIn ? (
                    <Button
                        size="lg"
                        className={`h-32 w-32 rounded-full border-4 transition-all duration-300 flex flex-col gap-1 active:scale-95 shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)]
                            ${isWithinRange === false
                                ? 'border-red-500/40 bg-red-600 hover:bg-red-500 animate-pulse shadow-red-500/40'
                                : 'border-blue-500/20 bg-blue-600 hover:bg-blue-500 hover:scale-105'
                            }
                        `}
                        onClick={handleClockIn}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Clock className="h-8 w-8" />}
                        <span className="font-bold text-lg">CLOCK IN</span>
                    </Button>
                ) : (
                    <div className="space-y-4">
                        <div className="h-32 w-32 rounded-full border-4 border-emerald-500/20 bg-emerald-500/10 flex flex-col items-center justify-center mx-auto animate-in zoom-in duration-300">
                            <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-1" />
                            <span className="text-2xl font-bold text-white">{status.clockInTime?.slice(0, 5)}</span>
                            <span className="text-[10px] uppercase text-emerald-400 font-bold tracking-widest">Clocked In</span>
                        </div>

                        {status.isLate && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-xs font-bold">
                                <AlertTriangle className="h-3 w-3" />
                                Marked Late
                            </div>
                        )}

                        <Button
                            variant="outline"
                            className="w-full border-white/10 hover:bg-white/5 text-slate-400 hover:text-white"
                            onClick={handleClockOut}
                            disabled={loading}
                        >
                            Clock Out
                        </Button>
                    </div>
                )}

                <p className={`text-xs max-w-[200px] font-medium transition-colors ${isWithinRange === false ? 'text-red-400 animate-pulse' : 'text-slate-500'}`}>
                    {status.clockedIn
                        ? "You are currently active. Don't forget to clock out."
                        : isWithinRange === false
                            ? "CRITICAL: OUT OF BOUNDS DETECTED. You must be within school premises."
                            : `Ensure you are within the school premises (${schoolLocation?.radius_meters || 500}m radius).`
                    }
                </p>
            </div>

            {showFailureAlert && (
                <GeofenceFailureAlert
                    distance={failedDistance}
                    requiredRadius={schoolLocation?.radius_meters || 500}
                    onRetry={() => {
                        setShowFailureAlert(false)
                        handleClockIn()
                    }}
                    onDispute={() => {
                        setShowFailureAlert(false)
                        setShowDisputeView(true)
                    }}
                />
            )}

            {showDisputeView && (
                <AttendanceDisputeView
                    failedAttemptId={failedAttemptId}
                    distanceDetected={failedDistance}
                    onSuccess={() => {
                        setShowDisputeView(false)
                        loadStatus()
                    }}
                    onCancel={() => setShowDisputeView(false)}
                />
            )}
        </Card>
    )
}
