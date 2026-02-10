"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, MoreVertical, Edit, Trash, LayoutGrid } from "lucide-react"
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
import { deleteInventoryCategory } from "@/lib/actions/inventory"
import { toast } from "sonner"
import { AddCategoryModal } from "./add-category-modal"
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

interface CategoryManagerProps {
    initialCategories: any[]
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
    const [categories, setCategories] = useState(initialCategories)
    const [search, setSearch] = useState("")
    const router = useRouter()

    // Modals
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<any>(null)
    const [deleteCategory, setDeleteCategory] = useState<any>(null)

    // Sync with props
    useEffect(() => {
        setCategories(initialCategories)
    }, [initialCategories])

    // Derived state
    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase())
    )

    const handleDelete = async () => {
        if (!deleteCategory) return
        const res = await deleteInventoryCategory(deleteCategory.id)
        if (res.success) {
            toast.success("Category deleted")
            setDeleteCategory(null)
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
                        placeholder="Search categories..."
                        className="pl-9 bg-slate-950 border-white/10 text-white placeholder:text-slate-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <Button className="bg-[var(--school-accent)] text-white" onClick={() => {
                    setEditingCategory(null)
                    setIsAddOpen(true)
                }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Category
                </Button>
            </div>

            <div className="rounded-xl border border-white/5 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-900 text-slate-400">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="w-[300px]">Category Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="bg-slate-950/50">
                        {filteredCategories.length > 0 ? filteredCategories.map((category) => (
                            <TableRow key={category.id} className="border-white/5 hover:bg-transparent transition-colors">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-900 p-2 rounded-lg border border-white/5">
                                            <LayoutGrid className="h-4 w-4 text-blue-400" />
                                        </div>
                                        <div className="font-bold text-white">{category.name}</div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-400">
                                    {category.description || '-'}
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-slate-900 border-white/10">
                                            <DropdownMenuItem onClick={() => {
                                                setEditingCategory(category)
                                                setIsAddOpen(true)
                                            }} className="text-slate-300 focus:bg-slate-800 focus:text-white cursor-pointer">
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setDeleteCategory(category)} className="text-red-500 focus:bg-red-950/20 focus:text-red-400 cursor-pointer">
                                                <Trash className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-slate-500">
                                    No categories found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <AddCategoryModal
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                category={editingCategory}
            />

            <AlertDialog open={!!deleteCategory} onOpenChange={(v) => !v && setDeleteCategory(null)}>
                <AlertDialogContent className="bg-slate-950 border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            Are you sure you want to delete <span className="font-bold text-white">{deleteCategory?.name}</span>?
                            Items currently in this category will remain, but the category reference will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent text-slate-400 border-white/10 hover:bg-white/5 hover:text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white border-none">
                            Delete Category
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
