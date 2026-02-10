"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Filter, MoreVertical, Edit, Trash, PackagePlus } from "lucide-react"
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
import { deleteInventoryItem } from "@/lib/actions/inventory"
import { toast } from "sonner"
import { AddItemModal } from "./add-item-modal"
import { RestockModal } from "./restock-modal"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface StockManagerProps {
    initialItems: any[]
    categories: any[]
    vendors: any[]
}

export function StockManager({ initialItems, categories, vendors }: StockManagerProps) {
    const [items, setItems] = useState(initialItems)
    const [search, setSearch] = useState("")
    const router = useRouter()

    // Sync with props
    useEffect(() => {
        setItems(initialItems)
    }, [initialItems])

    // Modals
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [restockItem, setRestockItem] = useState<any>(null)
    const [deleteItem, setDeleteItem] = useState<any>(null)

    // Derived state
    const [categoryFilter, setCategoryFilter] = useState<string>("all")

    // Derived state
    const uniqueCategories = categories.map(c => c.name)

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.sku?.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = categoryFilter === "all" || item.category?.name === categoryFilter

        return matchesSearch && matchesCategory
    })

    const handleDelete = async () => {
        if (!deleteItem) return
        const res = await deleteInventoryItem(deleteItem.id)
        if (res.success) {
            toast.success("Item deleted")
            setDeleteItem(null)
            router.refresh()
        } else {
            toast.error(res.error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-white/5">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search stock..."
                        className="pl-9 bg-slate-950 border-white/10 text-white placeholder:text-slate-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className={`border border-white/10 ${categoryFilter !== 'all' ? 'bg-slate-800 text-white border-white/20' : 'text-slate-300'} hover:bg-slate-800 hover:text-white transition-colors`}
                            >
                                <Filter className="mr-2 h-4 w-4" />
                                {categoryFilter === 'all' ? 'Filter' : categoryFilter}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-900 border-white/10">
                            <DropdownMenuItem
                                onClick={() => setCategoryFilter("all")}
                                className="text-slate-300 focus:bg-slate-800 focus:text-white cursor-pointer"
                            >
                                All Categories
                            </DropdownMenuItem>
                            {uniqueCategories.map(cat => (
                                <DropdownMenuItem
                                    key={cat as string}
                                    onClick={() => setCategoryFilter(cat as string)}
                                    className="text-slate-300 focus:bg-slate-800 focus:text-white cursor-pointer"
                                >
                                    {cat as string}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button className="bg-[var(--school-accent)] text-white" onClick={() => setIsAddOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                </div>
            </div>

            <div className="rounded-xl border border-white/5 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-900 text-slate-400">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="w-[300px]">Item Details</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-center">Quantity</TableHead>
                            <TableHead className="text-right">Unit Cost</TableHead>
                            <TableHead className="text-right">Total Value</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="bg-slate-950/50">
                        {filteredItems.length > 0 ? filteredItems.map((item) => (
                            <TableRow key={item.id} className="border-white/5 hover:bg-transparent">
                                <TableCell>
                                    <div>
                                        <div className="font-bold text-white">{item.name}</div>
                                        <div className="text-xs text-slate-500">SKU: {item.sku || '-'}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="bg-slate-800 text-slate-300 pointer-events-none">
                                        {item.category?.name || 'Uncategorized'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center font-mono text-slate-300">
                                    <div className="flex flex-col items-center">
                                        <span className={`font-bold ${item.quantity_on_hand <= item.reorder_level ? 'text-red-500' : 'text-white'}`}>
                                            {item.quantity_on_hand}
                                        </span>
                                        <span className="text-[10px] text-slate-500 uppercase">{item.unit_type}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-mono text-slate-300">₦{(item.unit_cost || 0).toLocaleString()}</TableCell>
                                <TableCell className="text-right font-mono font-bold text-blue-400">
                                    ₦{((item.quantity_on_hand || 0) * (item.unit_cost || 0)).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-slate-900 border-white/10">
                                            <DropdownMenuItem className="text-slate-300 focus:bg-slate-800 focus:text-white cursor-pointer">
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setRestockItem(item)} className="text-slate-300 focus:bg-slate-800 focus:text-white cursor-pointer">
                                                <PackagePlus className="mr-2 h-4 w-4" /> Restock
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setDeleteItem(item)} className="text-red-500 focus:bg-red-950/20 focus:text-red-400 cursor-pointer">
                                                <Trash className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                    No items found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <AddItemModal open={isAddOpen} onOpenChange={setIsAddOpen} categories={categories} vendors={vendors} />

            <RestockModal
                item={restockItem}
                open={!!restockItem}
                onOpenChange={(v) => !v && setRestockItem(null)}
            />

            <AlertDialog open={!!deleteItem} onOpenChange={(v) => !v && setDeleteItem(null)}>
                <AlertDialogContent className="bg-slate-950 border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Inventory Item?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            Are you sure you want to delete <span className="font-bold text-white">{deleteItem?.name}</span>?
                            This action cannot be undone and will remove all transaction history for this item.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent text-slate-400 border-white/10 hover:bg-white/5 hover:text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white border-none">
                            Delete Item
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
