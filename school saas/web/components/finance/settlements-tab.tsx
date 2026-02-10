"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CreditCard, ExternalLink, RefreshCw, CheckCircle2, Clock } from "lucide-react"
import { NairaIcon } from "@/components/ui/naira-icon"

export function SettlementsTab({ initialData }: { initialData: any[] }) {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-slate-900 border-white/5">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-slate-400">Total Processed</CardDescription>
                        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                            <NairaIcon className="h-5 w-5 text-cyan-400" />
                            {initialData.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Card className="bg-slate-900 border-white/5">
                <Table>
                    <TableHeader className="bg-slate-800/50">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="text-slate-400">Transaction ID</TableHead>
                            <TableHead className="text-slate-400">Student</TableHead>
                            <TableHead className="text-slate-400">Amount</TableHead>
                            <TableHead className="text-slate-400">Fee (2.5%)</TableHead>
                            <TableHead className="text-slate-400">Net</TableHead>
                            <TableHead className="text-slate-400">Settlement</TableHead>
                            <TableHead className="text-right text-slate-400">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialData.map((trx) => (
                            <TableRow
                                key={trx.id}
                                className={`border-white/5 hover:bg-white/5 transition-all duration-500 ${trx.status === 'success' ? 'shadow-[0_0_15px_-3px_rgba(34,211,238,0.1)]' : ''}`}
                            >
                                <TableCell className="font-mono text-[10px] text-slate-400">
                                    {trx.reference || trx.id.slice(0, 8)}
                                </TableCell>
                                <TableCell className="text-slate-200 font-medium">
                                    {trx.studentName}
                                </TableCell>
                                <TableCell className="text-white">
                                    ₦{trx.amount.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-slate-500">
                                    ₦{(trx.amount * 0.025).toLocaleString()}
                                </TableCell>
                                <TableCell className="text-cyan-400 font-bold">
                                    ₦{(trx.amount * 0.975).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5">
                                        {trx.settlementStatus === 'settled' ? (
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                        ) : (
                                            <Clock className="h-3.5 w-3.5 text-amber-500" />
                                        )}
                                        <span className={`text-[10px] uppercase font-bold ${trx.settlementStatus === 'settled' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                            {trx.settlementStatus || 'Pending'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge className={`${trx.status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400'}`}>
                                        {trx.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {initialData.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-10" />
                        <p>No Paystack transactions found for this period.</p>
                    </div>
                )}
            </Card>
        </div>
    )
}
