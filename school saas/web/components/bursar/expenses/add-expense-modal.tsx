"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Receipt, UploadCloud } from "lucide-react"
import { toast } from "sonner"
import { addExpense, getExpenseCategories } from "@/lib/actions/expenses"

interface AddExpenseModalProps {
    onSuccess: () => void
    children: React.ReactNode
}

export function AddExpenseModal({ onSuccess, children }: AddExpenseModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<any[]>([])
    const [file, setFile] = useState<File | null>(null)

    useEffect(() => {
        if (open) {
            loadCategories()
        }
    }, [open])

    const loadCategories = async () => {
        const res = await getExpenseCategories()
        if (res.success && res.data) {
            setCategories(res.data)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData(e.currentTarget)
            if (file) {
                formData.set('receipt', file)
            }

            const res = await addExpense(formData)

            if (res.success) {
                toast.success("Expense recorded successfully")
                setOpen(false)
                onSuccess()
            } else {
                toast.error(res.error || "Failed to record expense")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/5 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-[hsl(var(--school-accent))]" />
                        Record New Expense
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select name="category_id" required>
                                <SelectTrigger className="bg-slate-950 border-white/10 text-white">
                                    <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                                type="date"
                                name="date"
                                required
                                defaultValue={new Date().toISOString().split('T')[0]}
                                className="bg-slate-950 border-white/10 text-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Amount (₦)</Label>
                        <Input
                            type="number"
                            name="amount"
                            required
                            placeholder="0.00"
                            className="bg-slate-950 border-white/10 text-white font-mono text-lg"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Vendor / Payee</Label>
                        <Input
                            name="vendor"
                            required
                            placeholder="e.g. Electric Corp, John Doe"
                            className="bg-slate-950 border-white/10 text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            name="description"
                            placeholder="Details about the expense..."
                            className="bg-slate-950 border-white/10 text-white resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Receipt (Optional)</Label>
                        <div className="border border-dashed border-white/10 rounded-lg p-4 flex flex-col items-center justify-center bg-slate-950/50 hover:bg-slate-950 cursor-pointer transition-colors relative">
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                            <UploadCloud className="h-6 w-6 text-slate-400 mb-2" />
                            <span className="text-xs text-slate-400">
                                {file ? file.name : "Click to upload receipt"}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" className="bg-[hsl(var(--school-accent))] hover:opacity-90 w-full" disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Expense"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
