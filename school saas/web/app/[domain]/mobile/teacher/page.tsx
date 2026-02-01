"use client"

import { MobileShell } from "@/components/mobile/mobile-shell"
import { OfflineAttendance } from "@/components/mobile/offline-attendance"
import { QuickMessage } from "@/components/mobile/quick-message"
import { Button } from "@/components/ui/button"
import { MapPin, CheckCircle2, CloudLightning } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { staffClockIn } from "@/lib/actions/mobile-actions"

export default function TeacherMobilePage({ params }: { params: { domain: string } }) {
    const [clockedIn, setClockedIn] = useState(false)
    const [loadingClock, setLoadingClock] = useState(false)

    const handleClockIn = async () => {
        setLoadingClock(true)
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                }

                try {
                    const res = await staffClockIn(coords)
                    if (res.success) {
                        setClockedIn(true)
                        toast.success(res.verified ? "Clocked In (Verified Location)" : "Clocked In (Location Unverified)")
                    } else {
                        toast.error(res.error || "Clock In Failed")
                    }
                } catch (e) {
                    toast.error("Network Error")
                } finally {
                    setLoadingClock(false)
                }
            }, (error) => {
                toast.error("Location access denied. " + error.message)
                setLoadingClock(false)
            })
        } else {
            toast.error("Geolocation not supported")
            setLoadingClock(false)
        }
    }

    return (
        <MobileShell domain={params.domain}>
            <div className="space-y-6">

                {/* 1. Zero-Latency Clock In */}
                <section>
                    <h2 className="text-white font-bold text-lg mb-3">Welcome, Teacher</h2>
                    {clockedIn ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in">
                            <div className="h-16 w-16 bg-emerald-500 rounded-full flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                                <CheckCircle2 className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-emerald-500 font-bold text-xl">Clocked In</h3>
                            <p className="text-emerald-400/80 text-sm mt-1">{new Date().toLocaleTimeString()}</p>
                        </div>
                    ) : (
                        <Button
                            className="w-full h-32 rounded-2xl bg-gradient-to-br from-[var(--school-accent)] to-blue-700 hover:brightness-110 flex flex-col gap-2 shadow-[0_10px_30px_-10px_var(--school-accent)] relative overflow-hidden group"
                            onClick={handleClockIn}
                            disabled={loadingClock}
                        >
                            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />

                            <MapPin className={`h-8 w-8 text-white z-10 ${loadingClock ? 'animate-bounce' : ''}`} />
                            <span className="text-2xl font-bold text-white z-10">
                                {loadingClock ? "Getting Location..." : "Tap to Clock In"}
                            </span>
                            <span className="text-blue-200 text-xs z-10 flex items-center gap-1">
                                <CloudLightning className="h-3 w-3" /> Zero-Latency Sync
                            </span>
                        </Button>
                    )}
                </section>

                {/* 2. Quick Actions */}
                <section className="space-y-3">
                    <h3 className="text-slate-400 text-xs uppercase font-bold tracking-wider">Classroom Actions</h3>
                    <QuickMessage />
                </section>

                {/* 3. Offline Attendance */}
                <section className="space-y-3">
                    <h3 className="text-slate-400 text-xs uppercase font-bold tracking-wider">Attendance Queue</h3>
                    <OfflineAttendance />
                </section>

            </div>
        </MobileShell>
    )
}
