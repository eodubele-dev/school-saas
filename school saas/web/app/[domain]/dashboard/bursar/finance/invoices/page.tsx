import { getPaginatedInvoices } from "@/lib/actions/finance"
import { SimplePagination } from "@/components/shared/pagination"
import { SearchInput } from "@/components/shared/search-input"
import { InvoiceExportButton } from "@/components/finance/invoice-export-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { FileText } from "lucide-react"

export default async function BursarInvoicesPage({ 
    params,
    searchParams 
}: { 
    params: { domain: string },
    searchParams: { page?: string, query?: string }
}) {
    const page = Number(searchParams.page) || 1
    const query = searchParams.query || ""

    const result = await getPaginatedInvoices({
        page,
        limit: 20,
        search: query
    })

    if (!result.success) return <div>Error loading invoices: {result.error}</div>

    const invoices = result.data
    const totalPages = result.totalPages
    const totalCount = result.count

    return (
        <div className="bg-slate-950 p-6 min-h-screen space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Invoice Management</h1>
                    <p className="text-slate-400">Track and manage student billings.</p>
                </div>
                <InvoiceExportButton />
            </div>

            <Card className="bg-slate-900 border-white/10">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-white">Generated Invoices</CardTitle>
                        <SearchInput placeholder="Search term..." />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-400">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-950/50">
                                <tr>
                                    <th className="px-6 py-3">Term</th>
                                    <th className="px-6 py-3">Student</th>
                                    <th className="px-6 py-3">Date Generated</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Amount</th>
                                    <th className="px-6 py-3 text-right">Paid</th>
                                    <th className="px-6 py-3 text-right">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices && invoices.length > 0 ? (
                                    invoices.map((inv: any) => {
                                        const balance = (inv.amount || 0) - (inv.amount_paid || 0)
                                        return (
                                            <tr key={inv.id} className="border-b border-white/5 hover:bg-white/5">
                                                <td className="px-6 py-4 font-medium">{inv.term}</td>
                                                <td className="px-6 py-4 text-white">
                                                    {inv.students?.full_name}
                                                    <div className="text-xs text-slate-500">
                                                        {inv.students?.admission_number}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">{formatDate(inv.created_at)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' :
                                                            inv.status === 'partial' ? 'bg-blue-500/10 text-blue-500' :
                                                                'bg-red-500/10 text-red-500'
                                                        }`}>
                                                        {inv.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-white">₦{inv.amount?.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right text-emerald-400">₦{inv.amount_paid?.toLocaleString()}</td>
                                                <td className="px-6 py-4 text-right font-bold text-red-400">₦{balance.toLocaleString()}</td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            No invoices found.
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
