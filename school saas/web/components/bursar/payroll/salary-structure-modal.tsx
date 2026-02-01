"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Lock } from "lucide-react"
import { toast } from "sonner"
import { upsertSalaryStructure } from "@/lib/actions/payroll"

interface SalaryStructureModalProps {
    staff: any
    onSuccess: () => void
    children: React.ReactNode
}

export function SalaryStructureModal({ staff, onSuccess, children }: SalaryStructureModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        base_salary: staff.salary_struct?.base_salary || 0,
        housing_allowance: staff.salary_struct?.housing_allowance || 0,
        transport_allowance: staff.salary_struct?.transport_allowance || 0,
        tax_deduction: staff.salary_struct?.tax_deduction || 0,
        pension_deduction: staff.salary_struct?.pension_deduction || 0,
        bank_name: staff.salary_struct?.bank_name || "",
        account_number: staff.salary_struct?.account_number || "",
        account_name: staff.salary_struct?.account_name || ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await upsertSalaryStructure(staff.id, formData)
            if (res.success) {
                toast.success("Salary structure updated")
                setOpen(false)
                onSuccess()
            } else {
                toast.error(res.error || "Failed to update")
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
            <DialogContent className="bg-slate-900 border-white/5 text-white max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-amber-500" />
                        Salary Structure: {staff.first_name} {staff.last_name}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-slate-400">Base Salary (₦)</Label>
                            <Input
                                type="number"
                                className="bg-slate-950 border-white/10 text-white"
                                value={formData.base_salary}
                                onChange={e => setFormData({ ...formData, base_salary: Number(e.target.value) })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-400">Housing Allowance (₦)</Label>
                            <Input
                                type="number"
                                className="bg-slate-950 border-white/10 text-white"
                                value={formData.housing_allowance}
                                onChange={e => setFormData({ ...formData, housing_allowance: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-400">Transport Allowance (₦)</Label>
                            <Input
                                type="number"
                                className="bg-slate-950 border-white/10 text-white"
                                value={formData.transport_allowance}
                                onChange={e => setFormData({ ...formData, transport_allowance: Number(e.target.value) })}
                            />
                        </div>

                        <div className="col-span-2 border-t border-white/5 my-2"></div>

                        <div className="space-y-2">
                            <Label className="text-slate-400">Tax Deduction (₦)</Label>
                            <Input
                                type="number"
                                className="bg-slate-950 border-white/10 text-white"
                                value={formData.tax_deduction}
                                onChange={e => setFormData({ ...formData, tax_deduction: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-400">Pension Deduction (₦)</Label>
                            <Input
                                type="number"
                                className="bg-slate-950 border-white/10 text-white"
                                value={formData.pension_deduction}
                                onChange={e => setFormData({ ...formData, pension_deduction: Number(e.target.value) })}
                            />
                        </div>

                        <div className="col-span-2 border-t border-white/5 my-2"></div>

                        <div className="col-span-2 grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-400">Bank Name</Label>
                                <Input
                                    className="bg-slate-950 border-white/10 text-white"
                                    value={formData.bank_name}
                                    onChange={e => setFormData({ ...formData, bank_name: e.target.value })}
                                    placeholder="e.g. GTBank"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-400">Account Number</Label>
                                <Input
                                    className="bg-slate-950 border-white/10 text-white"
                                    value={formData.account_number}
                                    onChange={e => setFormData({ ...formData, account_number: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-400">Account Name</Label>
                                <Input
                                    className="bg-slate-950 border-white/10 text-white"
                                    value={formData.account_name}
                                    onChange={e => setFormData({ ...formData, account_name: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-500" disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Structure"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
