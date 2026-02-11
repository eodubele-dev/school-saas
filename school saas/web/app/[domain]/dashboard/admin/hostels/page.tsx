import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, BedDouble, AlertTriangle, UserCheck } from "lucide-react"
import { getHostelsWithStats, getMaintenanceTickets } from "@/lib/actions/hostel"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

export default async function HostelDashboard() {
    const { data: buildings = [] } = await getHostelsWithStats()
    const { data: tickets = [] } = await getMaintenanceTickets()

    // Real-time stats calculation
    const totalRooms = buildings.reduce((acc: number, b: any) => acc + (b.rooms?.length || 0), 0)
    const totalCapacity = buildings.reduce((acc: number, b: any) => {
        return acc + (b.rooms?.reduce((rAcc: number, r: any) => rAcc + (r.capacity || 0), 0) || 0)
    }, 0)

    // Fix: Occupied beds should count bunks with students
    const occupiedBeds = buildings.reduce((acc: number, b: any) => {
        return acc + (b.rooms?.reduce((rAcc: number, r: any) => {
            return rAcc + (r.bunks?.filter((bk: any) => bk.student).length || 0)
        }, 0) || 0)
    }, 0)

    const occupancyRate = totalCapacity > 0 ? Math.round((occupiedBeds / totalCapacity) * 100) : 0
    const maintenanceCount = tickets.filter((t: any) => t.status !== 'resolved').length
    const criticalIssues = tickets.filter((t: any) => t.priority === 'critical' && t.status !== 'resolved').length

    const stats = [
        {
            title: "Total Occupancy",
            value: `${occupancyRate}%`,
            icon: BedDouble,
            desc: `${occupiedBeds}/${totalCapacity} Beds Filled`,
            color: "text-blue-400"
        },
        {
            title: "Present Tonight",
            value: `${occupiedBeds}`,
            icon: UserCheck,
            desc: "Based on active allocations",
            color: "text-green-400"
        },
        {
            title: "Maintenance",
            value: `${maintenanceCount}`,
            icon: AlertTriangle,
            desc: `${criticalIssues} Critical Issues`,
            color: maintenanceCount > 0 ? "text-amber-400" : "text-slate-500"
        },
        {
            title: "Hostel Units",
            value: `${buildings.length}`,
            icon: Activity,
            desc: `${totalRooms} Total Rooms`,
            color: "text-purple-400"
        },
    ]

    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="bg-slate-900 border-white/5 hover:border-[var(--school-accent)]/50 transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-300">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                            <p className="text-xs text-slate-500 mt-1">
                                {stat.desc}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-slate-900 border-white/5">
                    <CardHeader>
                        <CardTitle className="text-white">Occupancy by Hall</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] flex flex-col items-center justify-center text-slate-400">
                        {buildings.length > 0 ? (
                            <div className="w-full space-y-4 px-4 h-full overflow-y-auto custom-scrollbar">
                                {buildings.slice(0, 10).map((b: any) => {
                                    const bCap = b.rooms?.reduce((acc: number, r: any) => acc + (r.capacity || 0), 0) || 0
                                    const bOcc = b.rooms?.reduce((acc: number, r: any) => {
                                        return acc + (r.bunks?.filter((bk: any) => bk.student).length || 0)
                                    }, 0) || 0
                                    const bRate = bCap > 0 ? (bOcc / bCap) * 100 : 0
                                    return (
                                        <div key={b.id} className="space-y-1">
                                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                                                <span>{b.name}</span>
                                                <span className="text-blue-400">{bOcc} / {bCap}</span>
                                            </div>
                                            <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                                <div
                                                    className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all duration-1000"
                                                    style={{ width: `${bRate}%` }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <p>No buildings found</p>
                        )}
                    </CardContent>
                </Card>
                <Card className="col-span-3 bg-slate-900 border-white/5">
                    <CardHeader>
                        <CardTitle className="text-white">Recent Maintenance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {tickets.length > 0 ? (
                                tickets.slice(0, 4).map((ticket: any) => (
                                    <div key={ticket.id} className="flex items-center gap-4 p-3 rounded-lg bg-black/20 border border-white/5">
                                        <div className={`h-2 w-2 rounded-full ${ticket.priority === 'critical' ? 'bg-red-500 animate-pulse' :
                                            ticket.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                                            }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{ticket.title}</p>
                                            <p className="text-xs text-slate-400">{new Date(ticket.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] border-white/10 text-slate-400 capitalize">
                                            {ticket.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-slate-500 py-8">No tickets found</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}
