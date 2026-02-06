"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { logIncident } from "@/lib/actions/behavior"
import { toast } from "sonner"
import { AlertTriangle, Flag, CheckCircle2 } from "lucide-react"

export function IncidentForm({ students }: { students: any[] }) {
    const [studentId, setStudentId] = useState("")
    const [title, setTitle] = useState("")
    const [desc, setDesc] = useState("")
    const [type, setType] = useState<"positive" | "disciplinary" | "neutral">("disciplinary")
    const [submitting, setSubmitting] = useState(false)

    const handleLog = async () => {
        if (!studentId || !title) return

        setSubmitting(true)
        try {
            const res = await logIncident(studentId, {
                title,
                description: desc,
                type
            })

            if (res.success) {
                toast.success("Incident logged successfully.")
                // Reset form
                setTitle("")
                setDesc("")
                setStudentId("")
            } else {
                toast.error("Failed to log incident.")
            }
        } catch (e) {
            toast.error("Error submitting form.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Card className="p-6 bg-slate-900 border-white/5 max-w-2xl">
            <div className="mb-6">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <Flag className="h-5 w-5 text-amber-500" />
                    Incident & Remarks Log
                </h3>
                <p className="text-slate-400 text-sm">Securely log disciplinary issues or noteworthy praise.</p>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-400">Student</label>
                        <Select value={studentId} onValueChange={setStudentId}>
                            <SelectTrigger className="bg-slate-950 border-white/10 text-white">
                                <SelectValue placeholder="Select student" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 text-white border-white/10">
                                {students.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-slate-400">Log Type</label>
                        <Select value={type} onValueChange={(v: any) => setType(v)}>
                            <SelectTrigger className="bg-slate-950 border-white/10 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 text-white border-white/10">
                                <SelectItem value="disciplinary" className="text-amber-400">
                                    <div className="flex items-center gap-2"><AlertTriangle className="h-3 w-3" /> Disciplinary</div>
                                </SelectItem>
                                <SelectItem value="positive" className="text-cyan-400">
                                    <div className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3" /> Positive / Praise</div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400">Title / Headline</label>
                    <input
                        className="w-full h-10 rounded-md border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[var(--school-accent)]/20"
                        placeholder="e.g., Late to Assembly"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400">Detailed Description</label>
                    <Textarea
                        className="bg-slate-950 border-white/10 text-white min-h-[100px]"
                        placeholder="Provide context and details..."
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                    />
                </div>

                <Button
                    onClick={handleLog}
                    disabled={!studentId || !title || submitting}
                    className={`w-full font-bold ${type === 'disciplinary' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-cyan-600 hover:bg-cyan-700'} text-white shadow-lg`}
                >
                    {submitting ? "Submitting for Approval..." : "Log Entry"}
                </Button>
            </div>
        </Card>
    )
}
