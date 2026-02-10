"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { restockItem } from "@/lib/actions/inventory"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface RestockModalProps {
    item: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function RestockModal({ item, open, onOpenChange }: RestockModalProps) {
    const [loading, setLoading] = useState(false)
    const [qty, setQty] = useState("")
    const [cost, setCost] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!item) return

        setLoading(true)
        const res = await restockItem(item.id, Number(qty), Number(cost))

        if (res.success) {
            toast.success(`Restocked ${item.name}`)
            onOpenChange(false)
            setQty("")
            setCost("")
        } else {
            toast.error(res.error)
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Restock {item?.name}</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Add new stock for this item. This will update the moving average cost.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>Quantity to Add</Label>
                        <Input
                            type="number"
                            required
                            min="1"
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                            className="bg-slate-950 border-white/10"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Unit Cost (₦)</Label>
                        <Input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={cost}
                            onChange={(e) => setCost(e.target.value)}
                            className="bg-slate-950 border-white/10"
                            placeholder="Current market price"
                        />
                        <p className="text-[10px] text-slate-500">Current Avg Cost: ₦{item?.unit_cost?.toLocaleString()}</p>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading} className="bg-[var(--school-accent)]">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirm Restock
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
