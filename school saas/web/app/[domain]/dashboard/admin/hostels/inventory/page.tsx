"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, Search, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function InventoryPage() {
    const [inventory, setInventory] = useState([
        { id: 1, name: "Standard Mattress (6ft)", total: 500, assigned: 442, condition: "new" },
        { id: 2, name: "Metal Locker", total: 500, assigned: 445, condition: "good" },
        { id: 3, name: "Bunk Bed Frame", total: 250, assigned: 250, condition: "fair" },
    ])

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Hostel Asset Inventory</h2>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search items..."
                            className="pl-9 bg-slate-950 border-white/10 w-64"
                        />
                    </div>
                    <Button className="bg-[var(--school-accent)]">
                        <Plus className="h-4 w-4 mr-2" /> Add Item
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border border-white/5 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-900 hover:bg-slate-900 text-slate-400">
                        <TableRow>
                            <TableHead className="text-white">Item Name</TableHead>
                            <TableHead className="text-center">Total Stock</TableHead>
                            <TableHead className="text-center">Assigned</TableHead>
                            <TableHead className="text-center">Available</TableHead>
                            <TableHead>Avg. Condition</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="bg-slate-950/50">
                        {inventory.map((item) => (
                            <TableRow key={item.id} className="hover:bg-slate-900/50 border-white/5">
                                <TableCell className="font-medium text-white flex items-center gap-3">
                                    <div className="h-8 w-8 rounded bg-slate-800 flex items-center justify-center">
                                        <Package className="h-4 w-4 text-slate-400" />
                                    </div>
                                    {item.name}
                                </TableCell>
                                <TableCell className="text-center text-slate-300 font-mono">{item.total}</TableCell>
                                <TableCell className="text-center text-blue-400 font-bold font-mono">{item.assigned}</TableCell>
                                <TableCell className="text-center text-green-400 font-bold font-mono">{item.total - item.assigned}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="capitalize border-white/10 text-slate-400">
                                        {item.condition}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                                        Assign
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
