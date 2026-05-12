'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Save, Loader2, Navigation } from "lucide-react"
import { toast } from "sonner"
import { updateGeofenceSettings, getGeofenceSettings } from "@/lib/actions/school-settings"

export function GeofenceConfig() {
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [locationLoading, setLocationLoading] = useState(false)

    const [coords, setCoords] = useState({
        lat: '',
        lng: '',
        radius: '800', 
        trustedIPs: [] as string[],
        attendancePin: ''
    })
    const [newIP, setNewIP] = useState('')

    useEffect(() => {
        async function loadSettings() {
            try {
                const res = await getGeofenceSettings()
                if (res?.data) {
                    setCoords({
                        lat: res.data.geofence_lat?.toString() || '',
                        lng: res.data.geofence_lng?.toString() || '',
                        radius: res.data.geofence_radius_meters?.toString() || '800',
                        trustedIPs: (res.data.settings as any)?.trusted_ips || [],
                        attendancePin: (res.data.settings as any)?.attendance_pin || ''
                    })
                }
            } finally {
                setFetching(false)
            }
        }
        loadSettings()
    }, [])

    const handleUseMyLocation = () => {
        if (!("geolocation" in navigator)) {
            toast.error("Geolocation is not supported by your browser")
            return
        }

        setLocationLoading(true)
        toast.info("Acquiring high-accuracy coordinates...", {
            description: "Please stand exactly at the school gate for the best result."
        })

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords(prev => ({
                    ...prev,
                    lat: position.coords.latitude.toFixed(6),
                    lng: position.coords.longitude.toFixed(6)
                }))
                toast.success("School Gate Locked!", {
                    description: `Accuracy: ${Math.round(position.coords.accuracy)}m. Coordinates acquired.`
                })
                setLocationLoading(false)
            },
            (error) => {
                toast.error("Calibration Failed", {
                    description: "Ensure GPS is enabled and you have allowed location access."
                })
                setLocationLoading(false)
            },
            { enableHighAccuracy: true, timeout: 15000 }
        )
    }

    const addIP = () => {
        if (!newIP || coords.trustedIPs.includes(newIP)) return
        setCoords(prev => ({ ...prev, trustedIPs: [...prev.trustedIPs, newIP] }))
        setNewIP('')
    }

    const removeIP = (ip: string) => {
        setCoords(prev => ({ ...prev, trustedIPs: prev.trustedIPs.filter(i => i !== ip) }))
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const lat = parseFloat(coords.lat)
            const lng = parseFloat(coords.lng)
            const rad = parseInt(coords.radius)

            if (isNaN(lat) || isNaN(lng) || isNaN(rad)) {
                toast.error("Please enter valid numbers")
                return
            }

            const res = await updateGeofenceSettings(lat, lng, rad, coords.trustedIPs, coords.attendancePin)
            if (res.success) {
                toast.success("Security Config Updated", {
                    description: "Geofence, IPs, and Access PIN are now active."
                })
            } else {
                toast.error(res.error)
            }
        } catch (error) {
            toast.error("Failed to save settings")
        } finally {
            setLoading(false)
        }
    }

    if (fetching) return <div className="p-8 text-center text-muted-foreground animate-pulse">Initializing security protocols...</div>

    return (
        <Card className="bg-[#0f172a]/40 border-white/5 backdrop-blur-xl group hover:border-blue-500/30 transition-all md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-600/20 shadow-[0_0_20px_rgba(37,99,235,0.1)]">
                        <MapPin className="h-7 w-7 text-blue-500" />
                    </div>
                    <div>
                        <CardTitle className="text-white text-xl font-bold tracking-tight">Institutional Geofence</CardTitle>
                        <CardDescription className="text-slate-400 font-medium">
                            Configure physical boundaries and trusted networks for smart attendance.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-10 pt-8">
                {/* Geofence Inputs */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">Latitude Center</Label>
                                <Input
                                    value={coords.lat}
                                    onChange={(e) => setCoords({ ...coords, lat: e.target.value })}
                                    placeholder="e.g. 6.5244"
                                    className="bg-slate-950 border-white/10 text-white font-mono h-12 focus:border-blue-500/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">Longitude Center</Label>
                                <Input
                                    value={coords.lng}
                                    onChange={(e) => setCoords({ ...coords, lng: e.target.value })}
                                    placeholder="e.g. 3.3792"
                                    className="bg-slate-950 border-white/10 text-white font-mono h-12 focus:border-blue-500/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">Verification Radius (Meters)</Label>
                            <div className="flex gap-4 items-center">
                                <Input
                                    type="number"
                                    value={coords.radius}
                                    onChange={(e) => setCoords({ ...coords, radius: e.target.value })}
                                    placeholder="800"
                                    className="bg-slate-950 border-white/10 text-white font-mono h-12 max-w-[120px] focus:border-blue-500/50"
                                />
                                <div className="text-xs text-slate-500 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                                    Recommended: <strong className="text-blue-400">800m</strong> to account for indoor signal drift.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-600/5 rounded-2xl border border-blue-500/10 p-6 flex flex-col justify-center gap-4 text-center">
                        <div className="mx-auto h-12 w-12 rounded-full bg-blue-600/20 flex items-center justify-center">
                            <Navigation className="h-6 w-6 text-blue-400" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-white">Live Recalibration</p>
                            <p className="text-[10px] text-slate-500 uppercase font-black leading-tight">Stand at the school gate before clicking</p>
                        </div>
                        <Button
                            onClick={handleUseMyLocation}
                            disabled={locationLoading}
                            className="w-full bg-white text-black hover:bg-slate-200 font-bold shadow-xl active:scale-95"
                        >
                            {locationLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Lock Gate Coordinates
                        </Button>
                    </div>
                </div>

                {/* Hybrid Fallbacks (IPs & PIN) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                    {/* Trusted IPs */}
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-white font-bold flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Trusted Network IPs
                            </h4>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">For official school networks</p>
                        </div>
                        <div className="flex gap-2">
                            <Input
                                value={newIP}
                                onChange={(e) => setNewIP(e.target.value)}
                                placeholder="Public IP (e.g. 192.168.1.1)"
                                className="bg-slate-950 border-white/10 text-white text-xs h-10"
                            />
                            <Button onClick={addIP} variant="secondary" size="sm" className="bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 font-bold border border-blue-600/20">
                                Add
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 min-h-[40px]">
                            {coords.trustedIPs.map(ip => (
                                <div key={ip} className="flex items-center gap-2 bg-slate-900 border border-white/10 px-3 py-1.5 rounded-full text-[10px] text-slate-300 group">
                                    <span className="font-mono">{ip}</span>
                                    <button onClick={() => removeIP(ip)} className="text-slate-600 hover:text-red-400 transition-colors">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Attendance PIN */}
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-white font-bold flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                Attendance Security PIN
                            </h4>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Fallback for mobile data & desktops</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-400 text-[10px] uppercase tracking-wider">Access Code (4-6 Digits)</Label>
                            <Input
                                value={coords.attendancePin}
                                onChange={(e) => setCoords({ ...coords, attendancePin: e.target.value })}
                                placeholder="e.g. 1234"
                                maxLength={6}
                                className="bg-slate-950 border-white/10 text-white font-bold tracking-[0.5em] h-12 focus:border-amber-500/50 text-center"
                            />
                            <p className="text-[10px] text-slate-600 italic">Staff will enter this code if GPS fails.</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-black px-10 py-6 text-lg rounded-2xl shadow-2xl shadow-blue-600/20 active:scale-95 transition-all"
                    >
                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                        Commit Security Configuration
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
