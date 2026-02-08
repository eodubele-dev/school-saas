"use client"

import { useState, useEffect } from "react"
import { Save, Loader2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { updateFeeSchedule } from "@/lib/actions/finance"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function SmartFeeMatrix({ classes, categories, schedule, domain }: { classes: any[], categories: any[], schedule: any[], domain: string }) {
    const router = useRouter()
    const [initialMatrix, setInitialMatrix] = useState<Record<string, number>>({})
    const [hasChanges, setHasChanges] = useState(false)
    const [matrix, setMatrix] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(false)

    // Initialize matrix from schedule
    useEffect(() => {
        const initial: Record<string, number> = {}
        schedule.forEach(item => {
            initial[`${item.class_id}_${item.category_id}`] = item.amount
        })
        setMatrix(initial)
        setInitialMatrix(initial)
        setHasChanges(false)
    }, [schedule])

    const checkForChanges = (current: Record<string, number>) => {
        // Simple JSON stringify comparison for now, or key-by-key
        // Optimization: only compare keys that exist in current
        let changed = false
        // Check for any key in current that differs from initial
        for (const key in current) {
            if (current[key] !== (initialMatrix[key] || 0)) {
                changed = true
                break
            }
        }
        // Also check if initial had keys that current doesn't (unlikely with this logic but good practice)
        if (!changed) {
            for (const key in initialMatrix) {
                if ((current[key] || 0) !== initialMatrix[key]) {
                    changed = true
                    break
                }
            }
        }
        setHasChanges(changed)
    }

    const handleAmountChange = (classId: string, catId: string, val: string) => {
        const newVal = Number(val)
        setMatrix(prev => {
            const next = {
                ...prev,
                [`${classId}_${catId}`]: newVal
            }
            checkForChanges(next)
            return next
        })
    }

    const saveChanges = async () => {
        setLoading(true)
        const updates = []
        for (const key in matrix) {
            const [classId, categoryId] = key.split('_')
            // Only send if different? Or send all? sending all is safer for upsert but more bandwith.
            // Let's send only diffs if we want to be fancy, but bulk upsert usually handles all.
            // For efficient save, let's send everything in matrix.
            updates.push({
                class_id: classId,
                category_id: categoryId,
                amount: matrix[key]
            })
        }

        const res = await updateFeeSchedule(updates)
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
        const amount = matrix[`${firstClassId}_${catId}`]

        if (amount === undefined) return

        if (!confirm(`Apply ₦${amount} to all classes for this fee?`)) return

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
        <Card className="bg-slate-900 border-white/10 h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-white">Fee Structure Matrix</CardTitle>
                    <CardDescription className="text-slate-400">Set amounts for each fee type per class.</CardDescription>
                </div>
                <Button onClick={saveChanges} disabled={loading || !hasChanges} className="bg-[var(--school-accent)] text-white">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
                <div className="border border-white/10 rounded-md">
                    <Table>
                        <TableHeader className="bg-slate-950 sticky top-0 z-10">
                            <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="text-white font-bold w-[120px] bg-slate-950 sticky left-0 z-20 shadow-[1px_0_0_rgba(255,255,255,0.1)]">Class / Fee</TableHead>
                                {categories.map(cat => (
                                    <TableHead key={cat.id} className="text-slate-300 min-w-[150px] text-center bg-slate-950">
                                        <div className="flex flex-col items-center gap-1">
                                            <span>{cat.name}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5 opacity-50 hover:opacity-100"
                                                title="Apply first value to all"
                                                onClick={() => applyToAll(cat.id)}
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {classes.map(cls => (
                                <TableRow key={cls.id} className="border-white/5 hover:bg-white/5">
                                    <TableCell className="font-medium text-slate-200 bg-slate-900 sticky left-0 z-10 shadow-[1px_0_0_rgba(255,255,255,0.1)]">
                                        {cls.name}
                                    </TableCell>
                                    {categories.map(cat => (
                                        <TableCell key={cat.id} className="p-2">
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">₦</span>
                                                <Input
                                                    type="number"
                                                    value={matrix[`${cls.id}_${cat.id}`] || 0}
                                                    onChange={(e) => handleAmountChange(cls.id, cat.id, e.target.value)}
                                                    className="h-8 pl-6 bg-slate-950 border-white/10 text-right text-white focus:border-[var(--school-accent)]"
                                                />
                                            </div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
