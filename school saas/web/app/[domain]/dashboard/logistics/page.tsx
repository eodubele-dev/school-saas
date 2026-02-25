import { createClient } from "@/lib/supabase/server"
import { getRoutes } from "@/lib/actions/logistics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bus, MapPin, Wrench, Users, ArrowRight } from "lucide-react"
import Link from "next/link"
import { CreateRouteModal } from "@/components/logistics/create-route-modal"
import { AssignStudentModal } from "@/components/logistics/assign-student-modal"
import { ArrowUpRight } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function LogisticsPage({ params }: { params: { domain: string } }) {
    const routes = await getRoutes() || []
    const domain = params.domain

    return (
        <div className="space-y-8 p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                        Safe-Route Transport Hub
                    </h1>
                    <p className="text-slate-400">Manage fleet, track buses, and ensure student safety.</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900 border-white/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Total Routes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{routes.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-white/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">Active Fleet</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
                            {routes.length} <Bus className="h-4 w-4" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Route List */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {routes.map((route: any) => (
                    <Card key={route.id} className="bg-slate-900/50 border-white/10 hover:border-cyan-500/30 transition-all group overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-cyan-500/10 transition-colors" />

                        <CardHeader>
                            <CardTitle className="flex justify-between items-center gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-white text-lg">{route.name}</span>
                                    <span className="text-[10px] w-fit bg-slate-800 px-2 py-0.5 rounded border border-white/10 font-mono text-cyan-300">
                                        {route.vehicle_number}
                                    </span>
                                </div>
                                <AssignStudentModal routeId={route.id} routeName={route.name} />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2 text-sm text-slate-400">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-slate-500" />
                                    <span>Driver: <span className="text-white">{route.driver_name}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-slate-500" />
                                    <span>Attendant: <span className="text-white">{route.attendant_name || 'None'}</span></span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2">
                                <Link
                                    key={`pickup-${route.id}`}
                                    href={`/dashboard/logistics/manifest/${route.id}?dir=pickup`}
                                    className="flex flex-col items-center justify-center p-3 rounded bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors text-blue-400 text-sm font-medium"
                                >
                                    <div className="flex items-center gap-1">
                                        <span>Morning Pickup</span>
                                        <ArrowUpRight className="h-3 w-3 opacity-50" />
                                    </div>
                                    <span className="text-[10px] opacity-70">Start Manifest</span>
                                </Link>
                                <Link
                                    key={`dropoff-${route.id}`}
                                    href={`/dashboard/logistics/manifest/${route.id}?dir=dropoff`}
                                    className="flex flex-col items-center justify-center p-3 rounded bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-colors text-orange-400 text-sm font-medium"
                                >
                                    <div className="flex items-center gap-1">
                                        <span>Afternoon Drop</span>
                                        <ArrowUpRight className="h-3 w-3 opacity-50" />
                                    </div>
                                    <span className="text-[10px] opacity-70">Start Manifest</span>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* New Route Placeholder */}
                {/* New Route Placeholder */}
                <CreateRouteModal />
            </div>
        </div>
    )
}
