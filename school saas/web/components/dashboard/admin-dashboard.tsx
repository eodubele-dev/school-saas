import { Users, DollarSign, School, Activity, TrendingUp, TrendingDown } from "lucide-react"
import { getAdminStats } from "@/lib/actions/dashboard"
import { MetricCard } from "./metric-card"
import { OverviewChart } from "./overview-chart"
import { RecentActivity } from "./recent-activity"
import { DemographicsChart } from "./demographics-chart"

export async function AdminDashboard() {
    const stats = await getAdminStats()

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-white glow-blue">Admin Command Center</h2>
                <p className="text-slate-400">Real-time school performance & financial analytics.</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Revenue"
                    value={new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(stats?.totalRevenue || 0)}
                    icon={DollarSign}
                    trend={{ value: "12% from last month", positive: true }}
                />
                <MetricCard
                    title="Active Students"
                    value={(stats?.totalStudents || 0).toString()}
                    icon={Users}
                    trend={{ value: "4% new enrollments", positive: true }}
                />
                <MetricCard
                    title="Teaching Staff"
                    value={(stats?.totalTeachers || 0).toString()}
                    icon={School}
                    description="Full-time & Part-time"
                />
                <MetricCard
                    title="Active Classes"
                    value={(stats?.totalClasses || 0).toString()}
                    icon={Activity}
                    description="Across 3 arms"
                />
            </div>

            {/* Main Charts Section */}
            <div className="grid gap-6 md:grid-cols-7 lg:h-[400px]">
                <div className="col-span-4 lg:col-span-5 h-[350px] lg:h-full">
                    <OverviewChart />
                </div>
                <div className="col-span-3 lg:col-span-2 h-[350px] lg:h-full">
                    <DemographicsChart />
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Re-using Overview for now as "Visit Performance" placeholder or similar */}
                <div className="h-[350px] hidden md:block">
                    {/* We can duplicate chart or add another component later */}
                    <RecentActivity data={stats?.recentActivity} />
                </div>
                <div className="h-[350px]">
                    <RecentActivity data={stats?.recentActivity} />
                </div>
            </div>
        </div>
    )
}
