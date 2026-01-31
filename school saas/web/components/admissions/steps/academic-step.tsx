"use client"

import { useAdmissionStore } from "@/lib/stores/admission-store"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useEffect } from "react"

export function AcademicStep({ classes, houses }: { classes: any[], houses: string[] }) {
    const admissionNumber = useAdmissionStore(state => state.data.admissionNumber)
    const classId = useAdmissionStore(state => state.data.classId)
    const house = useAdmissionStore(state => state.data.house)
    const setData = useAdmissionStore(state => state.setData)
    const setStep = useAdmissionStore(state => state.setStep)

    useEffect(() => {
        if (!admissionNumber) {
            const year = new Date().getFullYear().toString().slice(-2)
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
            setData({ admissionNumber: `ADM/${year}/${random}` })
        }
    }, [])

    const handleNext = () => {
        if (!classId || !admissionNumber) return
        setStep(3)
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4 max-w-lg">
                <div className="space-y-2">
                    <Label className="text-slate-300">Assign Class <span className="text-red-500">*</span></Label>
                    <Select value={classId} onValueChange={(val) => setData({ classId: val })}>
                        <SelectTrigger className="bg-slate-950 border-white/10 text-white">
                            <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-300">Assign House</Label>
                    <Select value={house} onValueChange={(val) => setData({ house: val })}>
                        <SelectTrigger className="bg-slate-950 border-white/10 text-white">
                            <SelectValue placeholder="Select Sport House" />
                        </SelectTrigger>
                        <SelectContent>
                            {houses.map(h => (
                                <SelectItem key={h} value={h}>{h}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-300">Admission Number <span className="text-red-500">*</span></Label>
                    <div className="flex gap-2">
                        <Input
                            key={admissionNumber}
                            defaultValue={admissionNumber}
                            onBlur={(e) => setData({ admissionNumber: e.target.value })}
                            className="bg-slate-950 border-white/10 text-white font-mono"
                        />
                        <Button
                            type="button"
                            className="bg-slate-800 border border-white/10 text-white hover:bg-slate-700 hover:border-[var(--school-accent)] transition-all duration-300 antialiased font-semibold shadow-xl"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                const year = new Date().getFullYear().toString().slice(-2);
                                const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                                const newNum = `ADM/${year}/${random}`;
                                console.log('[AcademicStep] Triggering update to:', newNum);
                                setData({ admissionNumber: newNum });
                            }}
                        >
                            Regenerate
                        </Button>
                    </div>
                    <p className="text-xs text-slate-500">Unique identifier for the student.</p>
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <Button
                    variant="ghost"
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-slate-300 hover:text-white hover:bg-white/5 transition-colors duration-200 antialiased"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button
                    onClick={handleNext}
                    className="bg-[var(--school-accent)] hover:brightness-110 text-white"
                >
                    Next Step <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
