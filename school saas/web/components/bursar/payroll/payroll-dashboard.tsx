"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Loader2, Download, RefreshCw, FileText, CheckCircle, DatabaseZap } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { generatePayrollRun, getPayrollRuns, getPayrollRunDetails, getPayrollReconciliationReport, getReconciledLedger, markPayrollRunCompleted } from "@/lib/actions/payroll"
import { generatePayslip } from "./payslip-generator"
import { SalaryStructureModal } from "./salary-structure-modal"
import { PayrollReconciliationReport } from "./payroll-reconciliation-report"
import { BursaryLedgerSync } from "./bursary-ledger-sync"
import { toast } from "sonner"
import { format } from "date-fns"

export function PayrollDashboard() {
    const [loading, setLoading] = useState(true)
    const [runs, setRuns] = useState<any[]>([])
    const [activeRunId, setActiveRunId] = useState<string | null>(null)
    const [activeRunDetails, setActiveRunDetails] = useState<any>(null)
    const [reconciliationData, setReconciliationData] = useState<any[]>([])
    const [ledgerData, setLedgerData] = useState<any[]>([])
    const [generating, setGenerating] = useState(false)
    const [disbursing, setDisbursing] = useState(false)

    // Form state for generation
    const [genMonth, setGenMonth] = useState(format(new Date(), 'MMMM'))
    const [genYear, setGenYear] = useState(new Date().getFullYear().toString())

    useEffect(() => {
        loadRuns()
    }, [])

    useEffect(() => {
        if (activeRunId) {
            loadRunDetails(activeRunId)
            loadLedger(activeRunId)
        }
        loadReconciliation()
    }, [activeRunId, genMonth, genYear])

    const loadRuns = async () => {
        const res = await getPayrollRuns()
        if (res.success && res.data) {
            setRuns(res.data)
            if (res.data.length > 0 && !activeRunId) {
                setActiveRunId(res.data[0].id)
            }
        }
        setLoading(false)
    }

    const loadRunDetails = async (id: string) => {
        const res = await getPayrollRunDetails(id)
        if (res.success) {
            setActiveRunDetails(res.data)
        }
    }

    const loadReconciliation = async () => {
        const res = await getPayrollReconciliationReport(genMonth, parseInt(genYear))
        if (res.success && res.data) {
            setReconciliationData(res.data)
        }
    }

    const loadLedger = async (id: string) => {
        const res = await getReconciledLedger(id)
        if (res.success && res.data) {
            setLedgerData(res.data)
        }
    }

    const handleGenerate = async () => {
        setGenerating(true)
        try {
            const res = await generatePayrollRun({
                month: genMonth,
                year: parseInt(genYear),
                daysInMonth: 22, // Assuming standard working days
                dailyRateDivisor: 22
            })

            if (res.success) {
                toast.success("Payroll generated successfully")
                await loadRuns()
                setActiveRunId(res.data.id)
            } else {
                toast.error(res.error || "Failed to generate")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setGenerating(false)
        }
    }

    const handleDisburse = async () => {
        if (!activeRunId) return
        

        setDisbursing(true)
        try {
            const res = await markPayrollRunCompleted(activeRunId)
            if (res.success) {
                toast.success("Payroll marked as disbursed")
                await loadRuns()
                await loadRunDetails(activeRunId)
            } else {
                toast.error(res.error || "Failed to disburse")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setDisbursing(false)
        }
    }

    const handleDownloadCSV = () => {
        if (!activeRunDetails || !activeRunDetails.items) {
            toast.error("No items found to export")
            return
        }

        // Simple CSV generation
        const headers = ["Account Name", "Account Number", "Bank Code", "Amount", "Narration"]
        const rows = activeRunDetails.items.map((item: any) => {
            const struct = Array.isArray(item.staff?.salary_struct) ? item.staff.salary_struct[0] : item.staff?.salary_struct
            return [
                struct?.account_name || `${item.staff.first_name} ${item.staff.last_name}`,
                struct?.account_number || "N/A",
                "000", // Placeholder bank code
                item.net_pay,
                `Salary ${activeRunDetails.run.month}`
            ]
        })

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map((e: any[]) => e.join(",")).join("\n")

        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `payroll_${activeRunDetails.run.month}_${activeRunDetails.run.year}.csv`)
        document.body.appendChild(link)
        link.click()
    }

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-emerald-500" /></div>

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* 1. Header & Controls */}
            <Card className="p-6 bg-slate-900 border-white/10 shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Payroll Management</h2>
                        <p className="text-sm text-slate-400">Generate, review, and export monthly salary schedules.</p>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-white/5">
                        <Select value={genMonth} onValueChange={setGenMonth}>
                            <SelectTrigger className="w-32 bg-transparent border-none text-white focus:ring-0">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                    <SelectItem key={m} value={m}>{m}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={genYear} onValueChange={setGenYear}>
                            <SelectTrigger className="w-24 bg-transparent border-none text-white focus:ring-0">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                                <SelectItem value="2025">2025</SelectItem>
                                <SelectItem value="2026">2026</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 rounded-lg transition-all"
                        >
                            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                            Generate Run
                        </Button>
                    </div>
                </div>
            </Card>

            <Tabs defaultValue="runs" className="w-full">
                <TabsList className="bg-slate-900 border border-white/10 p-1 h-12 rounded-xl mb-6 w-full md:w-auto justify-start">
                    <TabsTrigger value="runs" className="rounded-lg px-8 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all text-slate-400">Payroll Runs</TabsTrigger>
                    <TabsTrigger value="reconciliation" className="rounded-lg px-8 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all text-slate-400">Rec. Report</TabsTrigger>
                    <TabsTrigger value="sync" className="rounded-lg px-8 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all text-slate-400">Ledger Sync</TabsTrigger>
                </TabsList>

                <TabsContent value="runs" className="mt-0 focus-visible:outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* 2. Sidebar: History */}
                        <Card className="lg:col-span-1 bg-slate-900 border-white/10 p-4 h-[650px] flex flex-col shadow-lg">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Run History</h3>
                            <div className="space-y-2 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                                {runs.map(run => (
                                    <button
                                        key={run.id}
                                        onClick={() => setActiveRunId(run.id)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${activeRunId === run.id
                                            ? "bg-emerald-600/10 border-emerald-500/50 text-white ring-1 ring-emerald-500/20"
                                            : "bg-slate-950/40 border-white/5 text-slate-400 hover:bg-slate-800/50 hover:border-white/10"
                                            }`}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold">{run.month} {run.year}</span>
                                            <Badge variant="outline" className={`text-[10px] uppercase tracking-tighter ${
                                                run.status === 'completed' ? 'border-emerald-500/50 text-emerald-400' : 'border-amber-500/50 text-amber-400'
                                            }`}>{run.status}</Badge>
                                        </div>
                                        <div className="text-[10px] opacity-50">
                                            {format(new Date(run.created_at), 'MMM d, yyyy · HH:mm')}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </Card>

                        {/* 3. Main Content: Details Table */}
                        <Card className="lg:col-span-3 bg-slate-900 border-white/10 p-0 overflow-hidden flex flex-col h-[650px] shadow-2xl">
                            {activeRunDetails ? (
                                <>
                                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-950/40">
                                        <div>
                                            <h3 className="font-bold text-white text-xl tracking-tight">{activeRunDetails.run.month} {activeRunDetails.run.year} Payroll</h3>
                                            <p className="text-sm text-slate-400 mt-1">
                                                Total Payout: <span className="text-emerald-400 font-bold ml-1">₦{activeRunDetails.run.total_payout.toLocaleString()}</span>
                                            </p>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button variant="outline" size="sm" onClick={handleDownloadCSV} className="bg-slate-950 border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg h-10 px-4">
                                                <Download className="h-4 w-4 mr-2" />
                                                Bank File
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button 
                                                        variant="default" 
                                                        size="sm" 
                                                        disabled={disbursing || activeRunDetails.run.status === 'completed' || activeRunDetails.run.total_payout === 0}
                                                        className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg h-10 px-6 font-bold shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:bg-slate-800"
                                                    >
                                                        {disbursing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                                        {activeRunDetails.run.status === 'completed' ? 'Disbursed' : 'Disburse'}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="text-xl font-bold">Confirm Disbursement</AlertDialogTitle>
                                                        <AlertDialogDescription className="text-slate-400">
                                                            Are you sure you want to mark this payroll as disbursed? This will lock the run status and cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="bg-slate-950 border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white">Cancel</AlertDialogCancel>
                                                        <AlertDialogAction 
                                                            onClick={handleDisburse}
                                                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                                                        >
                                                            Confirm & Disburse
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-auto custom-scrollbar">
                                        <table className="w-full text-sm text-left border-collapse">
                                            <thead className="text-[10px] text-slate-500 uppercase font-bold tracking-widest bg-slate-950/80 backdrop-blur-md sticky top-0 z-10 border-b border-white/5">
                                                <tr>
                                                    <th className="px-6 py-4">Staff Member</th>
                                                    <th className="px-6 py-4 text-right">Base Pay</th>
                                                    <th className="px-6 py-4 text-center">Attendance</th>
                                                    <th className="px-6 py-4 text-right">Deductions</th>
                                                    <th className="px-6 py-4 text-right">Net Pay</th>
                                                    <th className="px-6 py-4"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5 text-slate-300">
                                                {(activeRunDetails.items || []).map((item: any) => (
                                                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                                        <td className="px-6 py-5">
                                                            <div className="font-bold text-slate-200 group-hover:text-white">{item.staff.first_name} {item.staff.last_name}</div>
                                                            <div className="text-[10px] text-slate-500 uppercase font-mono mt-0.5">{item.staff.role}</div>
                                                        </td>
                                                        <td className="px-6 py-5 text-right text-slate-400">
                                                            ₦{item.base_salary.toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-5 text-center">
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                                                                    PRES: {item.days_present}
                                                                </span>
                                                                {item.lateness_count > 0 && (
                                                                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                                                                        LATE: {item.lateness_count}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 text-right text-red-400/80">
                                                            -₦{(item.attendance_deductions + item.tax_deduction + item.pension_deduction).toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-5 text-right font-bold text-emerald-400 text-base">
                                                            ₦{item.net_pay.toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <SalaryStructureModal staff={item.staff} onSuccess={() => loadRunDetails(activeRunDetails.run.id)}>
                                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-500/10">
                                                                        <FileText className="h-4 w-4 text-blue-400" />
                                                                    </Button>
                                                                </SalaryStructureModal>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 hover:bg-emerald-500/10"
                                                                    onClick={() => generatePayslip(item, activeRunDetails.run)}
                                                                >
                                                                    <Download className="h-4 w-4 text-emerald-400" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-4 bg-slate-950/20">
                                    <div className="bg-slate-900 p-6 rounded-full border border-white/5 shadow-inner">
                                        <FileText className="h-12 w-12 opacity-20" />
                                    </div>
                                    <p className="text-xs uppercase tracking-[0.3em]">Select A Payroll Run</p>
                                </div>
                            )}
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="reconciliation" className="mt-0 focus-visible:outline-none">
                    <PayrollReconciliationReport
                        staffData={reconciliationData}
                        month={genMonth}
                        year={parseInt(genYear)}
                    />
                </TabsContent>

                <TabsContent value="sync" className="mt-0 focus-visible:outline-none">
                    {activeRunId ? (
                        <BursaryLedgerSync
                            reconciledPayroll={ledgerData}
                            batchId={`PAY-${genMonth.toUpperCase()}-${genYear}`}
                        />
                    ) : (
                        <Card className="p-20 text-center bg-slate-900 border-white/10 shadow-2xl flex flex-col items-center justify-center min-h-[400px]">
                            <div className="bg-slate-950 p-6 rounded-full border border-white/5 mb-6">
                                <DatabaseZap className="h-12 w-12 text-slate-700" />
                            </div>
                            <p className="text-slate-500 text-sm uppercase tracking-widest">Select A Run To Sync Ledger</p>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
