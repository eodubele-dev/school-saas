import { Users, School, Activity, TrendingUp, TrendingDown, Zap, GraduationCap, CreditCard, ArrowUpRight, Bus } from "lucide-react"
import Link from "next/link"
import { NairaIcon } from "@/components/ui/naira-icon"
import { getAdminStats } from "@/lib/actions/dashboard"
import { MetricCard } from "./metric-card"
import { OverviewChart } from "./overview-chart"
import { RecentActivity } from "./recent-activity"
import { DemographicsChart } from "./demographics-chart"
import { NudgeButton } from "./nudge-button"
import { getGlobalStats, getTenants } from "@/lib/actions/global"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useOfflineVault } from "@/components/providers/offline-vault-provider"
import { Database, WifiOff } from "lucide-react"
import { cn } from "@/lib/utils"

import { LockedWidget } from "./locked-widget"
import { LockedSMSWidget } from "./locked-sms-widget"
import { LockedGenericWidget } from "./locked-generic-widget"
import { PilotBanner } from "./pilot-banner"
import { FinancialText } from "@/components/ui/financial-text"
import { GlobalCampusSwitcher } from "./global-campus-switcher"
import { getActiveAcademicSession } from "@/lib/actions/academic"
import { DashboardModalProvider } from "./dashboard-modal-provider"
import { OnboardingGuide } from "./onboarding-guide"

export async function AdminDashboard({
    tier = 'starter',
    isPilot = false,
    smsBalance = 0,
    schoolName = '',
    subdomain = '',
    logoUrl = '',
    isGlobalView = false
}: {
    tier?: string,
    isPilot?: boolean,
    smsBalance?: number,
    schoolName?: string,
    subdomain?: string,
    logoUrl?: string,
    isGlobalView?: boolean
}) {
    // 0. Use Offline Vault (Client hook - but this is a server component)
    // Wait, AdminDashboard is currently exported without 'use client'.
    // If I want to show the banner, I'll wrap the inner part in a Client Component.
    // 1. Fetch Data based on View Mode
    const tenants = await getTenants()

    let stats: any = {}
    let globalStats: any = null

    if (isGlobalView) {
        globalStats = await getGlobalStats()
        // Map global stats to the same structure as local stats where possible for reuse
        stats = {
            totalStudents: globalStats.totalStudents,
            totalTeachers: globalStats.totalStaff,
            totalClasses: globalStats.campusCount, // Repurposing for campus count in global view
            totalRevenue: globalStats.totalRevenue,
            recentActivity: [] // TODO: Aggregated activity
        }
    } else {
        stats = await getAdminStats()
    }

    const { session } = await getActiveAcademicSession()

    return (
        <DashboardModalProvider currentTier={tier} schoolName={schoolName}>
            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Header / Switcher Area */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        {!isGlobalView && logoUrl && (
                            <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 p-2 flex items-center justify-center overflow-hidden shrink-0 shadow-2xl">
                                <img 
                                    src={logoUrl} 
                                    alt={`${schoolName} Logo`} 
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                        )}
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-foreground glow-text">
                                {isGlobalView ? "Global Command Center" : `${schoolName} Overview`}
                            </h2>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-muted-foreground">
                                    {isGlobalView
                                        ? "Aggregated metrics across all campuses."
                                        : "Real-time campus performance metrics."}
                                </p>
                                {session && (
                                    <span className="hidden md:inline-flex items-center rounded-md bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20">
                                        {session.session} • {session.term}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                <div className="w-full md:w-[300px]">
                        <GlobalCampusSwitcher
                            tenants={tenants}
                            currentTenantSlug={isGlobalView ? 'global' : subdomain}
                        />
                    </div>
                </div>

                {isPilot && <PilotBanner smsBalance={smsBalance} />}

                {/* Metrics Grid - Enhanced with Glassmorphism */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    <MetricCard
                        id="revenue-card"
                        title="Total Revenue"
                        value={<FinancialText value={new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(stats?.totalRevenue || 0)} />}
                        icon={NairaIcon}
                        trend={{
                            value: stats?.finance?.revenueTrend || "+0%",
                            positive: !(stats?.finance?.revenueTrend?.startsWith('-'))
                        }}
                        accentColor="emerald"
                    />
                    <MetricCard
                        title={isGlobalView ? "Total Students" : "Active Students"}
                        value={(stats?.totalStudents || 0).toString()}
                        icon={Users}
                        trend={{
                            value: stats?.studentTrend || "+0%",
                            positive: !(stats?.studentTrend?.startsWith('-'))
                        }}
                        accentColor="blue"
                    />
                    <MetricCard
                        id="staff-attendance-gauge"
                        title={isGlobalView ? "Total Staff" : "Teaching Staff"}
                        value={(stats?.totalTeachers || 0).toString()}
                        icon={isGlobalView ? GraduationCap : School}
                        description={isGlobalView ? "Including admin & support" : "Full-time & Part-time"}
                        accentColor="purple"
                    />
                    <MetricCard
                        title={isGlobalView ? "Active Campuses" : "Active Classes"}
                        value={(stats?.totalClasses || 0).toString()}
                        icon={isGlobalView ? School : Activity}
                        description={isGlobalView ? "Operational locations" : "Across 3 arms"}
                        accentColor="amber"
                    />
                </div>

                {/* Quick Actions (Tour Targets) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                        href="/dashboard/logistics"
                        className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl hover:bg-blue-500/20 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Bus className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Safe-Route Transport Hub</h3>
                                <p className="text-[10px] text-muted-foreground">Initialize manifests & track fleet</p>
                            </div>
                        </div>
                        <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-400 transition-colors" />
                    </Link>
                    <div className="flex justify-end items-center">
                        <NudgeButton />
                    </div>
                </div>

                {/* Charts & Details */}
                <div className="grid gap-6 md:grid-cols-7 items-start">
                    <div className="col-span-4 lg:col-span-5">
                        {isGlobalView ? (
                            <Card className="bg-card text-card-foreground/50 border-border h-[400px]">
                                <CardHeader>
                                    <CardTitle className="text-foreground">Global Revenue Trend</CardTitle>
                                </CardHeader>
                                <CardContent className="h-[320px] flex items-center justify-center text-muted-foreground border border-dashed border-border rounded-lg mx-6 mb-4">
                                    Global Financial Chart Placeholder
                                </CardContent>
                            </Card>
                        ) : (
                            <OverviewChart data={stats?.charts?.revenue || []} />
                        )}
                    </div>
                    <div className="col-span-3 lg:col-span-2">
                        {isGlobalView ? (
                            <Card className="bg-card text-card-foreground/50 border-border h-full">
                                <CardHeader>
                                    <CardTitle className="text-foreground">Campus Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {globalStats?.campuses.map((campus: any) => (
                                        <div key={campus.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{campus.name}</p>
                                                    <p className="text-xs text-muted-foreground">{campus.studentCount} Students</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-foreground"><FinancialText value={`₦${(campus.revenue / 1000000).toFixed(1)}M`} /></p>
                                                <p className="text-xs text-emerald-400">Active</p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ) : (
                            <DemographicsChart data={stats?.charts?.demographics || []} />
                        )}
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="grid gap-6 md:grid-cols-2 items-start">
                    <div className="overflow-hidden">
                        <RecentActivity data={stats?.recentActivity} />
                    </div>

                    <div className="space-y-6">
                        {/* Revenue Recovery Hub (Pilot/Premium Proof) */}
                        {(tier === 'pilot' || tier === 'platinum') && (
                            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden h-full">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-lg bg-emerald-500/10">
                                        <Activity className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground">Revenue Recovery Hub</h3>
                                        <p className="text-[10px] text-muted-foreground">Lost Efficiency Analysis</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-black/40 border border-border/50">
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Estimated Leakage Prevented</p>
                                        <p className="text-2xl font-black text-emerald-400 mt-1"><FinancialText value={`₦${(stats?.finance?.revenueLeakage || 0).toLocaleString()}`} /></p>
                                        <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                                                style={{ width: `${stats?.finance?.recoveryRate || 0}%` }}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-300 italic leading-relaxed">
                                        &quot;Our Forensic Audit logs detected identifying {stats?.finance?.orphanedFeesCount || 0} orphaned fee records. Automated recovery notifications are ready to deploy.&quot;
                                    </p>

                                </div>
                            </div>
                        )}

                        {/* Standard Premium Module with Soft-Lock */}
                        <LockedGenericWidget tier={tier} requiredTier="platinum" message="Dormitory management requires the Platinum Institutional expansion.">
                            <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-xl p-8 relative overflow-hidden group h-full">
                                <div className="absolute top-0 right-0 p-4">
                                    <div className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-400 text-[10px] font-mono">PREMIUM MODULE</div>
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold text-foreground mb-2">Dorm-Master Pro</h3>
                                    <p className="text-muted-foreground text-sm mb-6">Real-time hostel occupancy and warden logs.</p>

                                    <div className="space-y-3">
                                        {[
                                            { label: 'Total Occupancy', val: `${stats?.hostel?.occupancyRate || 0}%`, color: 'bg-emerald-500' },
                                            { label: 'Maintenance Alerts', val: `${stats?.hostel?.maintenanceAlerts || 0} Active`, color: 'bg-amber-500' }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50">
                                                <span className="text-xs text-muted-foreground">{item.label}</span>
                                                <span className={`text-xs font-bold ${item.color.replace('bg-', 'text-')}`}>{item.val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors" />
                            </div>
                        </LockedGenericWidget>
                    </div>
                </div>
                <OnboardingGuide subdomain={subdomain} />
            </div>
        </DashboardModalProvider>
    )
}
