"use client"

import { useState, useEffect } from "react"
import { Save, Loader2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { updateFeeSchedule } from "@/lib/actions/finance"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function SmartFeeMatrix({ classes, categories, schedule, domain }: { classes: any[], categories: any[], schedule: any[], domain: string }) {
    const router = useRouter()
    const [initialMatrix, setInitialMatrix] = useState<Record<string, string>>({})
    const [hasChanges, setHasChanges] = useState(false)
    const [matrix, setMatrix] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)

    // Initialize matrix from schedule
    useEffect(() => {
        const initial: Record<string, string> = {}
        schedule.forEach(item => {
            if (item.amount > 0) {
                initial[`${item.class_id}_${item.category_id}`] = String(item.amount)
            }
        })
        setMatrix(initial)
        setInitialMatrix(initial)
        setHasChanges(false)
    }, [schedule])

    const checkForChanges = (current: Record<string, string>) => {
        let changed = false
        for (const key in current) {
            if (current[key] !== (initialMatrix[key] || "")) {
                changed = true
                break
            }
        }
        if (!changed) {
            for (const key in initialMatrix) {
                if ((current[key] || "") !== initialMatrix[key]) {
                    changed = true
                    break
                }
            }
        }
        setHasChanges(changed)
    }

    const handleAmountChange = (classId: string, catId: string, val: string) => {
        // Allow removing the 0, only accept numbers or empty. Also allow decimals.
        // Strip commas before saving to state
        const cleanVal = val.replace(/,/g, '').replace(/[^0-9.]/g, '')

        setMatrix(prev => {
            const next = {
                ...prev,
                [`${classId}_${catId}`]: cleanVal
            }
            checkForChanges(next)
            return next
        })
    }

    const formatCurrencyDisplay = (val: string) => {
        if (!val) return "";
        const parts = val.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    }

    const saveChanges = async () => {
        setLoading(true)
        const updates = []
        for (const key in matrix) {
            const [classId, categoryId] = key.split('_')
            const amount = Number(matrix[key]) || 0
            updates.push({
                class_id: classId,
                category_id: categoryId,
                amount: amount
            })
        }

        const res = await updateFeeSchedule(updates, domain)
        if (res.success) {
            toast.success("Fee schedule updated")
            router.refresh()
            // Update initial matrix to current
            setInitialMatrix({ ...matrix })
            setHasChanges(false)
        } else {
            toast.error(res.error)
        }
        setLoading(false)
    }

    // Helper to apply first row amount to all rows for a column
    const applyToAll = (catId: string) => {
        const firstClassId = classes[0]?.id
        const amount = matrix[`${firstClassId}_${catId}`] || ""

        setMatrix(prev => {
            const next = { ...prev }
            classes.forEach(cls => {
                next[`${cls.id}_${catId}`] = amount
            })
            checkForChanges(next)
            return next
        })
    }

    return (
        <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-border h-full flex flex-col relative overflow-hidden shadow-2xl">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />

            <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border/50 bg-card text-card-foreground/50 backdrop-blur-xl sticky top-0 z-30">
                <div>
                    <CardTitle className="text-foreground text-xl flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                            <Save className="h-4 w-4 text-cyan-400" />
                        </div>
                        Smart Fee Matrix
                    </CardTitle>
                    <CardDescription className="text-muted-foreground mt-1">Configure automated billing amounts. Empty fields are treated as ₦0.</CardDescription>
                </div>
                <Button onClick={saveChanges} disabled={loading || !hasChanges} className="bg-cyan-600 hover:bg-cyan-500 text-foreground shadow-lg shadow-cyan-900/20 transition-all font-bold px-6">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Matrix
                </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
                <Table>
                    <TableHeader className="bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
                        <TableRow className="border-b border-border hover:bg-transparent">
                            <TableHead className="text-foreground font-bold w-[180px] bg-slate-950/90 backdrop-blur-md sticky left-0 z-20 shadow-[1px_0_0_rgba(255,255,255,0.05)] uppercase tracking-wider text-xs">
                                Class Level
                            </TableHead>
                            {categories.map(cat => (
                                <TableHead key={cat.id} className="text-slate-300 min-w-[200px] text-center bg-slate-950/80 backdrop-blur-md">
                                    <div className="flex flex-col items-center justify-center gap-2 py-2">
                                        <span className="font-semibold text-sm text-cyan-100">{cat.name}</span>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-6 text-[10px] bg-secondary/50 border-border hover:bg-cyan-500/20 hover:text-cyan-400 hover:border-cyan-500/30 transition-all rounded-full px-3"
                                                >
                                                    <Copy className="h-3 w-3 mr-1" /> Copy Down
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent className="bg-slate-950 border-border">
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="text-foreground">Copy Value Down?</AlertDialogTitle>
                                                    <AlertDialogDescription className="text-muted-foreground">
                                                        This will copy the value <span className="text-cyan-400 font-bold text-lg">₦{formatCurrencyDisplay(matrix[`${classes[0]?.id}_${cat.id}`] || "0")}</span> to ALL classes below for <strong className="text-foreground">{cat.name}</strong>.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="bg-transparent text-muted-foreground border-border hover:bg-secondary/50 hover:text-foreground">Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => applyToAll(cat.id)} className="bg-cyan-600 text-foreground font-bold hover:bg-cyan-500">
                                                        Yes, Apply to All
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {classes.map(cls => (
                            <TableRow key={cls.id} className="border-border/50 hover:bg-white-[0.02] transition-colors group">
                                <TableCell className="font-bold text-slate-300 bg-card text-card-foreground/50 group-hover:bg-slate-800/50 sticky left-0 z-10 shadow-[1px_0_0_rgba(255,255,255,0.05)] transition-colors">
                                    {cls.name}
                                </TableCell>
                                {categories.map(cat => (
                                    <TableCell key={cat.id} className="p-3">
                                        <div className="relative group/input">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium group-focus-within/input:text-cyan-500 transition-colors">₦</span>
                                            <Input
                                                type="text"
                                                inputMode="decimal"
                                                value={formatCurrencyDisplay(matrix[`${cls.id}_${cat.id}`] ?? "")}
                                                onChange={(e) => handleAmountChange(cls.id, cat.id, e.target.value)}
                                                className="h-10 pl-8 bg-slate-950/50 border-border text-right text-slate-200 font-medium focus:bg-card text-card-foreground focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-700 rounded-lg hover:border-white/20"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
