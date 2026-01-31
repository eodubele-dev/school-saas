/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/no-unescaped-entities */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, DollarSign, RefreshCw, Smartphone } from "lucide-react"
import { getDebtorStudents, generatePaystackLink } from "@/lib/actions/finance"
import { toast } from "sonner"

// Mock Data Injector for Demo (Since DB might be empty)
const DEMO_DEBTORS = [
    { id: "1", studentName: "Chioma Okeke", className: "JSS 1", totalFees: 150000, amountPaid: 100000, balance: 50000, status: "partial" },
    { id: "2", studentName: "Adekunle Gold", className: "SS 3", totalFees: 200000, amountPaid: 0, balance: 200000, status: "owing" },
    { id: "3", studentName: "Musa Yaradua", className: "JSS 2", totalFees: 150000, amountPaid: 140000, balance: 10000, status: "partial" },
]

export default function RevenueRecoveryPage() {
    const [debtors, setDebtors] = useState<any[]>(DEMO_DEBTORS)
    const [loading, setLoading] = useState(false)

    // Calculate Totals
    const totalOutstanding = debtors.reduce((acc, curr) => acc + curr.balance, 0)
    const recoveryRate = 65 // Mock %

    const handleWhatsAppRemind = async (student: any) => {
        const payLink = await generatePaystackLink(student.studentName, student.balance)

        const message = `Dear Parent of ${student.studentName}, your ward has an outstanding school fee balance of ₦${student.balance.toLocaleString()}. Please pay securely here: ${payLink} to avoid service disruption. Thank you.`

        const url = `https://wa.me/?text=${encodeURIComponent(message)}`
        window.open(url, "_blank")
        toast.success(`WhatsApp opened for ${student.studentName}`)
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Revenue Recovery</h2>
                    <p className="text-muted-foreground">Track and recover outstanding school fees.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline"><RefreshCw className="mr-2 h-4 w-4" /> Sync Payments</Button>
                    <Button className="bg-green-600 hover:bg-green-700"><DollarSign className="mr-2 h-4 w-4" /> Record Payment</Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-red-50 border-red-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-600">Total Outstanding</CardTitle>
                        <DollarSign className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-900">₦{totalOutstanding.toLocaleString()}</div>
                        <p className="text-xs text-red-600 mt-1">+12% from last term</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recovery Rate</CardTitle>
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{recoveryRate}%</div>
                        <p className="text-xs text-muted-foreground mt-1">Target: 80%</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Debtors Count</CardTitle>
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{debtors.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Students owing fees</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Outstanding Balances</CardTitle>
                    <CardDescription>
                        List of students with unsettled bills. Click 'WhatsApp' to send a payment link.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total Fees</TableHead>
                                <TableHead className="text-right">Paid</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {debtors.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-medium">{student.studentName}</TableCell>
                                    <TableCell>{student.className}</TableCell>
                                    <TableCell>
                                        <Badge variant={student.status === 'owing' ? 'destructive' : 'secondary'} className="capitalize">
                                            {student.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">₦{student.totalFees.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">₦{student.amountPaid.toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-bold text-red-600">₦{student.balance.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-green-600 border-green-200 hover:bg-green-50"
                                            onClick={() => handleWhatsAppRemind(student)}
                                        >
                                            <MessageCircle className="mr-2 h-4 w-4" /> Remind
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
