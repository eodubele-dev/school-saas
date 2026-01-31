"use client"

import { useState, useEffect } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { Trash2, Plus, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { saveGradeScales, loadWAECStandards } from "@/lib/actions/academic"
import { toast } from "sonner"

export function GradingConfig({ initialScales, domain }: { initialScales: any[], domain: string }) {
    const { register, control, handleSubmit, reset } = useForm({
        defaultValues: { scales: initialScales.length ? initialScales : [{ grade: '', min: 0, max: 0, remark: '' }] }
    })
    const { fields, append, remove } = useFieldArray({
        control,
        name: "scales"
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (initialScales.length) reset({ scales: initialScales })
    }, [initialScales, reset])

    const onSubmit = async (data: any) => {
        setLoading(true)
        // Transform data to fit DB schema (min -> min_score) if needed strictly, or adjust form names
        // Let's assume input names match DB or we map here. 
        // For simplicity let's use correct names in register.

        const res = await saveGradeScales(data.scales)
        if (res.success) toast.success("Grading system saved")
        else toast.error(res.error)
        setLoading(false)
    }

    const handleLoadWAEC = async () => {
        if (!confirm("This will replace current grading scales. Continue?")) return
        setLoading(true)
        const res = await loadWAECStandards(domain)
        if (res.success) {
            toast.success("WAEC Standards loaded")
            // Ideally trigger refresh or re-fetch, simplistic here
            window.location.reload()
        }
        setLoading(false)
    }

    return (
        <Card className="bg-slate-900 border-white/10 h-full flex flex-col">
            <CardHeader className="flex-none">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-white">Grading System</CardTitle>
                        <CardDescription className="text-slate-400">Define score ranges and remarks.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleLoadWAEC} className="border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10">
                        <Download className="mr-2 h-4 w-4" /> Load WAEC
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto min-h-[300px]">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="text-slate-400 w-20">Grade</TableHead>
                                <TableHead className="text-slate-400 w-20">Min</TableHead>
                                <TableHead className="text-slate-400 w-20">Max</TableHead>
                                <TableHead className="text-slate-400">Remark</TableHead>
                                <TableHead className="w-10"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fields.map((field, index) => (
                                <TableRow key={field.id} className="border-white/5 hover:bg-white/5">
                                    <TableCell>
                                        <Input {...register(`scales.${index}.grade` as const)} className="h-8 bg-slate-950 border-white/10 text-white" placeholder="A" />
                                    </TableCell>
                                    <TableCell>
                                        <Input {...register(`scales.${index}.min_score` as const)} type="number" className="h-8 bg-slate-950 border-white/10 text-white" placeholder="75" />
                                    </TableCell>
                                    <TableCell>
                                        <Input {...register(`scales.${index}.max_score` as const)} type="number" className="h-8 bg-slate-950 border-white/10 text-white" placeholder="100" />
                                    </TableCell>
                                    <TableCell>
                                        <Input {...register(`scales.${index}.remark` as const)} className="h-8 bg-slate-950 border-white/10 text-white" placeholder="Excellent" />
                                    </TableCell>
                                    <TableCell>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-8 w-8 text-red-500 hover:text-red-400">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div className="flex justify-between pt-2">
                        <Button type="button" variant="secondary" size="sm" onClick={() => append({ grade: '', min_score: 0, max_score: 0, remark: '' })}>
                            <Plus className="mr-2 h-4 w-4" /> Add Row
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-[var(--school-accent)]">
                            {loading ? "Saving..." : "Save Config"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
