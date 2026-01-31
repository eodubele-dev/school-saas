"use client"

import { useState } from "react"
import { Calendar, Save, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { updateGlobalSession } from "@/lib/actions/academic"
import { toast } from "sonner"

export function SessionManager({ currentSession, domain }: { currentSession?: any, domain: string }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        session: currentSession?.session || "2025/2026",
        term: currentSession?.term || "First Term",
        startDate: currentSession?.start_date || "",
        endDate: currentSession?.end_date || ""
    })

    const handleSave = async () => {
        setLoading(true)
        const res = await updateGlobalSession(domain, { ...formData, is_active: true })
        if (res.success) {
            toast.success("Global session updated")
        } else {
            toast.error(res.error)
        }
        setLoading(false)
    }

    return (
        <Card className="bg-slate-900 border-white/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Calendar className="h-5 w-5 text-[var(--school-accent)]" />
                    Global Session Management
                </CardTitle>
                <CardDescription className="text-slate-400">
                    Set the active academic session. This locks/unlocks grade entry globally.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-slate-300">Academic Session</Label>
                        <Input
                            value={formData.session}
                            onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                            className="bg-slate-950 border-white/10 text-white"
                            placeholder="e.g. 2025/2026"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-slate-300">Current Term</Label>
                        <Select
                            value={formData.term}
                            onValueChange={(val) => setFormData({ ...formData, term: val })}
                        >
                            <SelectTrigger className="bg-slate-950 border-white/10 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-white/10 text-white">
                                <SelectItem value="First Term">First Term</SelectItem>
                                <SelectItem value="Second Term">Second Term</SelectItem>
                                <SelectItem value="Third Term">Third Term</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-slate-300">Start Date</Label>
                        <Input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="bg-slate-950 border-white/10 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-slate-300">End Date</Label>
                        <Input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            className="bg-slate-950 border-white/10 text-white"
                        />
                    </div>
                </div>

                <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full bg-[var(--school-accent)] text-white hover:brightness-110"
                >
                    {loading ? "Saving..." : "Set as Active Session"}
                </Button>
            </CardContent>
        </Card>
    )
}
