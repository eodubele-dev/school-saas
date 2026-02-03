"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, TrendingDown, AlertTriangle, FileCheck } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

export default function InventoryDashboard() {
    // Mock Data
    const [lowStock] = useState([
        { name: "Diesel (Liter)", qty: 50, level: 150, category: "Operational" },
        { name: "A4 Paper Ream", qty: 2, level: 10, category: "Academic" },
    ])

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
                        <div className="text-2xl font-bold text-white">₦4.2M</div>
                        <p className="text-xs text-slate-500">Across all categories</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-300">Low Stock Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">2 Items</div>
                        <p className="text-xs text-slate-500">Need immediate restock</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-300">Pending Requests</CardTitle>
                        <FileCheck className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-500">5</div>
                        <p className="text-xs text-slate-500">Waiting for approval</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-900 border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-300">Monthly Usage</CardTitle>
                        <TrendingDown className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-500">-12%</div>
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
                                {lowStock.map((item, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-slate-800/50">
                                        <td className="py-3 px-4 text-white font-medium">{item.name}</td>
                                        <td className="py-3 px-4 text-slate-400">{item.category}</td>
                                        <td className="py-3 px-4 text-center text-red-500 font-bold">{item.qty}</td>
                                        <td className="py-3 px-4 text-center text-slate-500">{item.level}</td>
                                        <td className="py-3 px-4 text-right">
                                            <Badge className="bg-blue-600 hover:bg-blue-700 cursor-pointer">Restock</Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
