import { Users, School, Activity, TrendingUp, TrendingDown, Zap, GraduationCap, CreditCard, ArrowUpRight } from "lucide-react"
import { NairaIcon } from "@/components/ui/naira-icon"
import { getAdminStats } from "@/lib/actions/dashboard"
import { MetricCard } from "./metric-card"
import { OverviewChart } from "./overview-chart"
import { RecentActivity } from "./recent-activity"
import { DemographicsChart } from "./demographics-chart"
import { NudgeButton } from "./nudge-button"
import { getGlobalStats, getTenants } from "@/lib/actions/global"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { LockedWidget } from "./locked-widget"
import { LockedSMSWidget } from "./locked-sms-widget"
import { LockedGenericWidget } from "./locked-generic-widget"
import { TierManager } from "./tier-manager"
import { SMSWalletTopupButton } from "./sms-wallet-topup-button"
import { GlobalCampusSwitcher } from "./global-campus-switcher"

export async function AdminDashboard({
    tier = 'starter',
    isPilot = false,
    smsBalance = 0,
    schoolName = '',
    subdomain = '',
    isGlobalView = false // New prop
}: {
    tier?: string,
    isPilot?: boolean,
    smsBalance?: number,
    schoolName?: string,
    subdomain?: string,
    isGlobalView?: boolean
}) {
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

    const isStarter = tier.toLowerCase() === 'starter'

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header / Switcher Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white glow-text">
                        {isGlobalView ? "Global Command Center" : `${schoolName} Overview`}
                    </h2>
                    <p className="text-slate-400">
                        {isGlobalView
                            ? "Aggregated metrics across all campuses."
                            : "Real-time campus performance metrics."}
                    </p>
                </div>
                <div className="w-full md:w-[300px]">
                    <GlobalCampusSwitcher
                        tenants={tenants}
                        currentTenantSlug={isGlobalView ? 'global' : subdomain}
                    />
                </div>
            </div>

            {isPilot && (
                <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl relative overflow-hidden group">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center animate-pulse">
                            <Activity className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">Lagos Pilot Mode Active</span>
                                <span className="px-2 py-0.5 rounded bg-emerald-500 text-black text-[10px] font-black uppercase">Term 1 Free</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">Full ecosystem access enabled. System integrity logs: <span className="text-emerald-400 font-mono italic text-[10px]">VERIFIED</span></p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">SMS Wallet</p>
                            <p className={`text-sm font-black ${smsBalance < 2000 ? 'text-amber-400' : 'text-emerald-400'}`}>₦{smsBalance.toLocaleString()}</p>
                        </div>
                        {smsBalance < 2000 && (
                            <SMSWalletTopupButton />
                        )}
                    </div>

                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                </div>
            )}

            {/* Metrics Grid - Enhanced with Glassmorphism */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    id="revenue-card"
                    title="Total Revenue"
                    value={new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(stats?.totalRevenue || 0)}
                    icon={NairaIcon}
                    trend={{ value: "+12%", positive: true }}
                />
                <MetricCard
                    title={isGlobalView ? "Total Students" : "Active Students"}
                    value={(stats?.totalStudents || 0).toString()}
                    icon={Users}
                    trend={{ value: "+4%", positive: true }}
                />
                <MetricCard
                    id="staff-attendance-gauge"
                    title={isGlobalView ? "Total Staff" : "Teaching Staff"}
                    value={(stats?.totalTeachers || 0).toString()}
                    icon={isGlobalView ? GraduationCap : School}
                    description={isGlobalView ? "Including admin & support" : "Full-time & Part-time"}
                />
                <MetricCard
                    title={isGlobalView ? "Active Campuses" : "Active Classes"}
                    value={(stats?.totalClasses || 0).toString()}
                    icon={isGlobalView ? School : Activity}
                    description={isGlobalView ? "Operational locations" : "Across 3 arms"}
                />
            </div>

            {/* Quick Actions (Tour Targets) */}
            <div className="flex justify-end">
                <NudgeButton />
            </div>

            {/* Charts & Details */}
            <div className="grid gap-6 md:grid-cols-7 items-start">
                <div className="col-span-4 lg:col-span-5">
                    {isGlobalView ? (
                        <Card className="bg-slate-900/50 border-white/10 h-[400px]">
                            <CardHeader>
                                <CardTitle className="text-white">Global Revenue Trend</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[320px] flex items-center justify-center text-slate-500 border border-dashed border-white/10 rounded-lg mx-6 mb-4">
                                Global Financial Chart Placeholder
                            </CardContent>
                        </Card>
                    ) : (
                        <OverviewChart />
                    )}
                </div>
                <div className="col-span-3 lg:col-span-2">
                    {isGlobalView ? (
                        <Card className="bg-slate-900/50 border-white/10 h-full">
                            <CardHeader>
                                <CardTitle className="text-white">Campus Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {globalStats?.campuses.map((campus: any) => (
                                    <div key={campus.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            <div>
                                                <p className="text-sm font-medium text-white">{campus.name}</p>
                                                <p className="text-xs text-slate-400">{campus.studentCount} Students</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-white">₦{(campus.revenue / 1000000).toFixed(1)}M</p>
                                            <p className="text-xs text-emerald-400">Active</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ) : (
                        <DemographicsChart />
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
                        <LockedSMSWidget
                            tier={smsBalance > 0 ? 'platinum' : 'starter'}
                            message="Funding required to resume automated revenue recovery nudges."
                        >
                            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-lg bg-emerald-500/10">
                                        <Activity className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white">Revenue Recovery Hub</h3>
                                        <p className="text-[10px] text-slate-400">Lost Efficiency Analysis</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Estimated Leakage Prevented</p>
                                        <p className="text-2xl font-black text-emerald-400 mt-1">₦2,450,000</p>
                                        <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 w-[65%]" />
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-slate-300 italic leading-relaxed">
                                        &quot;Our Forensic Audit logs detected identifying 16 orphaned fee records. Automated recovery notifications are ready to deploy.&quot;
                                    </p>
                                    {smsBalance < 2000 && (
                                        <div className="flex items-center gap-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                            <Zap className="h-3 w-3 text-amber-500" />
                                            <p className="text-[10px] text-amber-500 font-bold uppercase">
                                                {smsBalance <= 0 ? "SMS Wallet Empty: Operations Halted" : "SMS Wallet Low: Recovery Nudges Paused"}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </LockedSMSWidget>
                    )}

                    {/* Standard Premium Module with Soft-Lock */}
                    <LockedGenericWidget tier={tier} requiredTier="platinum" message="Dormitory management requires the Platinum Institutional expansion.">
                        <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-xl p-8 relative overflow-hidden group h-full">
                            <div className="absolute top-0 right-0 p-4">
                                <div className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-400 text-[10px] font-mono">PREMIUM_MODULE</div>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-white mb-2">Dorm-Master Pro</h3>
                                <p className="text-slate-400 text-sm mb-6">Real-time hostel occupancy and warden logs.</p>

                                <div className="space-y-3">
                                    {[
                                        { label: 'Total Occupancy', val: '88%', color: 'bg-emerald-500' },
                                        { label: 'Maintenance Alerts', val: '3 Active', color: 'bg-amber-500' }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                            <span className="text-xs text-slate-400">{item.label}</span>
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
        </div>
    )
}
