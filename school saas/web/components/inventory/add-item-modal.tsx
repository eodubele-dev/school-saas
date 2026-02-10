"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createInventoryItem } from "@/lib/actions/inventory"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface AddItemModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    categories: any[]
    vendors: any[]
}

export function AddItemModal({ open, onOpenChange, categories, vendors }: AddItemModalProps) {
    const { register, handleSubmit, reset, setValue, watch } = useForm()
    const [loading, setLoading] = useState(false)
    const [unitType, setUnitType] = useState("unit")
    const router = useRouter()

    const categoryId = watch("category_id")
    const vendorId = watch("vendor_id")

    const onSubmit = async (data: any) => {
        setLoading(true)
        const res = await createInventoryItem({
            ...data,
            unit_type: unitType,
            quantity_on_hand: Number(data.quantity_on_hand),
            reorder_level: Number(data.reorder_level),
            unit_cost: Number(data.unit_cost),
        })

        if (res.success) {
            toast.success("Item added successfully")
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
                    <DialogTitle>Add New Inventory Item</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Item Name</Label>
                        <Input {...register("name", { required: true })} className="bg-slate-950 border-white/10" placeholder="e.g. A4 Paper" />
                    </div>

                    <div className="space-y-2">
                        <Label>SKU (Optional)</Label>
                        <Input {...register("sku")} className="bg-slate-950 border-white/10" placeholder="e.g. SCH-001" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Input {...register("category_id")} className="hidden" />
                            <Select value={categoryId} onValueChange={(v) => setValue("category_id", v)}>
                                <SelectTrigger className="bg-slate-950 border-white/10 w-full">
                                    <SelectValue placeholder="Select Category..." />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                    {categories && categories.length > 0 ? (
                                        categories.map(cat => (
                                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-2 text-xs text-slate-500">No categories found</div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Unit Type</Label>
                            <Select value={unitType} onValueChange={setUnitType}>
                                <SelectTrigger className="bg-slate-950 border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                    <SelectItem value="unit">Unit</SelectItem>
                                    <SelectItem value="box">Box</SelectItem>
                                    <SelectItem value="ream">Ream</SelectItem>
                                    <SelectItem value="liter">Liter</SelectItem>
                                    <SelectItem value="set">Set</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Initial Qty</Label>
                            <Input type="number" {...register("quantity_on_hand")} className="bg-slate-950 border-white/10" defaultValue={0} />
                        </div>
                        <div className="space-y-2">
                            <Label>Reorder Level</Label>
                            <Input type="number" {...register("reorder_level")} className="bg-slate-950 border-white/10" defaultValue={10} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Unit Cost (₦)</Label>
                            <Input type="number" step="0.01" {...register("unit_cost")} className="bg-slate-950 border-white/10" placeholder="0.00" />
                        </div>
                        <div className="space-y-2">
                            <Label>Vendor (Optional)</Label>
                            <Input {...register("vendor_id")} className="hidden" />
                            <Select value={vendorId} onValueChange={(v) => setValue("vendor_id", v)}>
                                <SelectTrigger className="bg-slate-950 border-white/10 w-full">
                                    <SelectValue placeholder="Select Vendor..." />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                    {vendors && vendors.length > 0 ? (
                                        vendors.map(v => (
                                            <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-2 text-xs text-slate-500">No vendors found</div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading} className="bg-[var(--school-accent)]">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Item
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
