/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getBursarStats, getClassRevenueStats, FinancialStats, ClassRevenue } from "@/lib/actions/bursar"
import { getDebtorStudents, generatePaystackLink } from "@/lib/actions/finance" // Fixed import
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { Loader2, Wallet, AlertCircle, MessageSquare } from "lucide-react"
import { NairaIcon } from "@/components/ui/naira-icon"
import { toast } from "sonner"

const COLORS = ['#10b981', '#f59e0b', '#64748b'];

export default function BursarAnalyticsPage() {
    const [stats, setStats] = useState<FinancialStats | null>(null)
    const [classRevenue, setClassRevenue] = useState<ClassRevenue[]>([])
    const [debtors, setDebtors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        const loadData = async () => {
            try {
                const [statsData, revenueData, debtorsData] = await Promise.all([
                    getBursarStats(),
                    getClassRevenueStats(),
                    getDebtorStudents("2023/2024", "1st Term")
                ])
                setStats(statsData)
                setClassRevenue(revenueData)
                setDebtors(debtorsData)
            } catch (e) {
                console.error(e)
                toast.error("Failed to load financial data")
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])


    const handleBulkWhatsApp = async () => {
        // Send to top 5 debtors for demo (to avoid opening too many tabs)
        const topDebtors = debtors.slice(0, 5)

        toast.info(`Generating ${topDebtors.length} payment links...`)

        for (const student of topDebtors) {
            const payLink = await generatePaystackLink(student.studentName, student.balance)
            const message = `Reminder: ₦${student.balance.toLocaleString()} outstanding. Pay here: ${payLink}`
            const url = `https://wa.me/?text=${encodeURIComponent(message)}`
            window.open(url, "_blank")
            await new Promise(r => setTimeout(r, 1000)) // Delay to prevent popup blocking
        }

        toast.success("Reminders queued!")
    }

    const filteredDebtors = debtors.filter(d =>
        d.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.className.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>

    return (
        <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50/50 min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Bursar Analytics</h2>
                    <p className="text-muted-foreground">Financial Overview & Recovery Console</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button className="bg-green-600 hover:bg-green-700" onClick={handleBulkWhatsApp}>
                        <MessageSquare className="mr-2 h-4 w-4" /> Bulk Remind (Top 5)
                    </Button>
                </div>
            </div>

            {/* Financial Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-l-slate-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Expected</CardTitle>
                        <Wallet className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">₦{stats?.totalExpected.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">For current session</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500 shadow-sm bg-emerald-50/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-600">Total Collected</CardTitle>
                        <NairaIcon className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-700">₦{stats?.totalReceived.toLocaleString()}</div>
                        <p className="text-xs text-emerald-600/80">
                            {stats?.totalExpected ? Math.round((stats.totalReceived / stats.totalExpected) * 100) : 0}% Recovery Rate
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500 shadow-sm bg-amber-50/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-600">Outstanding Balance</CardTitle>
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-700">₦{stats?.totalOutstanding.toLocaleString()}</div>
                        <p className="text-xs text-amber-600/80">Pending Collection</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Revenue by Class</CardTitle>
                        <CardDescription>Breakdown of collected fees across year groups.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={classRevenue}>
                                <XAxis dataKey="className" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `₦${value / 1000}k`}
                                />
                                <Tooltip
                                    formatter={(value: any) => [`₦${Number(value).toLocaleString()}`, 'Collected']}
                                    cursor={{ fill: 'transparent' }}
                                />
                                <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Payment Progress</CardTitle>
                        <CardDescription>Paid vs Outstanding Ratio</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Paid', value: stats?.totalReceived },
                                            { name: 'Outstanding', value: stats?.totalOutstanding }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        innerRadius={60}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell fill={COLORS[0]} />
                                        <Cell fill={COLORS[1]} />
                                    </Pie>
                                    <Tooltip formatter={(value: any) => `₦${Number(value).toLocaleString()}`} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Debtor List */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Debtors</CardTitle>
                    <div className="flex items-center justify-between">
                        <CardDescription>Students with outstanding balances {'>'} ₦0.</CardDescription>
                        <Input
                            placeholder="Search student or class..."
                            className="max-w-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredDebtors.slice(0, 50).map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-medium">{student.studentName}</TableCell>
                                    <TableCell>{student.className}</TableCell>
                                    <TableCell className="text-right font-bold text-amber-600">₦{student.balance.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                            onClick={async () => {
                                                const link = await generatePaystackLink(student.studentName, student.balance)
                                                window.open(link, "_blank")
                                            }}
                                        >
                                            Pay Link
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredDebtors.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        No debtors found matching your search.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
