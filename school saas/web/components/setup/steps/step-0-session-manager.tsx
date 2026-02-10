"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { Loader2, ArrowRight, Save, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getActiveAcademicSession, updateGlobalSession } from "@/lib/actions/academic"
import { toast } from "sonner"
import { useParams } from "next/navigation"

export function SessionManagerStep({ onNext }: { onNext: () => void }) {
    const params = useParams()
    const domain = params.domain as string

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Form State
    const [sessionYear, setSessionYear] = useState("")
    const [term, setTerm] = useState("")
    const [startDate, setStartDate] = useState<Date | undefined>(undefined)
    const [endDate, setEndDate] = useState<Date | undefined>(undefined)

    useEffect(() => {
        loadSession()
    }, [])

    const loadSession = async () => {
        try {
            const res = await getActiveAcademicSession()
            if (res.success && res.session) {
                setSessionYear(res.session.session)
                setTerm(res.session.term)
                setStartDate(res.session.start_date ? new Date(res.session.start_date) : undefined)
                setEndDate(res.session.end_date ? new Date(res.session.end_date) : undefined)
            } else {
                // Default defaults
                const currentYear = new Date().getFullYear()
                setSessionYear(`${currentYear}/${currentYear + 1}`)
                setTerm("1st Term")
            }
        } catch (error) {
            toast.error("Failed to load session settings")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!sessionYear || !term || !startDate || !endDate) {
            toast.error("Please fill all fields")
            return
        }

        setSaving(true)
        try {
            const res = await updateGlobalSession(domain, {
                session: sessionYear,
                term,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                is_active: true
            })

            if (res.success) {
                toast.success("Active Session Updated Successfully!")
                onNext()
            } else {
                toast.error(res.error || "Failed to update session")
            }
        } catch (error) {
            toast.error("System Error")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-[var(--school-accent)]" /></div>
    }

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 border border-white/10 rounded-xl p-6 md:p-8">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-[var(--school-accent)]" />
                            Active Academic Session
                        </h2>
                        <p className="text-slate-400 mt-1">
                            Set the current academic year and term. This controls enrollment, billing, and report cards.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Session Year */}
                    <div className="space-y-2">
                        <Label className="text-slate-300">Academic Year <span className="text-red-500">*</span></Label>
                        <Input
                            value={sessionYear}
                            onChange={(e) => setSessionYear(e.target.value)}
                            placeholder="e.g. 2023/2024"
                            className="bg-slate-950 border-white/10 text-white placeholder:text-slate-600"
                        />
                        <p className="text-xs text-slate-500">The main academic cycle identifier.</p>
                    </div>

                    {/* Term */}
                    <div className="space-y-2">
                        <Label className="text-slate-300">Current Term <span className="text-red-500">*</span></Label>
                        <Select value={term} onValueChange={setTerm}>
                            <SelectTrigger className="bg-slate-950 border-white/10 text-white">
                                <SelectValue placeholder="Select Term" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1st Term">1st Term</SelectItem>
                                <SelectItem value="2nd Term">2nd Term</SelectItem>
                                <SelectItem value="3rd Term">3rd Term</SelectItem>
                                <SelectItem value="Summer">Summer / Holiday</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Start Date */}
                    <div className="space-y-2">
                        <Label className="text-slate-300">Start Date <span className="text-red-500">*</span></Label>
                        <Input
                            type="date"
                            value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                            onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : undefined)}
                            className="bg-slate-950 border-white/10 text-white [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                        />
                    </div>

                    {/* End Date */}
                    <div className="space-y-2">
                        <Label className="text-slate-300">End Date <span className="text-red-500">*</span></Label>
                        <Input
                            type="date"
                            value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                            onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : undefined)}
                            className="bg-slate-950 border-white/10 text-white [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-[var(--school-accent)] hover:bg-[var(--school-accent)]/90 text-white min-w-[150px]"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                            </>
                        ) : (
                            <>
                                Save & Continue <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
