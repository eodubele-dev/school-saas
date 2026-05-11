"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Plus, Trash2, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { upsertFeeCategory, deleteFeeCategory } from "@/lib/actions/finance"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function FeeCategoryManager({ categories, domain }: { categories: any[], domain: string }) {
    const router = useRouter()
    const { register, handleSubmit, reset, formState: { isValid, isSubmitting } } = useForm({ mode: "onChange" })
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    const totalPages = Math.max(1, Math.ceil(categories.length / itemsPerPage))
    const currentCategories = categories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const onSubmit = async (data: any) => {
        setLoading(true)
        const res = await upsertFeeCategory({ ...data, is_mandatory: data.is_mandatory || false }, domain) // Handle switch output
        if (res.success) {
            toast.success("Fee category saved")
            reset()
            router.refresh()
        } else {
            toast.error(res.error)
        }
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        // Confirmation handled by UI Dialog
        const res = await deleteFeeCategory(id, domain)
        if (res.success) {
            toast.success("Category deleted")
            router.refresh()
        } else {
            toast.error(res.error)
        }
    }

    return (
        <Card className="bg-card text-card-foreground border-border h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                    <Tag className="h-5 w-5 text-[var(--school-accent)]" />
                    Fee Categories
                </CardTitle>
                <CardDescription className="text-muted-foreground">Define the types of fees collected (e.g., Tuition, Bus).</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
                <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 items-end border-b border-border/50 pb-6">
                    <div className="flex-1 space-y-2">
                        <label className="text-xs font-medium text-slate-300">Category Name</label>
                        <Input {...register("name", { required: true, minLength: 2 })} placeholder="e.g. Technology Fee" className="bg-slate-950 border-border text-foreground" />
                    </div>
                    {/* Switch handling can be tricky with simple register in some UI libraries, assuming standard checkbox behavior works or controlled needed. 
                        For shadcn Switch, it's controlled. Let's use a standard checkbox with custom style or Controlled Switch.
                        For simplicity here, using standard checkbox visibly hidden or just a simple checkbox styled.
                    */}
                    <div className="flex items-center space-x-2 pb-2.5">
                        <input type="checkbox" {...register("is_mandatory")} className="h-4 w-4 rounded border-gray-300 bg-slate-950 accent-[var(--school-accent)]" id="mandatory" />
                        <label htmlFor="mandatory" className="text-sm font-medium text-slate-300">Mandatory?</label>
                    </div>
                    <Button type="submit" disabled={!isValid || loading || isSubmitting} size="sm" className="mb-0.5 bg-[var(--school-accent)] text-foreground">
                        <Plus className="h-4 w-4" /> Add
                    </Button>
                </form>

                <div className="rounded-md border border-border overflow-hidden flex flex-col justify-between min-h-[420px]">
                    <div className="flex-1">
                        <Table>
                            <TableHeader className="bg-slate-950">
                                <TableRow className="border-border hover:bg-transparent">
                                    <TableHead className="text-muted-foreground">Name</TableHead>
                                    <TableHead className="text-muted-foreground">Type</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentCategories.map((cat) => (
                                    <TableRow key={cat.id} className="border-border/50 hover:bg-secondary/50">
                                        <TableCell className="font-medium text-slate-200">{cat.name}</TableCell>
                                        <TableCell>
                                            <span className={`text-xs px-2 py-1 rounded-full ${cat.is_mandatory ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                                {cat.is_mandatory ? 'Mandatory' : 'Optional'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500">
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="bg-slate-950 border-border">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="text-foreground text-left">Delete Category?</AlertDialogTitle>
                                                        <AlertDialogDescription className="text-muted-foreground text-left">
                                                            Are you sure you want to delete <span className="text-foreground font-bold">{cat.name}</span>?
                                                            <br />
                                                            This will also remove all associated fee entries from the matrix. This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="bg-transparent text-muted-foreground border-border hover:bg-secondary/50 hover:text-foreground">Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(cat.id)} className="bg-red-600 hover:bg-red-700 text-foreground font-bold">
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-t border-border/50">
                            <div className="text-sm text-muted-foreground">
                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, categories.length)} of {categories.length} categories
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    variant="outline"
                                    type="button"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="bg-card text-card-foreground border-border text-slate-300 hover:bg-slate-800 hover:text-foreground"
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    type="button"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="bg-card text-card-foreground border-border text-slate-300 hover:bg-slate-800 hover:text-foreground"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
