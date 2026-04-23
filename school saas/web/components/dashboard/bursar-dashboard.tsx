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
import { exportMonthlyFinanceReport } from "@/lib/actions/export-finance"
import { toast } from "sonner"
import { FinancialText } from "@/components/ui/financial-text"

function MetricCard({ title, amount, subtitle, icon: Icon, trend, colorClass }: any) {
    return (
        <Card className="bg-card text-card-foreground border-border relative overflow-hidden group pt-2">
            {/* 🌈 Thick Top Border Action */}
            <div className={cn("absolute top-0 left-0 right-0 h-1.5", colorClass)} />

            <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -mr-12 -mt-12 opacity-10 transition-opacity group-hover:opacity-20", colorClass)}></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{title}</CardTitle>
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center border transition-all duration-300 group-hover:scale-110",
                    colorClass.replace('bg-', 'bg-').concat('/10'),
                    colorClass.replace('bg-', 'text-').replace('500', '400'),
                    colorClass.replace('bg-', 'border-').concat('/20')
                )}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-black text-foreground tracking-tighter"><FinancialText value={`₦${amount.toLocaleString()}`} /></div>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{subtitle}</p>
                    {trend && (
                        <span className="text-[10px] px-1.5 py-0.5 font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
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
        <Card className="bg-card text-card-foreground border-border h-full flex flex-col justify-center items-center p-6">
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
                    <span className="text-xl font-bold text-foreground">{percentage}%</span>
                    <p className="text-[10px] text-muted-foreground leading-none">Collected</p>
                </div>
            </div>
            <p className="mt-4 text-xs font-medium text-muted-foreground">Collection Rate</p>
        </Card>
    )
}

export function BursarDashboard({ stats, tier = 'starter' }: { stats: any; tier?: string }) {
    const { metrics, recentTransactions, chartData, term } = stats

    const handleExport = async () => {
        toast.loading("Generating finance report...")
        const result = await exportMonthlyFinanceReport()
        toast.dismiss()

        if (result.success && result.csv) {
            const blob = new Blob([result.csv], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = result.filename || 'finance_report.csv'
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            toast.success("Report downloaded successfully")
        } else {
            toast.error(result.error || "Failed to generate report")
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* 🔔 Real-Time Payment Alert (Demo Injection for Platinum Showcase) */}
            {stats.recentTransactions.length > 0 && (
                <div className="mb-6">
                    <BursarPaymentAlert
                        transactions={stats.recentTransactions.slice(0, 5).map((tx: any) => ({
                            id: tx.id,
                            timestamp: "Just Now",
                            total: tx.amount,
                            familyName: tx.students?.full_name?.split(' ').pop() || 'Parent',
                            items: [
                                { student: tx.students?.full_name || 'Unknown Student', category: "Tuition & Fees", amount: tx.amount }
                            ]
                        }))}
                    />
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Bursar Command Center</h1>
                    <p className="text-muted-foreground text-sm">Financial overview for <span className="text-[var(--school-accent)] font-medium">{term}</span></p>
                </div>
                <div className="flex items-center gap-2">
                    {/* SMS Status for Bursar */}
                    {(stats.smsBalance !== undefined) && (
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${stats.smsBalance < 400 ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-secondary/50 border-border text-muted-foreground'}`}>
                            <Zap className={`h-3.5 w-3.5 ${stats.smsBalance < 400 ? 'fill-current' : ''}`} />
                            <span className="text-[10px] font-bold uppercase tracking-tight">Wallet: {stats.smsBalance.toLocaleString()} Units</span>
                        </div>
                    )}
                    <Button variant="outline" size="sm" onClick={handleExport} className="bg-card text-card-foreground border-border text-slate-300 hover:bg-slate-800 hover:text-foreground">
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
                    trend={metrics.collectionTrend}
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
                <Card className="lg:col-span-2 bg-card text-card-foreground border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground text-base">Collections Trend (30 Days)</CardTitle>
                        <CardDescription className="text-muted-foreground">Daily revenue accumulation</CardDescription>
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
                <div className="flex flex-col gap-6">
                    {/* Recent Transactions */}
                    <Card className="flex-1 overflow-hidden bg-card text-card-foreground border-border flex flex-col min-h-[250px]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-foreground text-base">Recent Payments</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {recentTransactions.length > 0 ? (
                                <div className="divide-y divide-white/5">
                                    {recentTransactions.map((trx: any) => (
                                        <div key={trx.id} className="p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                                    <Receipt className="h-4 w-4 text-emerald-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-200">{trx.students?.full_name}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase">{trx.method} • {formatDate(trx.date)}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-foreground"><FinancialText value={`₦${trx.amount.toLocaleString()}`} /></p>
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
                                    <p className="text-xs text-muted-foreground">No recent transactions</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Tools */}
                    <Card className="shrink-0 bg-card text-card-foreground border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-foreground text-base">Quick Reports</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link href="/dashboard/bursar/finance/collections" className="block w-full">
                                <div className="p-3 rounded-lg bg-secondary/50 border border-border/50 hover:border-border hover:bg-white/10 transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-md bg-rose-500/10 flex items-center justify-center">
                                            <FileText className="h-4 w-4 text-rose-500" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-200">Debtors List</span>
                                    </div>
                                    <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </Link>
                            <Link href="/dashboard/bursar/finance/reconciliation" className="block w-full">
                                <div className="p-3 rounded-lg bg-secondary/50 border border-border/50 hover:border-border hover:bg-white/10 transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-md bg-amber-500/10 flex items-center justify-center">
                                            <Zap className="h-4 w-4 text-amber-500" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-200">Live Oversight</span>
                                    </div>
                                    <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </Link>
                            <Link href="/dashboard/bursar/finance/audit" className="block w-full">
                                <div className="p-3 rounded-lg bg-secondary/50 border border-border/50 hover:border-border hover:bg-white/10 transition-all flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-md bg-cyan-500/10 flex items-center justify-center">
                                            <ShieldAlert className="h-4 w-4 text-cyan-500" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-200">Audit Transcript</span>
                                    </div>
                                    <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
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
