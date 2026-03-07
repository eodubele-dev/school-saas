"use client"

import { useState } from "react"
import { DiscountRule, createDiscountRule, toggleDiscountRule, deleteDiscountRule, CreateDiscountRuleData } from "@/lib/actions/discounts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, Plus, Trash2, Users, Percent, Activity, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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

export function BursarDiscountRules({ initialRules }: { initialRules: DiscountRule[] }) {
    const [rules, setRules] = useState<DiscountRule[]>(initialRules)
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    // Form State
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [triggerCount, setTriggerCount] = useState("3")
    const [discountType, setDiscountType] = useState<'percentage' | 'flat'>('percentage')
    const [discountValue, setDiscountValue] = useState("")
    const [targetRule, setTargetRule] = useState<'cheapest_child' | 'all_after_trigger' | 'all_children'>('cheapest_child')

    const handleCreate = async () => {
        if (!name || !discountValue) {
            toast.error("Please provide a name and discount value.")
            return
        }

        setLoading(true)
        const payload: CreateDiscountRuleData = {
            name,
            description: description || null,
            trigger_count: parseInt(triggerCount),
            discount_type: discountType,
            discount_value: parseFloat(discountValue),
            target_rule: targetRule,
            is_active: true
        }

        const res = await createDiscountRule(payload)
        if (res.success && res.data) {
            setRules([res.data, ...rules])
            toast.success("Discount Rule created successfully")
            setIsOpen(false)
            // Reset
            setName("")
            setDescription("")
            setDiscountValue("")
        } else {
            toast.error(res.error || "Failed to create rule")
        }
        setLoading(false)
    }

    const handleToggle = async (id: string, currentStatus: boolean) => {
        const res = await toggleDiscountRule(id, !currentStatus)
        if (res.success) {
            setRules(rules.map(r => r.id === id ? { ...r, is_active: !currentStatus } : r))
            toast.success(`Rule ${!currentStatus ? 'activated' : 'deactivated'}`)
        } else {
            toast.error(res.error || "Failed to toggle rule")
        }
    }

    const handleDelete = async (id: string) => {
        const res = await deleteDiscountRule(id)
        if (res.success) {
            setRules(rules.filter(r => r.id !== id))
            toast.success("Rule deleted")
        } else {
            toast.error(res.error || "Failed to delete")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 border border-white/10 p-6 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
                <div className="relative z-10">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-400" />
                        Family & Sibling Waivers
                    </h2>
                    <p className="text-slate-400 text-sm mt-1 max-w-xl">
                        Design automated discount schemas for parents enrolling multiple children. The invoice engine will actively scan for sibling clusters and inject defined waivers against their final tuition calculation.
                    </p>
                </div>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 relative z-10">
                            <Plus className="w-4 h-4 mr-2" /> New Rule
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-950 border-white/10 text-white max-w-md">
                        <DialogHeader>
                            <DialogTitle>Configure Discount Rule</DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Set the automated triggers and financial reductions.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Rule Name</Label>
                                <Input
                                    placeholder="e.g. 3rd Child 50% Off"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="bg-slate-900 border-white/10"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Trigger Count (Siblings)</Label>
                                    <Select value={triggerCount} onValueChange={setTriggerCount}>
                                        <SelectTrigger className="bg-slate-900 border-white/10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="2">2+ Children</SelectItem>
                                            <SelectItem value="3">3+ Children</SelectItem>
                                            <SelectItem value="4">4+ Children</SelectItem>
                                            <SelectItem value="5">5+ Children</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Reduction Type</Label>
                                    <Select value={discountType} onValueChange={(v: 'percentage' | 'flat') => setDiscountType(v)}>
                                        <SelectTrigger className="bg-slate-900 border-white/10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                                            <SelectItem value="flat">Flat Amount (₦)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-300">
                                    Discount Value {discountType === 'percentage' ? '(e.g. 50)' : '(e.g. 50,000)'}
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                        {discountType === 'percentage' ? <Percent className="w-4 h-4" /> : <span className="font-bold text-lg leading-none">₦</span>}
                                    </div>
                                    <Input
                                        type="number"
                                        placeholder={discountType === 'percentage' ? "50" : "50,000"}
                                        value={discountValue}
                                        onChange={e => setDiscountValue(e.target.value)}
                                        className="bg-slate-900 border-white/10 pl-9"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-300">Applying Target</Label>
                                <Select value={targetRule} onValueChange={(v: any) => setTargetRule(v)}>
                                    <SelectTrigger className="bg-slate-900 border-white/10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cheapest_child">Cheapest Sibling's Fee (Standard)</SelectItem>
                                        <SelectItem value="all_after_trigger">All Siblings After Trigger</SelectItem>
                                        <SelectItem value="all_children">Every Single Sibling</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-300">Internal Description (Optional)</Label>
                                <Input
                                    placeholder="Notes for finance team..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="bg-slate-900 border-white/10"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button disabled={loading} onClick={handleCreate} className="w-full bg-emerald-600 hover:bg-emerald-500">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save Rule Engine"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rules.length === 0 ? (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-white/10 rounded-xl bg-slate-900/50">
                        <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-slate-300">No Waiver Rules Active</h3>
                        <p className="text-slate-500 mt-1">Create a rule to automate sibling discounts during bulk invoicing.</p>
                    </div>
                ) : (
                    rules.map((rule) => (
                        <Card key={rule.id} className={`bg-slate-900 border-white/5 shadow-xl transition-all ${rule.is_active ? 'border-l-4 border-l-emerald-500' : 'opacity-60 border-l-4 border-l-slate-700'}`}>
                            <CardHeader className="pb-3 flex flex-row items-start justify-between">
                                <div>
                                    <CardTitle className="text-white flex items-center gap-2">
                                        {rule.name}
                                        {!rule.is_active && <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-white/10">Disabled</span>}
                                    </CardTitle>
                                    <CardDescription className="text-slate-400 mt-1">
                                        Fires on <strong className="text-emerald-400">{rule.trigger_count}+ active siblings</strong>
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-white/5">
                                        <Label className="text-xs cursor-pointer" htmlFor={`switch-${rule.id}`}>Active</Label>
                                        <Switch
                                            id={`switch-${rule.id}`}
                                            checked={rule.is_active}
                                            onCheckedChange={() => handleToggle(rule.id, rule.is_active)}
                                            className="data-[state=checked]:bg-emerald-500"
                                        />
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button size="icon" variant="ghost" className="text-red-400 hover:bg-red-500/10 hover:text-red-300">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-slate-950 border-white/10">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="text-white text-left">Delete Discount Rule?</AlertDialogTitle>
                                                <AlertDialogDescription className="text-slate-400 text-left">
                                                    Are you sure you want to permanently delete the <span className="text-white font-bold">{rule.name}</span> rule?
                                                    <br />
                                                    This will prevent it from applying to future invoice generations. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="bg-transparent text-slate-400 border-white/10 hover:bg-white/5 hover:text-white">Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(rule.id)} className="bg-red-600 hover:bg-red-700 text-white font-bold">
                                                    Delete Rule
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardHeader>
                            <CardContent className="py-2">
                                <div className="bg-slate-950 rounded-lg p-3 border border-white/5 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-md ${rule.discount_type === 'percentage' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                            {rule.discount_type === 'percentage' ? <Percent className="w-4 h-4" /> : <span className="font-bold text-lg leading-none">₦</span>}
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Deduction</div>
                                            <div className="text-white font-bold text-lg">
                                                {rule.discount_type === 'percentage' ? `${rule.discount_value}%` : `₦${rule.discount_value.toLocaleString()}`}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right border-l border-white/5 pl-4">
                                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Applied To</div>
                                        <div className="text-slate-300 text-sm">
                                            {rule.target_rule === 'cheapest_child' ? 'Cheapest Sibling' :
                                                rule.target_rule === 'all_after_trigger' ? 'Remaining Siblings' : 'All Siblings'}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-3 pb-4">
                                {rule.description && (
                                    <p className="text-sm text-slate-500 flex items-start gap-1.5 bg-slate-800/30 p-2 rounded-md w-full">
                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                        {rule.description}
                                    </p>
                                )}
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
