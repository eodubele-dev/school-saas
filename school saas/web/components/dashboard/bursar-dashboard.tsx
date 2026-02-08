"use client"

import { cn, formatDate } from "@/lib/utils"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    TrendingUp,
    Clock,
    PieChart,
    ArrowUpRight,
    Receipt,
    FileText,
    Download,
    PlusCircle,
    MoreHorizontal,
    Zap,
    ShieldAlert
} from "lucide-react"
import { NairaIcon } from "@/components/ui/naira-icon"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart
} from "recharts"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ManualPaymentModal } from "@/components/finance/manual-payment-modal"
import { SMSTransactionWidget } from "@/components/dashboard/sms-transaction-widget"
import { BursarPaymentAlert } from "@/components/bursar/payment-alert"

function MetricCard({ title, amount, subtitle, icon: Icon, trend, colorClass }: any) {
    return (
        <Card className="bg-slate-900 border-white/10 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -mr-12 -mt-12 opacity-10 ${colorClass}`}></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
                <Icon className={`h-4 w-4 ${colorClass.replace('bg-', 'text-')}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-white">₦{amount.toLocaleString()}</div>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-slate-500">{subtitle}</p>
                    {trend && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {trend}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

function CircularRate({ percentage }: { percentage: number }) {
    const radius = 35
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (percentage / 100) * circumference

    return (
        <Card className="bg-slate-900 border-white/10 h-full flex flex-col justify-center items-center p-6">
            <div className="relative inline-flex items-center justify-center">
                <svg width="100" height="100" className="transform -rotate-90">
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="8"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke="var(--school-accent)"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                        style={{ filter: 'drop-shadow(0 0 4px var(--school-accent))' }}
                    />
                </svg>
                <div className="absolute text-center">
                    <span className="text-xl font-bold text-white">{percentage}%</span>
                    <p className="text-[10px] text-slate-500 leading-none">Collected</p>
                </div>
            </div>
            <p className="mt-4 text-xs font-medium text-slate-400">Collection Rate</p>
        </Card>
    )
}

export function BursarDashboard({ stats, tier = 'starter' }: { stats: any; tier?: string }) {
    const { metrics, recentTransactions, chartData, term } = stats

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* 🔔 Real-Time Payment Alert (Demo Injection for Platinum Showcase) */}
            {stats.recentTransactions.length > 0 && (
                <div className="mb-6">
                    <BursarPaymentAlert
                        transaction={{
                            timestamp: "Now",
                            total: stats.recentTransactions[0].amount,
                            familyName: stats.recentTransactions[0].students.full_name.split(' ').pop() || 'Parent',
                            items: [
                                { student: stats.recentTransactions[0].students.full_name, category: "Tuition & Fees", amount: stats.recentTransactions[0].amount }
                            ]
                        }}
                    />
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Bursar Command Center</h1>
                    <p className="text-slate-400 text-sm">Financial overview for <span className="text-[var(--school-accent)] font-medium">{term}</span></p>
                </div>
                <div className="flex items-center gap-2">
                    {/* SMS Status for Bursar */}
                    {(stats.smsBalance !== undefined) && (
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${stats.smsBalance < 2000 ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                            <Zap className={`h-3.5 w-3.5 ${stats.smsBalance < 2000 ? 'fill-current' : ''}`} />
                            <span className="text-[10px] font-bold uppercase tracking-tight">Wallet: ₦{stats.smsBalance.toLocaleString()}</span>
                        </div>
                    )}
                    <Button variant="outline" size="sm" className="bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white">
                        <Download className="h-4 w-4 mr-2" /> Export Monthly
                    </Button>
                    <ManualPaymentModal onSuccess={() => window.location.reload()} />
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Revenue Expected"
                    amount={metrics.totalExpected}
                    subtitle="Term Total"
                    icon={NairaIcon}
                    colorClass="bg-blue-500"
                />
                <MetricCard
                    title="Total Collected"
                    amount={metrics.totalCollected}
                    subtitle="Live Payments"
                    icon={TrendingUp}
                    trend="+12%"
                    colorClass="bg-emerald-500"
                />
                <MetricCard
                    title="Outstanding Balance"
                    amount={metrics.outstanding}
                    subtitle="Pending Debt"
                    icon={Clock}
                    colorClass="bg-red-500"
                />
                <CircularRate percentage={metrics.collectionRate} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Collection Trend Chart */}
                <Card className="lg:col-span-2 bg-slate-900 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white text-base">Collections Trend (30 Days)</CardTitle>
                        <CardDescription className="text-slate-500">Daily revenue accumulation</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--school-accent)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--school-accent)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#475569"
                                    fontSize={10}
                                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                />
                                <YAxis stroke="#475569" fontSize={10} tickFormatter={(val) => `₦${val / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                                    itemStyle={{ color: 'var(--school-accent)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="var(--school-accent)"
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Quick Actions & Recent Transactions */}
                <div className="space-y-6">
                    {/* Recent Transactions */}
                    <Card className="bg-slate-900 border-white/10 h-full">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-white text-base">Recent Payments</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {recentTransactions.length > 0 ? (
                                <div className="divide-y divide-white/5">
                                    {recentTransactions.map((trx: any) => (
                                        <div key={trx.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                                    <Receipt className="h-4 w-4 text-emerald-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-200">{trx.students?.full_name}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase">{trx.method} • {formatDate(trx.date)}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-white">₦{trx.amount.toLocaleString()}</p>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ArrowUpRight className="h-3 w-3 text-[var(--school-accent)]" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-12 text-center">
                                    <Clock className="h-8 w-8 text-slate-800 mx-auto mb-2" />
                                    <p className="text-xs text-slate-500">No recent transactions</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Tools */}
                    <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white text-sm">Quick Reports</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-2">
                            <Link href="/dashboard/bursar/finance/collections" className="w-full">
                                <Button variant="ghost" className="h-16 w-full flex flex-col items-center justify-center gap-1 bg-white/5 border border-white/5 hover:border-[var(--school-accent)]/50">
                                    <FileText className="h-4 w-4 text-red-400" />
                                    <span className="text-[10px] text-slate-400">Debtors List</span>
                                </Button>
                            </Link>
                            <Link href="/dashboard/bursar/finance/reconciliation" className="w-full">
                                <Button variant="ghost" className="h-16 w-full flex flex-col items-center justify-center gap-1 bg-amber-500/5 border border-amber-500/10 hover:border-amber-500/50 group">
                                    <Zap className="h-4 w-4 text-amber-500 group-hover:animate-bounce" />
                                    <span className="text-[10px] text-amber-200/50 uppercase font-black tracking-widest">Live Oversight</span>
                                </Button>
                            </Link>
                            <Link href="/dashboard/bursar/finance/audit" className="w-full">
                                <Button variant="ghost" className="h-16 w-full flex flex-col items-center justify-center gap-1 bg-cyan-500/5 border border-cyan-500/10 hover:border-cyan-500/50 group">
                                    <ShieldAlert className="h-4 w-4 text-cyan-500 group-hover:animate-pulse" />
                                    <span className="text-[10px] text-cyan-200/50 uppercase font-black tracking-widest">Audit Transcript</span>
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* SMS Transaction Ledger (Full Width) */}
            <div className="mt-6">
                <SMSTransactionWidget transactions={stats.smsTransactions || []} />
            </div>
        </div>
    )
}
