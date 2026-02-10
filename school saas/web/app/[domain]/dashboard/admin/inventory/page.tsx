
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, TrendingDown, AlertTriangle, FileCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getInventoryStats, getLowStockItemsWithDetails } from "@/lib/actions/inventory"
import { formatCurrency } from "@/lib/utils"

export default async function InventoryDashboard() {
    const statsRes = await getInventoryStats()
    const lowStockRes = await getLowStockItemsWithDetails()

    const stats = (statsRes.success && statsRes.data) ? statsRes.data : { totalValuation: 0, lowStockCount: 0, pendingRequestsCount: 0, monthlyUsageChange: 0 }
    const lowStock = lowStockRes || []

    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-slate-900 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-300">Total Valuation</CardTitle>
                        <Package className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{formatCurrency(stats.totalValuation)}</div>
                        <p className="text-xs text-slate-500">Across all categories</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-300">Low Stock Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${stats.lowStockCount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {stats.lowStockCount} Items
                        </div>
                        <p className="text-xs text-slate-500">Need immediate restock</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-300">Pending Requests</CardTitle>
                        <FileCheck className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-500">{stats.pendingRequestsCount}</div>
                        <p className="text-xs text-slate-500">Waiting for approval</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-300">Monthly Usage</CardTitle>
                        <TrendingDown className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-500">{stats.monthlyUsageChange}%</div>
                        <p className="text-xs text-slate-500">Consumption improved</p>
                    </CardContent>
                </Card>
            </div>

            {/* Low Stock Table */}
            <Card className="bg-slate-900 border-white/5">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Critical Low Stock
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-slate-500 border-b border-white/5 bg-slate-950/50">
                                <tr>
                                    <th className="py-3 px-4">Item Name</th>
                                    <th className="py-3 px-4">Category</th>
                                    <th className="py-3 px-4 text-center">Remaining</th>
                                    <th className="py-3 px-4 text-center">Reorder Level</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStock.length > 0 ? lowStock.map((item: any) => (
                                    <tr key={item.id} className="border-b border-white/5 hover:bg-slate-800/50">
                                        <td className="py-3 px-4 text-white font-medium">{item.name}</td>
                                        <td className="py-3 px-4 text-slate-400">{item.category?.name || 'Uncategorized'}</td>
                                        <td className="py-3 px-4 text-center text-red-500 font-bold">{item.quantity_on_hand}</td>
                                        <td className="py-3 px-4 text-center text-slate-500">{item.reorder_level}</td>
                                        <td className="py-3 px-4 text-right">
                                            <Badge className="bg-blue-600 hover:bg-blue-700 cursor-pointer">Restock</Badge>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-slate-500">
                                            No critical low stock items found. Good job!
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
