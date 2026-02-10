"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { createInventoryCategory, updateInventoryCategory } from "@/lib/actions/inventory"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface AddCategoryModalProps {
    category?: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AddCategoryModal({ category, open, onOpenChange }: AddCategoryModalProps) {
    const { register, handleSubmit, reset, setValue } = useForm()
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (category) {
            setValue("name", category.name)
            setValue("description", category.description)
        } else {
            reset({
                name: "",
                description: ""
            })
        }
    }, [category, setValue, reset, open])

    const onSubmit = async (data: any) => {
        setLoading(true)
        const res = category
            ? await updateInventoryCategory(category.id, data)
            : await createInventoryCategory(data)

        if (res.success) {
            toast.success(category ? "Category updated" : "Category added")
            reset()
            router.refresh()
            onOpenChange(false)
        } else {
            toast.error(res.error)
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{category ? "Edit Category" : "Add New Category"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Category Name</Label>
                        <Input {...register("name", { required: true })} className="bg-slate-950 border-white/10" placeholder="e.g. Stationery, Electronics..." />
                    </div>

                    <div className="space-y-2">
                        <Label>Description (Optional)</Label>
                        <Textarea {...register("description")} className="bg-slate-950 border-white/10 min-h-[100px]" placeholder="Brief description of items in this category..." />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading} className="bg-[var(--school-accent)]">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {category ? "Update Category" : "Save Category"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
