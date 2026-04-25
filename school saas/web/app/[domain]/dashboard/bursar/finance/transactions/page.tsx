import { getPaginatedTransactions } from "@/lib/actions/finance"
import { SimplePagination } from "@/components/shared/pagination"
import { SearchInput } from "@/components/shared/search-input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"

export default async function BursarTransactionsPage({ 
    params,
    searchParams 
}: { 
    params: { domain: string },
    searchParams: { page?: string, query?: string }
}) {
    const page = Number(searchParams.page) || 1
    const query = searchParams.query || ""

    const result = await getPaginatedTransactions({
        page,
        limit: 20,
        search: query
    })

    if (!result.success) return <div>Error loading transactions: {result.error}</div>

    const transactions = result.data
    const totalPages = result.totalPages
    const totalCount = result.count

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
                        <SearchInput placeholder="Search reference..." />
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
                                    transactions.map((tx: any) => (
                                        <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="px-6 py-4 font-medium">{formatDate(tx.date)}</td>
                                            <td className="px-6 py-4 text-white">
                                                {tx.students?.full_name}
                                                <div className="text-xs text-slate-500">
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

                    <SimplePagination 
                        currentPage={page}
                        totalPages={totalPages}
                        totalCount={totalCount}
                        pageSize={20}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
