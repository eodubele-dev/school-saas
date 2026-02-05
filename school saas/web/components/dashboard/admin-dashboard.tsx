import { Users, School, Activity, TrendingUp, TrendingDown } from "lucide-react"
import { NairaIcon } from "@/components/ui/naira-icon"
import { getAdminStats } from "@/lib/actions/dashboard"
import { MetricCard } from "./metric-card"
import { OverviewChart } from "./overview-chart"
import { RecentActivity } from "./recent-activity"
import { DemographicsChart } from "./demographics-chart"
import { NudgeButton } from "./nudge-button"

export async function AdminDashboard() {
    const stats = await getAdminStats()

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section Removed (Duplicate) */}
            {/* The BentoLoader now generates the 'Command Center' header dynamically */}

            {/* Metrics Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    id="revenue-card"
                    title="Total Revenue"
                    value={new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(stats?.totalRevenue || 0)}
                    icon={NairaIcon}
                    trend={{ value: "12% from last month", positive: true }}
                />
                <MetricCard
                    title="Active Students"
                    value={(stats?.totalStudents || 0).toString()}
                    icon={Users}
                    trend={{ value: "4% new enrollments", positive: true }}
                />
                <MetricCard
                    id="staff-attendance-gauge"
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

            {/* Quick Actions (Tour Targets) */}
            <div className="flex justify-end">
                <NudgeButton />
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
                <div className="h-[350px]">
                    <RecentActivity data={stats?.recentActivity} />
                </div>
                <div className="h-[350px] bg-slate-900/30 border border-white/5 rounded-xl p-6 flex items-center justify-center text-slate-500 text-sm">
                    {/* Placeholder for future widget (e.g., Quick Tasks or Calendar) */}
                    <span>System Health & Performance (Coming Soon)</span>
                </div>
            </div>
        </div>
    )
}
