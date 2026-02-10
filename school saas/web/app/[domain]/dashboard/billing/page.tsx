
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import {
    CreditCard,
    Download,
    History,
    CheckCircle2,
    Zap,
    BookOpen,
    GraduationCap,
    Shirt,
    Coins
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { getStudentBilling, getPaymentHistory } from "@/lib/actions/finance"
import { PaymentButton } from "./payment-button"
import { DownloadReceiptButton } from "./download-receipt-button"
import { DownloadInvoiceButton } from "./download-invoice-button"

export default async function BillingPage({
    params,
    searchParams
}: {
    params: { domain: string },
    searchParams: { studentId?: string }
}) {
    const supabase = createClient()

    // Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect(`/${params.domain}/login`)

    // Identify Student
    const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', params.domain).single()

    // Fetch all students for this parent (to support switching)
    const { data: students } = await supabase
        .from('students')
        .select('*')
        .eq('parent_id', user.id)
        .eq('tenant_id', tenant?.id)

    if (!students || students.length === 0) return <div className="p-8 text-center text-slate-400">No student linked to this account.</div>

    // Determine target student: URL param > First student
    const student = searchParams.studentId
        ? students.find(s => s.id === searchParams.studentId) || students[0]
        : students[0]

    if (!student) return <div className="p-8 text-center text-slate-400">No student linked to this account.</div>

    // Fetch Data
    const currentSession = "2023/2024"
    const currentTerm = "2nd Term"

    const billing = await getStudentBilling(student.id, currentSession, currentTerm)
    const history = await getPaymentHistory(student.id)

    const balance = billing?.balance || 0
    const totalFees = billing?.total_fees || 0
    const isPaid = balance <= 0

    // Adjust breakdown for UI if needed (mapping DB fields used in finance.ts to UI requirements)
    const breakdown = {
        tuition: billing?.breakdown?.tuition || 0,
        development: billing?.breakdown?.bus || 0, // Mapping existing DB field to new Label
        books: 15000, // Mock for "Books"
        uniforms: billing?.breakdown?.uniform || 0
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white glow-blue font-serif">School Fees</h2>
                    <p className="text-slate-400">Manage tuition payments and view transaction history.</p>
                </div>

                {/* Premium Auto-Pay Toggle (Coming Soon) */}
                <div className="flex items-center space-x-2 bg-slate-900/50 p-2 pr-4 rounded-full border border-cyan-500/20">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                        <Zap className="h-4 w-4 text-white fill-white" />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="auto-pay" className="text-sm font-bold text-white cursor-pointer">Auto-Pay</Label>
                            <Badge variant="secondary" className="text-[9px] h-4 bg-cyan-500/20 text-cyan-400 pointer-events-none">SOON</Badge>
                        </div>
                        <span className="text-[10px] text-slate-400">Platinum Feature</span>
                    </div>
                    <Switch id="auto-pay" disabled className="data-[state=checked]:bg-cyan-500" />
                </div>
            </div>

            {/* QUICK PAY HERO SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Balance Card */}
                <Card className="lg:col-span-2 bg-gradient-to-br from-emerald-950/40 to-slate-950 border-emerald-500/20 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <CardContent className="p-8 relative z-10 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 mb-2">
                                <p className="text-emerald-400/80 font-bold uppercase tracking-wider text-xs">Outstanding Balance</p>
                                {isPaid ? (
                                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)] hover:bg-emerald-500/30">Paid</Badge>
                                ) : (
                                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)] hover:bg-amber-500/30 animate-pulse">Pending</Badge>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white font-serif tracking-tight">
                                ₦{balance.toLocaleString()}
                            </h1>
                            <p className="text-slate-400 text-sm">
                                Session: {currentSession} • {currentTerm}
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 min-w-[200px] w-full md:w-auto">
                            {isPaid ? (
                                <div className="flex flex-col items-center justify-center p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                                    <CheckCircle2 className="h-8 w-8 mb-2" />
                                    <span className="font-bold">Fees Cleared</span>
                                </div>
                            ) : (
                                <PaymentButton amount={balance} email={user.email || ""} studentId={student.id} />
                            )}

                            {/* Download Invoice Button */}
                            <DownloadInvoiceButton billing={{ ...billing, breakdown, session: currentSession, term: currentTerm }} studentName={student.full_name} />
                        </div>
                    </CardContent>
                </Card>

                {/* Breakdown Summary (Tuition, Development, Books, Uniforms) */}
                <Card className="bg-slate-900/40 border-white/5 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-widest">Fee Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <FeeItem icon={GraduationCap} label="Tuition Fees" amount={breakdown.tuition} color="text-blue-400" />
                            <FeeItem icon={Coins} label="Development Levy" amount={breakdown.development} color="text-amber-400" />
                            <FeeItem icon={BookOpen} label="Books & Materials" amount={breakdown.books} color="text-emerald-400" />
                            <FeeItem icon={Shirt} label="School Uniforms" amount={breakdown.uniforms} color="text-purple-400" />
                        </div>
                        <div className="pt-4 border-t border-white/5 flex justify-between text-sm">
                            <span className="text-slate-300 font-bold">Total Due</span>
                            <span className="text-white font-bold">₦{totalFees.toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* PAYMENT HISTORY TABLE */}
            <Card className="bg-slate-900/40 border-white/5 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <History className="h-5 w-5 text-cyan-400" />
                        <CardTitle className="text-white">Payment History</CardTitle>
                    </div>
                    <CardDescription className="text-slate-400">Recent transactions and downloadable receipts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="text-slate-500">Date</TableHead>
                                <TableHead className="text-slate-500">Reference</TableHead>
                                <TableHead className="text-slate-500">Method</TableHead>
                                <TableHead className="text-slate-500">Amount</TableHead>
                                <TableHead className="text-slate-500">Status</TableHead>
                                <TableHead className="text-right text-slate-500">Receipt</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.length > 0 ? history.map((payment: any) => (
                                <TableRow key={payment.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                    <TableCell className="text-slate-300 font-medium">
                                        {new Date(payment.date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-slate-400 text-xs font-mono">
                                        {payment.reference || "N/A"}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-[10px] capitalize border-white/10 text-slate-400">
                                            {payment.method}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-white font-bold">
                                        ₦{payment.amount.toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={payment.status} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {payment.status === 'success' && (
                                            <DownloadReceiptButton payment={payment} studentName={student.full_name} />
                                        )}
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                        No payment history found.
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

// --- Helper Components ---

function FeeItem({ icon: Icon, label, amount, color }: any) {
    return (
        <div className="flex justify-between items-center py-2 text-sm group">
            <div className="flex items-center gap-3 text-slate-400">
                <div className={`p-1.5 rounded-md bg-white/5 group-hover:bg-white/10 transition-colors ${color}`}>
                    <Icon className="h-4 w-4" />
                </div>
                {label}
            </div>
            <span className="font-medium text-slate-200">₦{amount.toLocaleString()}</span>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'success') {
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">Success</Badge>
    }
    if (status === 'pending') {
        return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20">Pending</Badge>
    }
    return <Badge className="bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20">Failed</Badge>
}
