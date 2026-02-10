"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    MessageSquare,
    Send,
    Download,
    Wallet,
    Loader2,
    Filter,
    MoreHorizontal
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getDebtorsList, sendPaymentReminder } from "@/lib/actions/collections"
import { exportDebtorsReport } from "@/lib/actions/export-debtors"
import { ManualPaymentModal } from "@/components/finance/manual-payment-modal"
import { toast } from "sonner"

export function DebtorsTab({ initialData, sessions }: { initialData: any[], sessions: any[] }) {
    const [data, setData] = useState(initialData)
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<'pending' | 'partial' | 'all'>('all')

    const refreshData = async () => {
        setLoading(true)
        const results = await getDebtorsList({ query: search, status: statusFilter === 'all' ? undefined : statusFilter })
        setData(results)
        setLoading(false)
    }

    const handleExport = async () => {
        toast.loading("Generating debtors report...")
        const result = await exportDebtorsReport()
        toast.dismiss()

        if (result.success && result.csv) {
            const blob = new Blob([result.csv], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = result.filename || 'debtors_report.csv'
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            toast.success("List downloaded successfully")
        } else {
            toast.error(result.error || "Failed to download list")
        }
    }

    const handleSendReminder = async (id: string, channel: 'sms' | 'whatsapp') => {
        toast.promise(sendPaymentReminder(id, channel), {
            loading: `Sending ${channel} reminder...`,
            success: "Reminder sent successfully!",
            error: "Failed to send reminder"
        })
    }

    return (
        <div className="space-y-4">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search student, parent phone or ID..."
                        className="pl-9 bg-slate-900 border-white/10 text-white focus:ring-[var(--school-accent)]"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && refreshData()}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button variant="outline" className="bg-slate-900 border-white/10 text-slate-300" onClick={refreshData}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                    </Button>
                    <ManualPaymentModal onSuccess={refreshData} />
                    <Button variant="outline" className="bg-slate-900 border-white/10 text-slate-300" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Debtors Table */}
            <Card className="bg-slate-900 border-white/5 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-800/50">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-slate-400">Student</TableHead>
                            <TableHead className="text-slate-400">Class</TableHead>
                            <TableHead className="text-slate-400">Amount</TableHead>
                            <TableHead className="text-slate-400">Paid</TableHead>
                            <TableHead className="text-slate-400">Balance</TableHead>
                            <TableHead className="text-slate-400">Status</TableHead>
                            <TableHead className="text-right text-slate-400">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row) => (
                            <TableRow key={row.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                <TableCell>
                                    <div>
                                        <p className="font-medium text-slate-200">{row.studentName}</p>
                                        <p className="text-[10px] text-slate-500">ID: {row.studentId || "N/A"}</p>
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-300">{row.className}</TableCell>
                                <TableCell className="text-slate-300">₦{row.amount.toLocaleString()}</TableCell>
                                <TableCell className="text-emerald-400">₦{row.paid.toLocaleString()}</TableCell>
                                <TableCell className="text-rose-400 font-bold">₦{row.balance.toLocaleString()}</TableCell>
                                <TableCell>
                                    <Badge variant={row.status === 'partial' ? 'outline' : 'destructive'}
                                        className={row.status === 'partial' ? "border-amber-500/50 text-amber-500" : ""}>
                                        {row.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-slate-200">
                                            <DropdownMenuItem onClick={() => handleSendReminder(row.id, 'whatsapp')}>
                                                <MessageSquare className="h-4 w-4 mr-2 text-emerald-500" />
                                                WhatsApp Reminder
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleSendReminder(row.id, 'sms')}>
                                                <Send className="h-4 w-4 mr-2 text-blue-500" />
                                                SMS Reminder
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-rose-400">
                                                Flag as Invalid
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {data.length === 0 && (
                    <div className="p-12 text-center">
                        <Wallet className="h-12 w-12 text-slate-800 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-400">No Debtors Found</h3>
                        <p className="text-sm text-slate-600">Try adjusting your filters or search query.</p>
                    </div>
                )}
            </Card>
        </div>
    )
}
