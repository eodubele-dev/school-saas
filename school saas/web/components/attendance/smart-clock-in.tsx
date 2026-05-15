"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Clock, CheckCircle2, AlertTriangle, Loader2, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { clockInStaff, clockOutStaff, getClockInStatus, getSchoolCoordinates } from "@/lib/actions/staff-clock-in"
import { GeofenceFailureAlert } from "./geofence-failure-alert"
import { AttendanceDisputeView } from "./attendance-dispute-view"
import { isWithinRadius } from "@/lib/utils/geolocation"
import { createClient } from "@/lib/supabase/client"
import { useOfflineSync } from "@/components/providers/offline-sync-provider"

// Helper for local date YYYY-MM-DD
const getLocalToday = () => {
    const d = new Date()
    const pad = (n: number) => n < 10 ? '0' + n : n
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

interface SmartClockInProps {
    onClockIn?: () => void
}

export function SmartClockIn({ onClockIn }: SmartClockInProps) {
    const { queueAction, isOnline } = useOfflineSync()
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<{
        clockedIn: boolean
        clockInTime: string | null
        isLate: boolean
        verificationMethod: string | null
    }>({ clockedIn: false, clockInTime: null, isLate: false, verificationMethod: null })
    const [isWithinRange, setIsWithinRange] = useState<boolean | null>(null)
    const [showFailureAlert, setShowFailureAlert] = useState(false)
    const [showDisputeView, setShowDisputeView] = useState(false)
    const [failedDistance, setFailedDistance] = useState(0)
    const [failedAttemptId, setFailedAttemptId] = useState('')
    const [schoolLocation, setSchoolLocation] = useState<{ latitude: number, longitude: number, radius_meters: number } | null>(null)
    const params = useParams()
    const domain = params?.domain as string

    const [tenantId, setTenantId] = useState<string | null>(null)
    const [verificationPin, setVerificationPin] = useState('')
    const [showPinDialog, setShowPinDialog] = useState(false)

    const loadStatus = useCallback(async (currentTenantId?: string) => {
        const tId = currentTenantId || tenantId
        const res = await getClockInStatus(getLocalToday(), tId || undefined)
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
                isLate,
                verificationMethod: res.data.verificationMethod || 'gps'
            })
        }
    }, [tenantId])

    const fetchSchoolCoords = useCallback(async () => {
        // Try to load from local cache first
        if (!schoolLocation) {
            const cachedCoords = localStorage.getItem(`school-geofence-cache-${domain}`)
            if (cachedCoords) setSchoolLocation(JSON.parse(cachedCoords))
        }

        if (navigator.onLine) {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Get tenant by domain slug first to be absolutely sure of the context
            const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', domain).single()
            if (tenant) {
                setTenantId(tenant.id)
                
                // Fetch coordinates
                const coords = await getSchoolCoordinates(tenant.id)
                if (coords) {
                    const newString = JSON.stringify(coords)
                    if (JSON.stringify(schoolLocation) !== newString) {
                        setSchoolLocation(coords)
                        localStorage.setItem(`school-geofence-cache-${domain}`, newString)
                    }
                }
                
                // Also trigger status load with this tenant ID immediately
                loadStatus(tenant.id)
            }
        }
    }, [schoolLocation, domain, loadStatus])

    useEffect(() => {
        if (tenantId) loadStatus()
        fetchSchoolCoords()
    }, [isOnline, loadStatus, fetchSchoolCoords, tenantId])

    // Separate effect for watching position to prevent leaks and loops
    useEffect(() => {
        if (!schoolLocation || !("geolocation" in navigator)) return

        const watchId = navigator.geolocation.watchPosition((pos) => {
            const { verified } = isWithinRadius(
                pos.coords.latitude,
                pos.coords.longitude,
                schoolLocation.latitude,
                schoolLocation.longitude,
                schoolLocation.radius_meters
            )
            setIsWithinRange(verified)
        }, () => {
            setIsWithinRange(null)
        }, { enableHighAccuracy: true })

        return () => navigator.geolocation.clearWatch(watchId)
    }, [schoolLocation])

    const handleClockIn = async (overridePin?: string) => {
        setLoading(true)
        try {
            // Helper to perform the actual server-side clock in
            const performClockIn = async (lat: number, lng: number) => {
                if (isOnline) {
                    const res = await clockInStaff(lat, lng, getLocalToday(), overridePin, tenantId || undefined)

                    if (res.success) {
                        toast.success("Verification Successful", {
                            description: overridePin ? "Verified via Security PIN." : (res.distance === 0 ? "Verified via School Network." : "Verified via GPS Geofence.")
                        })
                        setShowPinDialog(false)
                        setVerificationPin('')
                        loadStatus()
                        if (onClockIn) onClockIn()
                    } else {
                        if (res.verified === false) {
                            setFailedDistance(Math.round(res.distance || 0))
                            setFailedAttemptId(res.auditLogId || '') 
                            setShowFailureAlert(true)
                        } else {
                            toast.error(res.error || "Failed to clock in")
                        }
                    }
                } else {
                    // Offline Queuing
                    queueAction({
                        type: 'CLOCK_IN',
                        payload: { latitude: lat, longitude: lng, date: getLocalToday() }
                    })
                    setStatus({
                        clockedIn: true,
                        clockInTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                        isLate: false,
                        verificationMethod: overridePin ? 'pin' : 'gps'
                    })
                }
                setLoading(false)
            }

            // If a PIN is provided, skip GPS and try it
            if (overridePin) {
                await performClockIn(0, 0)
                return
            }

            // If geolocation is not available, jump to PIN
            if (!("geolocation" in navigator)) {
                setShowPinDialog(true)
                setLoading(false)
                return
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    await performClockIn(position.coords.latitude, position.coords.longitude)
                },
                async (err) => {
                    // Fallback: If GPS is denied/failed, show PIN entry
                    setShowPinDialog(true)
                    setLoading(false)
                },
                { enableHighAccuracy: true, timeout: 5000 }
            )

        } catch (error) {
            toast.error("Security handshake failed")
            setLoading(false)
        }
    }

    const handleClockOut = async () => {
        setLoading(true)
        try {
            if (isOnline) {
                const res = await clockOutStaff(0, 0, getLocalToday(), tenantId || undefined)
                if (res.success) {
                    toast.success("Clocked out successfully!")
                    setStatus(prev => ({ ...prev, clockedIn: false }))
                } else {
                    toast.error(res.error || "Failed to clock out")
                }
            } else {
                queueAction({
                    type: 'CLOCK_OUT',
                    payload: { date: getLocalToday() }
                })
                setStatus(prev => ({ ...prev, clockedIn: false }))
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="p-6 bg-[#0a0a0a] text-card-foreground border-white/5 relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative flex flex-col items-center justify-center text-center gap-4">
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                    Secure Attendance Portal
                </div>

                {!status.clockedIn ? (
                    <div className="relative">
                        <Button
                            size="lg"
                            className={`h-36 w-36 rounded-full border-4 transition-all duration-500 flex flex-col gap-1 active:scale-95 shadow-[0_0_50px_-10px_rgba(37,99,235,0.3)]
                                ${isWithinRange === false
                                    ? 'border-red-500/40 bg-red-600 hover:bg-red-500 animate-pulse'
                                    : 'border-blue-500/20 bg-blue-600 hover:bg-blue-500 hover:scale-105'
                                }
                            `}
                            onClick={() => handleClockIn()}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-10 w-10 animate-spin" /> : <Clock className="h-10 w-10" />}
                            <span className="font-black text-xl tracking-tighter">CLOCK IN</span>
                        </Button>
                        
                        {isWithinRange === false && (
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-bold px-2 py-1 rounded-full animate-bounce">
                                OUT OF BOUNDS
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6 w-full">
                        <div className="h-36 w-36 rounded-full border-4 border-emerald-500/20 bg-emerald-500/5 flex flex-col items-center justify-center mx-auto animate-in zoom-in duration-500 relative">
                            <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500/40 animate-spin duration-[3000ms]" />
                            <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-1" />
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-3xl font-black text-white tracking-tighter">{status.clockInTime?.slice(0, 5)}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase text-emerald-400 font-black tracking-widest">Active Duty</span>
                                <span className="h-1 w-1 rounded-full bg-emerald-500/50" />
                                <span className="text-[9px] uppercase text-slate-500 font-bold">
                                    {status.verificationMethod === 'pin' ? 'PIN Verified' : 
                                     status.verificationMethod === 'trusted_ip' ? 'Network Verified' : 
                                     'GPS Verified'}
                                </span>
                            </div>
                        </div>
                        </div>

                        {status.isLate && (
                            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[10px] font-black uppercase tracking-wider">
                                <AlertTriangle className="h-3 w-3" />
                                Marked Late
                            </div>
                        )}

                        <Button
                            variant="outline"
                            className="w-full border-white/5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-bold h-12 rounded-xl transition-all"
                            onClick={handleClockOut}
                            disabled={loading}
                        >
                            Clock Out for Today
                        </Button>
                    </div>
                )}

                <div className="space-y-1">
                    <p className={`text-[10px] max-w-[220px] font-bold uppercase tracking-wider transition-colors ${isWithinRange === false ? 'text-red-400 animate-pulse' : 'text-slate-500'}`}>
                        {status.clockedIn
                            ? "Institutional presence confirmed. Identity logged."
                            : isWithinRange === false
                                ? "Critical: Geofence violation detected."
                                : `Boundary: ${schoolLocation?.radius_meters || 800}m Security Radius.`
                        }
                    </p>
                    {!status.clockedIn && (
                        <button 
                            onClick={() => setShowPinDialog(true)}
                            className="text-[9px] text-blue-500 hover:text-blue-400 underline font-bold uppercase tracking-tighter"
                        >
                            Use Manual Security Code
                        </button>
                    )}
                </div>
            </div>

            {/* PIN Entry Dialog */}
            {showPinDialog && (
                <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="w-full max-w-[240px] space-y-6">
                        <div className="text-center space-y-2">
                            <div className="h-12 w-12 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto border border-blue-500/20">
                                <ShieldCheck className="h-6 w-6 text-blue-400" />
                            </div>
                            <h3 className="text-white font-black text-lg tracking-tight">Manual Verification</h3>
                            <p className="text-[10px] text-slate-500 uppercase font-bold">Enter the daily school access code</p>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="password"
                                value={verificationPin}
                                onChange={(e) => setVerificationPin(e.target.value)}
                                placeholder="----"
                                maxLength={6}
                                className="w-full bg-white/5 border border-white/10 rounded-xl h-14 text-center text-2xl font-black text-white tracking-[0.5em] focus:border-blue-500/50 outline-none transition-all"
                                autoFocus
                            />
                            
                            <div className="flex gap-2">
                                <Button 
                                    variant="ghost" 
                                    className="flex-1 text-slate-500 hover:text-white font-bold"
                                    onClick={() => {
                                        setShowPinDialog(false)
                                        setVerificationPin('')
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black shadow-lg shadow-blue-600/20"
                                    onClick={() => handleClockIn(verificationPin)}
                                    disabled={loading || verificationPin.length < 4}
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showFailureAlert && (
                <GeofenceFailureAlert
                    distance={failedDistance}
                    requiredRadius={schoolLocation?.radius_meters || 800}
                    onRetry={() => {
                        setShowFailureAlert(false)
                        handleClockIn()
                    }}
                    onDispute={() => {
                        setShowFailureAlert(false)
                        setShowPinDialog(true)
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
                    onCancel={() => setShowPinDialog(false)}
                />
            )}
        </Card>
    )
}
