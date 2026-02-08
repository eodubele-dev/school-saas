import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { ArrowUpRight, ArrowDownLeft, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default async function BursarTransactionsPage({ params }: { params: { domain: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect(`/${params.domain}/login`)

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return <div>Access Denied</div>

    // Fetch Transactions
    const { data: transactions } = await supabase
        .from('transactions')
        .select(`
            id,
            amount,
            method,
            date,
            reference,
            status,
            students:student_id (full_name, admission_number)
        `)
        .eq('tenant_id', profile.tenant_id)
        .order('date', { ascending: false })
        .limit(100)

    return (
        <div className="bg-slate-950 p-6 min-h-screen space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Transaction Ledger</h1>
                    <p className="text-slate-400">Real-time payment history and audit trail.</p>
                </div>
            </div>

            <Card className="bg-slate-900 border-white/10">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-white">Recent Transactions</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500" />
                            <Input placeholder="Search reference..." className="pl-8 bg-slate-950 border-white/10" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-400">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-950/50">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Student</th>
                                    <th className="px-6 py-3">Reference</th>
                                    <th className="px-6 py-3">Method</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions && transactions.length > 0 ? (
                                    transactions.map((tx) => (
                                        <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="px-6 py-4 font-medium">{formatDate(tx.date)}</td>
                                            <td className="px-6 py-4 text-white">
                                                {/* @ts-ignore */}
                                                {tx.students?.full_name}
                                                <div className="text-xs text-slate-500">
                                                    {/* @ts-ignore */}
                                                    {tx.students?.admission_number}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs">{tx.reference || '-'}</td>
                                            <td className="px-6 py-4 uppercase">{tx.method}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${tx.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                                                        tx.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                                                            'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-white">
                                                ₦{tx.amount?.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                            No transactions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
