"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, Search, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { createInventoryItem } from "@/lib/actions/hostel"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function InventoryClient({ initialItems }: { initialItems: any[] }) {
    const [search, setSearch] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [newItem, setNewItem] = useState({ name: "", total_quantity: 0, condition: "new" })

    const filteredItems = initialItems.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
    )

    const handleAddItem = async () => {
        if (!newItem.name) return toast.error("Name is required")
        if (newItem.total_quantity <= 0) return toast.error("Quantity must be greater than 0")

        setIsSubmitting(true)
        const res = await createInventoryItem(newItem)
        setIsSubmitting(false)

        if (res.success) {
            toast.success("Inventory item added")
            window.location.reload()
        } else {
            toast.error(res.error || "Failed to add item")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Hostel Asset Inventory</h2>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search items..."
                            className="pl-9 bg-slate-950 border-white/10 w-64 text-white"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="bg-[var(--school-accent)] text-white">
                                <Plus className="h-4 w-4 mr-2" /> Add Item
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-950 border-white/10 text-white">
                            <DialogHeader>
                                <DialogTitle>Add Inventory Item</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <Input
                                    placeholder="Item Name (e.g. Mattress)"
                                    className="bg-slate-900 border-white/10"
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                />
                                <Input
                                    type="number"
                                    placeholder="Total Quantity"
                                    className="bg-slate-900 border-white/10"
                                    onChange={(e) => setNewItem({ ...newItem, total_quantity: parseInt(e.target.value) })}
                                />
                                <select
                                    className="w-full bg-slate-900 border border-white/10 rounded-md p-2 text-sm"
                                    onChange={(e) => setNewItem({ ...newItem, condition: e.target.value })}
                                    defaultValue="new"
                                >
                                    <option value="new">New</option>
                                    <option value="good">Good</option>
                                    <option value="fair">Fair</option>
                                    <option value="needs_replacement">Needs Replacement</option>
                                </select>
                                <Button
                                    className="w-full bg-[var(--school-accent)]"
                                    onClick={handleAddItem}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Adding..." : "Add to Inventory"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="rounded-xl border border-white/5 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-900 hover:bg-slate-900 text-slate-400">
                        <TableRow className="border-white/5">
                            <TableHead className="text-white">Item Name</TableHead>
                            <TableHead className="text-center">Total Stock</TableHead>
                            <TableHead className="text-center">Available</TableHead>
                            <TableHead>Avg. Condition</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="bg-slate-950/50">
                        {filteredItems.length > 0 ? filteredItems.map((item) => (
                            <TableRow key={item.id} className="hover:bg-slate-900/50 border-white/5">
                                <TableCell className="font-medium text-white flex items-center gap-3">
                                    <div className="h-8 w-8 rounded bg-slate-800 flex items-center justify-center">
                                        <Package className="h-4 w-4 text-slate-400" />
                                    </div>
                                    {item.name}
                                </TableCell>
                                <TableCell className="text-center text-slate-300 font-mono">{item.total_quantity}</TableCell>
                                <TableCell className="text-center text-green-400 font-bold font-mono">{item.available_quantity}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="capitalize border-white/10 text-slate-400">
                                        {item.condition}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                                        Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20 text-slate-500">
                                    No inventory items found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
