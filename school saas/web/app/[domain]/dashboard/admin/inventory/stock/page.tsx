"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Filter, MoreVertical, Edit, Trash } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export default function StockPage() {
    const [items] = useState([
        { id: 1, name: "A4 Printing Paper", category: "Academic", qty: 2, unit: "Ream", cost: 4500, value: 9000 },
        { id: 2, name: "Diesel", category: "Operational", qty: 550, unit: "Liters", cost: 1200, value: 660000 },
        { id: 3, name: "School Uniform (Set)", category: "Retail", qty: 150, unit: "Set", cost: 15000, value: 2250000 },
    ])

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-white/5">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input placeholder="Search stock..." className="pl-9 bg-slate-950 border-white/10" />
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" className="border-white/10 text-slate-300">
                        <Filter className="mr-2 h-4 w-4" /> Filter
                    </Button>
                    <Button className="bg-[var(--school-accent)]">
                        <Plus className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border border-white/5 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-900 text-slate-400">
                        <TableRow>
                            <TableHead className="w-[300px]">Item Details</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-center">Quantity</TableHead>
                            <TableHead className="text-right">Unit Cost</TableHead>
                            <TableHead className="text-right">Total Value</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="bg-slate-950/50">
                        {items.map((item) => (
                            <TableRow key={item.id} className="border-white/5 hover:bg-slate-900/50">
                                <TableCell>
                                    <div>
                                        <div className="font-bold text-white">{item.name}</div>
                                        <div className="text-xs text-slate-500">SKU: SCH-{item.id}00</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="bg-slate-800 text-slate-300 pointer-events-none">
                                        {item.category}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center font-mono text-slate-300">
                                    {item.qty} <span className="text-xs text-slate-600 ml-1">{item.unit}</span>
                                </TableCell>
                                <TableCell className="text-right font-mono text-slate-300">₦{item.cost.toLocaleString()}</TableCell>
                                <TableCell className="text-right font-mono font-bold text-blue-400">₦{item.value.toLocaleString()}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <MoreVertical className="h-4 w-4 text-slate-400" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-slate-900 border-white/10">
                                            <DropdownMenuItem className="text-slate-300 focus:bg-slate-800 focus:text-white">
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-slate-300 focus:bg-slate-800 focus:text-white">
                                                <Plus className="mr-2 h-4 w-4" /> Restock
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-500 focus:bg-red-950/20 focus:text-red-400">
                                                <Trash className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
