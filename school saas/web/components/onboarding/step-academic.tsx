'use client'

import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { BookOpen, GraduationCap, Library } from "lucide-react"

interface StepAcademicProps {
    data: any
    updateData: (key: string, value: any) => void
    onNext: () => void
    onBack: () => void
}

export function StepAcademic({ data, updateData, onNext, onBack }: StepAcademicProps) {
    const levels = [
        { id: 'nursery', label: 'Nursery / Pre-school' },
        { id: 'primary', label: 'Primary' },
        { id: 'jss', label: 'Junior Secondary (JSS)' },
        { id: 'sss', label: 'Senior Secondary (SSS)' },
    ]

    const toggleLevel = (id: string) => {
        const current = data.levels || []
        if (current.includes(id)) {
            updateData('levels', current.filter((l: string) => l !== id))
        } else {
            updateData('levels', [...current, id])
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <Label className="text-base">What levels do you operate?</Label>
                <div className="grid gap-3">
                    {levels.map((level) => (
                        <div key={level.id} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => toggleLevel(level.id)}>
                            <Checkbox
                                id={level.id}
                                checked={data.levels?.includes(level.id)}
                                onCheckedChange={() => toggleLevel(level.id)}
                            />
                            <Label htmlFor={level.id} className="cursor-pointer flex-1 font-normal">
                                {level.label}
                            </Label>
                        </div>
                    ))}
                </div>

                {data.levels?.includes('sss') && (
                    <Card className="p-4 border-amber-200 bg-amber-50">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="font-semibold text-amber-900">WAEC / JAMB Integration</Label>
                                <p className="text-xs text-amber-700">Enable advanced grading for Senior classes?</p>
                            </div>
                            <Switch
                                checked={data.waecStats}
                                onCheckedChange={(val) => updateData('waecStats', val)}
                            />
                        </div>
                    </Card>
                )}

                <Card className="p-4 border-blue-200 bg-blue-50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-600">
                            <Library className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-blue-900">NERDC Curriculum</h4>
                            <p className="text-xs text-blue-700">Pre-load standard Nigerian subjects?</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-white border-blue-200 text-blue-700 hover:bg-blue-50"
                            onClick={() => updateData('nerdcPresets', !data.nerdcPresets)}
                        >
                            {data.nerdcPresets ? "Loaded!" : "Load Presets"}
                        </Button>
                    </div>
                </Card>
            </div>

            <div className="flex gap-3">
                <Button variant="outline" onClick={onBack} className="w-1/3">Back</Button>
                <Button onClick={onNext} className="flex-1" disabled={!data.levels || data.levels.length === 0}>
                    Next Step
                </Button>
            </div>
        </div>
    )
}
