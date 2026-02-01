"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Plus, Trash2, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { upsertFeeCategory, deleteFeeCategory } from "@/lib/actions/finance"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function FeeCategoryManager({ categories, domain }: { categories: any[], domain: string }) {
    const router = useRouter()
    const { register, handleSubmit, reset } = useForm()
    const [loading, setLoading] = useState(false)

    const onSubmit = async (data: any) => {
        setLoading(true)
        const res = await upsertFeeCategory({ ...data, is_mandatory: data.is_mandatory || false }) // Handle switch output
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
        if (!confirm("Delete this category? Associated fees will also be removed.")) return
        const res = await deleteFeeCategory(id)
        if (res.success) {
            toast.success("Category deleted")
            router.refresh()
        } else {
            toast.error(res.error)
        }
    }

    return (
        <Card className="bg-slate-900 border-white/10 h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Tag className="h-5 w-5 text-[var(--school-accent)]" />
                    Fee Categories
                </CardTitle>
                <CardDescription className="text-slate-400">Define the types of fees collected (e.g., Tuition, Bus).</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
                <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 items-end border-b border-white/5 pb-6">
                    <div className="flex-1 space-y-2">
                        <label className="text-xs font-medium text-slate-300">Category Name</label>
                        <Input {...register("name", { required: true })} placeholder="e.g. Technology Fee" className="bg-slate-950 border-white/10" />
                    </div>
                    {/* Switch handling can be tricky with simple register in some UI libraries, assuming standard checkbox behavior works or controlled needed. 
                        For shadcn Switch, it's controlled. Let's use a standard checkbox with custom style or Controlled Switch.
                        For simplicity here, using standard checkbox visibly hidden or just a simple checkbox styled.
                    */}
                    <div className="flex items-center space-x-2 pb-2.5">
                        <input type="checkbox" {...register("is_mandatory")} className="h-4 w-4 rounded border-gray-300 bg-slate-950" id="mandatory" />
                        <label htmlFor="mandatory" className="text-sm font-medium text-slate-300">Mandatory?</label>
                    </div>
                    <Button type="submit" disabled={loading} size="sm" className="mb-0.5 bg-[var(--school-accent)]">
                        <Plus className="h-4 w-4" /> Add
                    </Button>
                </form>

                <div className="rounded-md border border-white/10 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-950">
                            <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="text-slate-400">Name</TableHead>
                                <TableHead className="text-slate-400">Type</TableHead>
                                <TableHead className="w-10"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((cat) => (
                                <TableRow key={cat.id} className="border-white/5 hover:bg-white/5">
                                    <TableCell className="font-medium text-slate-200">{cat.name}</TableCell>
                                    <TableCell>
                                        <span className={`text-xs px-2 py-1 rounded-full ${cat.is_mandatory ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                            {cat.is_mandatory ? 'Mandatory' : 'Optional'}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} className="h-6 w-6 text-slate-500 hover:text-red-500">
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
