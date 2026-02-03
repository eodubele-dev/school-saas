import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, BedDouble, AlertTriangle, UserCheck } from "lucide-react"

export default function HostelDashboard() {
    // Mock Stats
    const stats = [
        { title: "Total Occupancy", value: "85%", icon: BedDouble, desc: "450/520 Beds Filled", color: "text-blue-400" },
        { title: "Present Tonight", value: "442", icon: UserCheck, desc: "8 students away/exeat", color: "text-green-400" },
        { title: "Maintenance", value: "12", icon: AlertTriangle, desc: "3 Critical Issues", color: "text-amber-400" },
        { title: "Daily Activity", value: "Active", icon: Activity, desc: "All systems normal", color: "text-purple-400" },
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
                    <CardContent className="h-[300px] flex items-center justify-center text-slate-500">
                        {/* Placeholder for Bar Chart */}
                        <p>Occupancy Visualization Loading...</p>
                    </CardContent>
                </Card>
                <Card className="col-span-3 bg-slate-900 border-white/5">
                    <CardHeader>
                        <CardTitle className="text-white">Recent Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-black/20 border border-white/5">
                                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                    <div>
                                        <p className="text-sm font-medium text-white">Absent: John Doe (Grade 11)</p>
                                        <p className="text-xs text-slate-400">Queen Amina Hall • 10 mins ago</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}
