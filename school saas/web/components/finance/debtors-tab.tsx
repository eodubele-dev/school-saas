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
import { getDebtorsList, sendPaymentReminder, flagInvoiceAsInvalid } from "@/lib/actions/collections"
import { exportDebtorsReport } from "@/lib/actions/export-debtors"
import { ManualPaymentModal } from "@/components/finance/manual-payment-modal"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

export function DebtorsTab({ initialData, sessions }: { initialData: any[], sessions: any[] }) {
    const [data, setData] = useState(initialData)
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<'pending' | 'partial' | 'all'>('all')
    const [invalidatingId, setInvalidatingId] = useState<string | null>(null)

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    const refreshData = async (overrideQuery?: string) => {
        setLoading(true)
        const currentQuery = overrideQuery !== undefined ? overrideQuery : search
        const results = await getDebtorsList({ query: currentQuery, status: statusFilter === 'all' ? undefined : statusFilter })
        setData(results)
        setCurrentPage(1) // Reset to first page on new search
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

    const handleFlagInvalid = async (id: string) => {
        toast.promise(flagInvoiceAsInvalid(id), {
            loading: "Flagging invoice as invalid...",
            success: () => {
                refreshData()
                return "Invoice invalidated"
            },
            error: "Failed to update invoice"
        })
    }

    // Pagination Logic
    const totalPages = Math.ceil(data.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedData = data.slice(startIndex, startIndex + itemsPerPage)

    return (
        <div className="space-y-4">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search student, parent phone or ID..."
                        className="pl-9 bg-card text-card-foreground border-border text-foreground focus:ring-[var(--school-accent)]"
                        value={search}
                        onChange={(e) => {
                            const val = e.target.value
                            setSearch(val)
                            if (val === '') refreshData('')
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && refreshData()}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button variant="outline" className="bg-card text-card-foreground border-border text-slate-300" onClick={() => refreshData()}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                    </Button>
                    <ManualPaymentModal onSuccess={refreshData} />
                    <Button variant="outline" className="bg-card text-card-foreground border-border text-slate-300" onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Debtors Table */}
            <Card className="bg-card text-card-foreground border-border/50 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-800/50">
                        <TableRow className="border-border/50 hover:bg-transparent">
                            <TableHead className="text-muted-foreground">Student</TableHead>
                            <TableHead className="text-muted-foreground">Class</TableHead>
                            <TableHead className="text-muted-foreground">Amount</TableHead>
                            <TableHead className="text-muted-foreground">Paid</TableHead>
                            <TableHead className="text-muted-foreground">Balance</TableHead>
                            <TableHead className="text-muted-foreground">Term</TableHead>
                            <TableHead className="text-muted-foreground">Status</TableHead>
                            <TableHead className="text-right text-muted-foreground">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.map((row) => (
                            <TableRow key={row.id} className="border-border/50 hover:bg-secondary/50 transition-colors">
                                <TableCell>
                                    <div>
                                        <p className="font-medium text-slate-200">{row.studentName}</p>
                                        <p className="text-[10px] text-muted-foreground">ID: {row.studentId || "N/A"}</p>
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-300">{row.className}</TableCell>
                                <TableCell className="text-slate-300">₦{row.amount.toLocaleString()}</TableCell>
                                <TableCell className="text-emerald-400">₦{row.paid.toLocaleString()}</TableCell>
                                <TableCell className="text-rose-400 font-bold">₦{row.balance.toLocaleString()}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 whitespace-nowrap">
                                        {row.term || 'Unknown Term'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={row.status === 'partial' ? 'outline' : 'destructive'}
                                        className={row.status === 'partial' ? "border-amber-500/50 text-amber-500" : ""}>
                                        {row.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="icon" className="h-8 w-8 bg-slate-800 border-border text-slate-200 hover:bg-slate-700 hover:text-foreground">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-card text-card-foreground border-border text-slate-200">
                                            <DropdownMenuItem onClick={() => handleSendReminder(row.id, 'whatsapp')}>
                                                <MessageSquare className="h-4 w-4 mr-2 text-emerald-500" />
                                                WhatsApp Reminder
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleSendReminder(row.id, 'sms')}>
                                                <Send className="h-4 w-4 mr-2 text-blue-500" />
                                                SMS Reminder
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-rose-400" onClick={() => setInvalidatingId(row.id)}>
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
                        <h3 className="text-lg font-medium text-muted-foreground">No Debtors Found</h3>
                        <p className="text-sm text-slate-600">Try adjusting your filters or search query.</p>
                    </div>
                )}
            </Card>

            {/* Pagination Controls */}
            {data.length > 0 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
                    <div>
                        Showing <span className="text-foreground font-medium">{startIndex + 1}</span> to <span className="text-foreground font-medium">{Math.min(startIndex + itemsPerPage, data.length)}</span> of <span className="text-foreground font-medium">{data.length}</span> students
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-card text-card-foreground border-border hover:bg-slate-800 text-slate-300"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <div className="flex items-center px-4 bg-card text-card-foreground border border-border rounded-md text-slate-300">
                            Page {currentPage} of {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-card text-card-foreground border-border hover:bg-slate-800 text-slate-300"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}

            <AlertDialog open={!!invalidatingId} onOpenChange={(open) => !open && setInvalidatingId(null)}>
                <AlertDialogContent className="bg-card text-card-foreground border-border text-slate-200">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Flag Invoice as Invalid?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            This action cannot be undone. This will permanently remove the debtor from the pending collection list and mark the invoice as cancelled.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-border hover:bg-secondary/50 hover:text-foreground">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => {
                            if (invalidatingId) handleFlagInvalid(invalidatingId)
                            setInvalidatingId(null)
                        }} className="bg-rose-600 hover:bg-rose-700 text-foreground border border-rose-600">
                            Flag as Invalid
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
