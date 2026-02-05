"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, CheckCircle, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter } from "next/navigation"
import { ConfirmModal } from "@/components/modals/confirm-modal"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface GradeScale {
    id: string
    grade: string
    min_score: number
    max_score: number
    remark: string
}

export function GradingConfigStep({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
    const [scales, setScales] = useState<GradeScale[]>([])
    const [loading, setLoading] = useState(true)
    const [tenantId, setTenantId] = useState<string | null>(null)
    const supabase = createClient()
    const router = useRouter() // Use router instance to redirect

    // Modal States
    const [isAddScaleOpen, setIsAddScaleOpen] = useState(false)
    const [newGradeLetter, setNewGradeLetter] = useState("")

    const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean, title: string, description: string, onConfirm: () => void }>({
        isOpen: false,
        title: "",
        description: "",
        onConfirm: () => { }
    })
    const closeConfirm = () => setConfirmConfig({ ...confirmConfig, isOpen: false })

    useEffect(() => {
        fetchScales()
    }, [])

    const fetchScales = async () => {
        try {
            // Get current user tenant
            if (!tenantId) {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
                    if (profile) setTenantId(profile.tenant_id)
                }
            }
            const { data } = await supabase.from('grade_scales').select('*').order('min_score', { ascending: false })
            if (data) setScales(data)
        } catch (e) {
            console.error(e)
            toast.error("Failed to load grading scales")
        } finally {
            setLoading(false)
        }
    }

    const openAddScale = () => {
        setNewGradeLetter("")
        setIsAddScaleOpen(true)
    }

    const addScale = async () => {
        if (!tenantId) {
            toast.error("Tenant ID not found")
            return
        }
        if (!newGradeLetter) return

        const { data, error } = await supabase.from('grade_scales').insert({
            grade: newGradeLetter,
            min_score: 0,
            max_score: 100,
            remark: 'Excellent',
            tenant_id: tenantId
        }).select().single()

        if (error) {
            toast.error("Failed to add scale: " + error.message)
            return
        }

        if (data) {
            setScales([...scales, data].sort((a, b) => b.min_score - a.min_score))
            toast.success("Scale Added")
            setIsAddScaleOpen(false)
        }
    }

    const updateScale = async (id: string, updates: Partial<GradeScale>) => {
        // Optimistic update
        setScales(scales.map(s => s.id === id ? { ...s, ...updates } : s).sort((a, b) => b.min_score - a.min_score))

        await supabase.from('grade_scales').update(updates).eq('id', id)
    }

    const deleteScale = async (id: string) => {
        setConfirmConfig({
            isOpen: true,
            title: "Delete Grade?",
            description: "Are you sure you want to delete this grading tier?",
            onConfirm: async () => {
                setScales(scales.filter(s => s.id !== id))
                await supabase.from('grade_scales').delete().eq('id', id)
                toast.success("Grade Deleted")
            }
        })
    }

    const handleFinish = () => {
        toast.success("Academic Configuration Completed!")
        router.push(".") // Reloads or redirects back to the main admin page if needed, or just stay
        // Ideally redirect to dashboard or show a "Done" state
        window.location.href = window.location.href.split('/setup')[0] // Go to dashboard root
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold text-white">Grading System</h2>
                <p className="text-slate-400">Define how students are graded. This scale is used globally for report cards.</p>
            </div>

            <Card className="bg-slate-900 border-white/10">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/5 hover:bg-white/5">
                                <TableHead className="text-slate-400">Grade</TableHead>
                                <TableHead className="text-slate-400">Min Score</TableHead>
                                <TableHead className="text-slate-400">Max Score</TableHead>
                                <TableHead className="text-slate-400">Remark</TableHead>
                                <TableHead className="text-right text-slate-400">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {scales.map(scale => (
                                <TableRow key={scale.id} className="border-white/5 hover:bg-white/5">
                                    <TableCell>
                                        <Input
                                            value={scale.grade}
                                            onChange={(e) => updateScale(scale.id, { grade: e.target.value })}
                                            className="w-16 h-8 bg-slate-950 border-white/10 font-bold text-center text-white"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={scale.min_score}
                                            onChange={(e) => updateScale(scale.id, { min_score: parseInt(e.target.value) })}
                                            className="w-20 h-8 bg-slate-950 border-white/10 text-center text-white"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={scale.max_score}
                                            onChange={(e) => updateScale(scale.id, { max_score: parseInt(e.target.value) })}
                                            className="w-20 h-8 bg-slate-950 border-white/10 text-center text-white"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            value={scale.remark}
                                            onChange={(e) => updateScale(scale.id, { remark: e.target.value })}
                                            className="max-w-[200px] h-8 bg-slate-950 border-white/10 text-white"
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="icon" variant="ghost" onClick={() => deleteScale(scale.id)} className="text-red-400 hover:bg-red-500/10 h-8 w-8">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div className="p-4 border-t border-white/5">
                        <Button onClick={openAddScale} variant="outline" className="w-full border-dashed border-white/20 hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                            <Plus className="mr-2 h-4 w-4" /> Add Grading Tier
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-between pt-8">
                <Button variant="ghost" onClick={onPrev} className="text-slate-400 hover:text-white hover:bg-white/5">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={onNext} className="bg-[var(--school-accent)] text-white px-8">
                    Proceed to Timetable Hub <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>

            {/* Add Scale Dialog */}
            <Dialog open={isAddScaleOpen} onOpenChange={setIsAddScaleOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Add New Grade</DialogTitle>
                        <DialogDescription className="text-slate-400">Enter the grade letter (e.g. A1, B2, C).</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Grade Letter</Label>
                            <Input
                                value={newGradeLetter}
                                onChange={e => setNewGradeLetter(e.target.value)}
                                placeholder="e.g. A1"
                                className="bg-slate-950 border-white/10 text-white"
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsAddScaleOpen(false)} className="text-slate-400">Cancel</Button>
                        <Button onClick={addScale} className="bg-[var(--school-accent)] text-white">Add Grade</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={closeConfirm}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                description={confirmConfig.description}
                variant="destructive"
                confirmText="Delete"
            />
        </div>
    )
}
