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
        radius: '500'
    })

    useEffect(() => {
        async function loadSettings() {
            try {
                const res = await getGeofenceSettings()
                if (res?.data) {
                    setCoords({
                        lat: res.data.geofence_lat?.toString() || '',
                        lng: res.data.geofence_lng?.toString() || '',
                        radius: res.data.geofence_radius_meters?.toString() || '500'
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
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords(prev => ({
                    ...prev,
                    lat: position.coords.latitude.toFixed(6),
                    lng: position.coords.longitude.toFixed(6)
                }))
                toast.success("Location acquired!")
                setLocationLoading(false)
            },
            (error) => {
                toast.error("Process denied or failed. Ensure GPS is on.")
                setLocationLoading(false)
            },
            { enableHighAccuracy: true }
        )
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

            const res = await updateGeofenceSettings(lat, lng, rad)
            if (res.success) {
                toast.success(res.message)
            } else {
                toast.error(res.error)
            }
        } catch (error) {
            toast.error("Failed to save settings")
        } finally {
            setLoading(false)
        }
    }

    if (fetching) return <div className="p-8 text-center text-slate-500">Loading settings...</div>

    return (
        <Card className="bg-slate-900/40 border-white/5 backdrop-blur-sm group hover:border-blue-500/30 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                        <MapPin className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                        <CardTitle className="text-white text-lg">Geofence Configuration</CardTitle>
                        <CardDescription className="text-slate-400">
                            Set the designated area for staff Smart Attendance.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-slate-300 text-xs uppercase tracking-wider">Latitude</Label>
                        <Input
                            value={coords.lat}
                            onChange={(e) => setCoords({ ...coords, lat: e.target.value })}
                            placeholder="e.g. 6.5244"
                            className="bg-black/20 border-white/10 text-white font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-slate-300 text-xs uppercase tracking-wider">Longitude</Label>
                        <Input
                            value={coords.lng}
                            onChange={(e) => setCoords({ ...coords, lng: e.target.value })}
                            placeholder="e.g. 3.3792"
                            className="bg-black/20 border-white/10 text-white font-mono"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-300 text-xs uppercase tracking-wider">Radius (Meters)</Label>
                    <div className="flex gap-2 items-center">
                        <Input
                            type="number"
                            value={coords.radius}
                            onChange={(e) => setCoords({ ...coords, radius: e.target.value })}
                            placeholder="500"
                            className="bg-black/20 border-white/10 text-white font-mono"
                        />
                        <span className="text-slate-500 text-xs whitespace-nowrap">recommended: 100 - 500m</span>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <Button
                        onClick={handleUseMyLocation}
                        disabled={locationLoading}
                        className="flex-1 bg-transparent border border-white/20 hover:bg-white/10 text-white font-medium shadow-none"
                    >
                        {locationLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Navigation className="mr-2 h-4 w-4" />}
                        Use My Location
                    </Button>

                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold"
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Configuration
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
