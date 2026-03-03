"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MapPin, AlertCircle, Crown, Lock } from "lucide-react"

export default function BusTrackerPage() {
    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <MapPin className="text-amber-500" />
                    Live Bus Tracker
                    <span className="bg-amber-500/10 text-amber-500 px-3 py-1 text-xs font-bold rounded border border-amber-500/20 tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.2)]">PREMIUM</span>
                </h1>
                <p className="text-slate-400 mt-2">Real-time GPS tracking for your child&apos;s school commute.</p>
            </div>

            <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Lagos,Nigeria&zoom=13&size=800x400&maptype=roadmap&style=feature:all|element:labels.text.fill|color:0x8ec3b9&style=feature:all|element:labels.text.stroke|color:0x1a3646&style=feature:administrative.country|element:geometry.stroke|color:0x4b6878&style=feature:administrative.land_parcel|element:labels.text.fill|color:0x64779e&style=feature:administrative.province|element:geometry.stroke|color:0x4b6878&style=feature:landscape.man_made|element:geometry.stroke|color:0x334e87&style=feature:landscape.natural|element:geometry|color:0x023e58&style=feature:poi|element:geometry|color:0x283d6a&style=feature:poi|element:labels.text.fill|color:0x6f9ba5&style=feature:poi|element:labels.text.stroke|color:0x1d2c4d&style=feature:poi.park|element:geometry.fill|color:0x023e58&style=feature:poi.park|element:labels.text.fill|color:0x3C7680&style=feature:road|element:geometry|color:0x304a7d&style=feature:road|element:labels.text.fill|color:0x98a5be&style=feature:road|element:labels.text.stroke|color:0x1d2c4d&style=feature:road.highway|element:geometry|color:0x2c6675&style=feature:road.highway|element:geometry.stroke|color:0x255763&style=feature:road.highway|element:labels.text.fill|color:0xb0d5ce&style=feature:road.highway|element:labels.text.stroke|color:0x023e58&style=feature:transit|element:labels.text.fill|color:0x98a5be&style=feature:transit|element:labels.text.stroke|color:0x1d2c4d&style=feature:transit.line|element:geometry.fill|color:0x283d6a&style=feature:transit.station|element:geometry|color:0x3a4762&style=feature:water|element:geometry|color:0x0e1626&style=feature:water|element:labels.text.fill|color:0x4e6d70')] opacity-20 blur-sm mix-blend-screen" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 to-slate-950/90" />
                <CardContent className="p-12 text-center relative z-10 text-slate-400">

                    <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                        <Lock className="w-10 h-10 text-amber-500" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-4">Tracking Offline</h2>
                    <p className="max-w-md mx-auto mb-8">
                        The Live Bus Tracker is a Premium feature. Upgrade to the Platinum Tier to unlock real-time map views and automated geofence alerts when your child arrives home safely.
                    </p>

                    <button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all hover:-translate-y-1">
                        Unlock Platinum Features
                    </button>

                </CardContent>
            </Card>
        </div>
    )
}
