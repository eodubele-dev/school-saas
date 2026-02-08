"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Loader2, Download, RefreshCw, FileText, CheckCircle, DatabaseZap } from "lucide-react"
import { generatePayrollRun, getPayrollRuns, getPayrollRunDetails, getPayrollReconciliationReport, getReconciledLedger } from "@/lib/actions/payroll"
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

    // Form state for generation
    const [genMonth, setGenMonth] = useState("October")
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

    const handleDownloadCSV = () => {
        if (!activeRunDetails) return

        // Simple CSV generation
        const headers = ["Account Name", "Account Number", "Bank Code", "Amount", "Narration"]
        const rows = activeRunDetails.items.map((item: any) => [
            item.staff.salary_struct?.account_name || `${item.staff.first_name} ${item.staff.last_name}`,
            item.staff.salary_struct?.account_number || "N/A",
            "000", // Placeholder bank code
            item.net_pay,
            `Salary ${activeRunDetails.run.month}`
        ])

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

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-500" /></div>

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* 1. Header & Controls */}
            <Card className="p-6 bg-slate-900 border-white/5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-white">Payroll Management</h2>
                        <p className="text-sm text-slate-400">Generate, review, and export monthly salary schedules.</p>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-white/10">
                        <Select value={genMonth} onValueChange={setGenMonth}>
                            <SelectTrigger className="w-32 bg-transparent border-none text-white"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                    <SelectItem key={m} value={m}>{m}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={genYear} onValueChange={setGenYear}>
                            <SelectTrigger className="w-24 bg-transparent border-none text-white"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2025">2025</SelectItem>
                                <SelectItem value="2026">2026</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={handleGenerate}
                            disabled={generating}
                            className="bg-[hsl(var(--school-accent))] hover:opacity-90 text-white font-bold"
                        >
                            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                            Generate Run
                        </Button>
                    </div>
                </div>
            </Card>

            <Tabs defaultValue="runs" className="w-full">
                <TabsList className="bg-slate-900 border border-white/5 p-1 rounded-xl mb-6">
                    <TabsTrigger value="runs" className="rounded-lg px-6">Payroll Runs</TabsTrigger>
                    <TabsTrigger value="reconciliation" className="rounded-lg px-6">Rec. Report</TabsTrigger>
                    <TabsTrigger value="sync" className="rounded-lg px-6">Ledger Sync</TabsTrigger>
                </TabsList>

                <TabsContent value="runs">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* 2. Sidebar: History */}
                        <Card className="lg:col-span-1 bg-slate-900 border-white/5 p-4 h-[600px] flex flex-col">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Run History</h3>
                            <div className="space-y-2 overflow-y-auto flex-1">
                                {runs.map(run => (
                                    <button
                                        key={run.id}
                                        onClick={() => setActiveRunId(run.id)}
                                        className={`w-full text-left p-3 rounded-lg border transition-all ${activeRunId === run.id
                                            ? "bg-blue-600/10 border-blue-500/50 text-white"
                                            : "bg-slate-900/50 border-white/5 text-slate-400 hover:bg-white/5"
                                            }`}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold">{run.month} {run.year}</span>
                                            <Badge variant="outline" className="text-xs">{run.status}</Badge>
                                        </div>
                                        <div className="text-xs opacity-70">
                                            Generated: {format(new Date(run.created_at), 'MMM d, HH:mm')}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </Card>

                        {/* 3. Main Content: Details Table */}
                        <Card className="lg:col-span-3 bg-slate-900 border-white/5 p-0 overflow-hidden flex flex-col h-[600px]">
                            {activeRunDetails ? (
                                <>
                                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-950/30">
                                        <div>
                                            <h3 className="font-bold text-white text-lg">{activeRunDetails.run.month} {activeRunDetails.run.year} Payroll</h3>
                                            <p className="text-sm text-slate-400">Total Payout: <span className="text-emerald-400 font-mono font-bold">₦{activeRunDetails.run.total_payout.toLocaleString()}</span></p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={handleDownloadCSV} className="border-white/10 text-slate-300 hover:text-white">
                                                <Download className="h-4 w-4 mr-2" />
                                                Bank File
                                            </Button>
                                            <Button variant="default" size="sm" className="bg-emerald-600 hover:bg-emerald-500">
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Disburse
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-auto">
                                        <table className="w-full text-sm text-left border-collapse">
                                            <thead className="text-[10px] text-slate-500 uppercase font-mono bg-slate-950 sticky top-0 z-10">
                                                <tr>
                                                    <th className="px-6 py-4">Staff</th>
                                                    <th className="px-6 py-4 text-right">Base Pay</th>
                                                    <th className="px-6 py-4 text-center">Attendance</th>
                                                    <th className="px-6 py-4 text-right">Deductions</th>
                                                    <th className="px-6 py-4 text-right">Net Pay</th>
                                                    <th className="px-6 py-4"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5 text-slate-300">
                                                {(activeRunDetails.items || []).map((item: any) => (
                                                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                                                        <td className="px-6 py-5 font-medium text-white">
                                                            {item.staff.first_name} {item.staff.last_name}
                                                            <div className="text-[10px] text-slate-500 uppercase font-mono mt-1">{item.staff.role}</div>
                                                        </td>
                                                        <td className="px-6 py-5 text-right font-mono text-slate-400">
                                                            ₦{item.base_salary.toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-5 text-center">
                                                            <div className="flex flex-col items-center gap-1">
                                                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-none rounded-md px-2 py-0">
                                                                    P: {item.days_present}
                                                                </Badge>
                                                                {item.lateness_count > 0 && (
                                                                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-none text-[10px] rounded-md px-2 py-0">
                                                                        L: {item.lateness_count}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 text-right font-mono text-red-500/80">
                                                            -₦{(item.attendance_deductions + item.tax_deduction + item.pension_deduction).toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-5 text-right font-mono font-black text-emerald-500">
                                                            ₦{item.net_pay.toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <SalaryStructureModal staff={item.staff} onSuccess={() => loadRunDetails(activeRunDetails.run.id)}>
                                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-white/5">
                                                                        <FileText className="h-4 w-4 text-blue-400" />
                                                                    </Button>
                                                                </SalaryStructureModal>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0 hover:bg-white/5"
                                                                    onClick={() => generatePayslip(item, activeRunDetails.run)}
                                                                >
                                                                    <Download className="h-4 w-4 text-slate-500 hover:text-white" />
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
                                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
                                    <FileText className="h-16 w-16 opacity-20" />
                                    <p className="text-sm font-mono uppercase tracking-widest">Select_A_Payroll_Run</p>
                                </div>
                            )}
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="reconciliation">
                    <PayrollReconciliationReport
                        staffData={reconciliationData}
                        month={genMonth}
                        year={parseInt(genYear)}
                    />
                </TabsContent>

                <TabsContent value="sync">
                    {activeRunId ? (
                        <BursaryLedgerSync
                            reconciledPayroll={ledgerData}
                            batchId={`PAY-${genMonth.toUpperCase()}-${genYear}`}
                        />
                    ) : (
                        <Card className="p-12 text-center bg-slate-900 border-white/5">
                            <DatabaseZap className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-400 font-mono uppercase tracking-widest">Select_A_Run_To_Sync_Ledger</p>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
