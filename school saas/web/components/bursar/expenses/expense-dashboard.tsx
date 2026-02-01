"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, TrendingDown, Wallet, Loader2, Download, PieChart as PieIcon } from "lucide-react"
import { AddExpenseModal } from "./add-expense-modal"
import { getFinancialSummary, getExpenseAnalytics } from "@/lib/actions/expenses"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts"
import Link from "next/link"

export function ExpenseDashboard() {
    const [loading, setLoading] = useState(true)
    const [summary, setSummary] = useState<any>(null)
    const [chartData, setChartData] = useState<any[]>([])

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const [sumRes, chartRes] = await Promise.all([
            getFinancialSummary(),
            getExpenseAnalytics()
        ])

        if (sumRes.success) setSummary(sumRes.data)
        if (chartRes.success) setChartData(chartRes.data)

        setLoading(false)
    }

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-500" /></div>

    const netIsPositive = (summary?.net || 0) >= 0

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Expense & P&L Tracker</h2>
                    <p className="text-sm text-slate-400">Monitor flow, track expenses, and view real-time profitability.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-white/10 text-slate-300 hover:text-white">
                        <Download className="h-4 w-4 mr-2" />
                        Export P&L
                    </Button>
                    <AddExpenseModal onSuccess={loadData}>
                        <Button className="bg-[hsl(var(--school-accent))] hover:opacity-90 text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Record Expense
                        </Button>
                    </AddExpenseModal>
                </div>
            </div>

            {/* P&L Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-900 border-white/5 p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl">
                            <TrendingUp className="h-6 w-6 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Total Inflow</p>
                            <h3 className="text-2xl font-bold text-white font-mono">₦{summary?.inflow.toLocaleString()}</h3>
                        </div>
                    </div>
                </Card>

                <Card className="bg-slate-900 border-white/5 p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-500/10 rounded-xl">
                            <TrendingDown className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Total Outflow</p>
                            <h3 className="text-2xl font-bold text-white font-mono">₦{summary?.outflow.toLocaleString()}</h3>
                            <div className="text-xs text-slate-500 mt-1">
                                Exp: ₦{summary?.breakdown?.expenses.toLocaleString()} | Pay: ₦{summary?.breakdown?.payroll.toLocaleString()}
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className={`bg-slate-900 border-white/5 p-6 relative overflow-hidden`}>
                    <div className={`absolute top-0 right-0 p-20 rounded-full blur-3xl opacity-10 ${netIsPositive ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className={`p-3 rounded-xl ${netIsPositive ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                            <Wallet className={`h-6 w-6 ${netIsPositive ? 'text-emerald-500' : 'text-red-500'}`} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Net Position</p>
                            <h3 className={`text-2xl font-bold font-mono ${netIsPositive ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]'}`}>
                                {netIsPositive ? '+' : ''}₦{summary?.net.toLocaleString()}
                            </h3>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <Card className="lg:col-span-1 bg-slate-900 border-white/5 p-6 h-[400px] flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <PieIcon className="h-4 w-4 text-slate-400" />
                        Spending by Category
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(value: number) => `₦${value.toLocaleString()}`}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                                No expense data yet
                            </div>
                        )}
                    </div>
                </Card>

                {/* Recent Transactions Placeholder */}
                <Card className="lg:col-span-2 bg-slate-900 border-white/5 p-6 h-[400px]">
                    <h3 className="text-lg font-bold text-white mb-6">Recent Outflows</h3>
                    <div className="space-y-4">
                        {/* We could fetch recent expenses here, keeping it static for now as requested focus is P&L */}
                        <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                            Transaction list is empty.
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
