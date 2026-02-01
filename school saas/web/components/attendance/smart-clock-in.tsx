"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Clock, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { clockInStaff, clockOutStaff, getClockInStatus } from "@/lib/actions/staff-clock-in"

export function SmartClockIn() {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<{
        clockedIn: boolean
        clockInTime: string | null
        isLate: boolean
    }>({ clockedIn: false, clockInTime: null, isLate: false })

    useEffect(() => {
        loadStatus()
    }, [])

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
                } else {
                    toast.error(res.error || "Failed to clock in")
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
                        className="h-32 w-32 rounded-full border-4 border-blue-500/20 hover:border-blue-500 hover:scale-105 transition-all duration-300 bg-blue-600 hover:bg-blue-500 shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] flex flex-col gap-1"
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

                <p className="text-xs text-slate-500 max-w-[200px]">
                    {status.clockedIn
                        ? "You are currently active. Don't forget to clock out."
                        : "Ensure you are within the school premises (100m radius)."
                    }
                </p>
            </div>
        </Card>
    )
}
