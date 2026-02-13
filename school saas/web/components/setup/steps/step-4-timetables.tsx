"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, ArrowLeft, Check, Clock, Calendar, User, BookOpen } from "lucide-react"
import { toast } from "sonner"
import { createTimetableSlot, deleteTimetableSlot, getFullTimetable } from "@/lib/actions/schedule"
import { cn } from "@/lib/utils"

export function TimetableManagerStep({ onPrev }: { onPrev: () => void }) {
    const [slots, setSlots] = useState<any[]>([])
    const [classes, setClasses] = useState<any[]>([])
    const [subjects, setSubjects] = useState<any[]>([])
    const [teachers, setTeachers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const supabase = createClient()

    // Form State
    const [day, setDay] = useState("Monday")
    const [startTime, setStartTime] = useState("08:00")
    const [endTime, setEndTime] = useState("09:00")
    const [subjectId, setSubjectId] = useState("")
    const [classId, setClassId] = useState("")
    const [teacherId, setTeacherId] = useState("")

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [classesRes, subjectsRes, teachersRes, timetableRes] = await Promise.all([
                supabase.from('classes').select('id, name').order('name'),
                supabase.from('subjects').select('id, name').order('name'),
                supabase.from('profiles').select('id, full_name').eq('role', 'teacher').order('full_name'),
                getFullTimetable()
            ])

            if (classesRes.data) setClasses(classesRes.data)
            if (subjectsRes.data) setSubjects(subjectsRes.data)
            if (teachersRes.data) setTeachers(teachersRes.data)
            setSlots(timetableRes)
        } catch (error) {
            console.error(error)
            toast.error("Failed to load timetable data")
        } finally {
            setLoading(false)
        }
    }

    const handleAddSlot = async () => {
        if (!classId || !subjectId || !teacherId) {
            toast.error("Please fill all fields")
            return
        }

        setSaving(true)
        try {
            await createTimetableSlot({
                day_of_week: day,
                start_time: startTime,
                end_time: endTime,
                subject_id: subjectId,
                class_id: classId,
                teacher_id: teacherId
            })

            toast.success("Timetable Slot Added")
            // Refresh data
            const updated = await getFullTimetable()
            setSlots(updated)

            // Reset some form fields
            setStartTime(endTime) // Auto-populate next slot start
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteSlot = async (id: string) => {
        try {
            await deleteTimetableSlot(id)
            setSlots(slots.filter(s => s.id !== id))
            toast.success("Slot removed")
        } catch (error: any) {
            toast.error(error.message)
        }
    }

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Initializing Timetable Engine...</div>

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white">Timetable Manager Hub</h2>
                    <p className="text-slate-400">Construct your school's daily schedule. Link subjects and teachers to specific class arms.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left: Add Slot Form */}
                <Card className="bg-slate-900 border-white/10 h-fit xl:sticky xl:top-0">
                    <CardContent className="p-6 space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-2">
                            <Plus className="h-4 w-4 text-[var(--school-accent)]" />
                            Provision New Slot
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs text-slate-500">Academic Day</Label>
                                <Select value={day} onValueChange={setDay}>
                                    <SelectTrigger className="bg-slate-950 border-white/5 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-500">Start Time</Label>
                                    <Input
                                        type="time"
                                        value={startTime}
                                        onChange={e => setStartTime(e.target.value)}
                                        className="bg-slate-950 border-white/5 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-500">End Time</Label>
                                    <Input
                                        type="time"
                                        value={endTime}
                                        onChange={e => setEndTime(e.target.value)}
                                        className="bg-slate-950 border-white/5 text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-slate-500">Target Class (Arm)</Label>
                                <Select value={classId} onValueChange={setClassId}>
                                    <SelectTrigger className="bg-slate-950 border-white/5 text-white">
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-slate-500">Subject</Label>
                                <Select value={subjectId} onValueChange={setSubjectId}>
                                    <SelectTrigger className="bg-slate-950 border-white/5 text-white">
                                        <SelectValue placeholder="Select Subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-slate-500">Assigned Teacher</Label>
                                <Select value={teacherId} onValueChange={setTeacherId}>
                                    <SelectTrigger className="bg-slate-950 border-white/5 text-white">
                                        <SelectValue placeholder="Choose Instructor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                onClick={handleAddSlot}
                                disabled={saving}
                                className="w-full bg-[var(--school-accent)] text-white font-bold"
                            >
                                {saving ? "Synchronizing..." : "Add to Timetable"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Right: List of Slots */}
                <div className="xl:col-span-2 space-y-6">
                    {days.map(d => {
                        const daySlots = slots.filter(s => s.day_of_week === d)
                        if (daySlots.length === 0) return null

                        return (
                            <div key={d} className="space-y-3">
                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    {d} Timeline
                                </h4>
                                <div className="grid gap-3">
                                    {daySlots.map(slot => (
                                        <div
                                            key={slot.id}
                                            className="group flex items-center justify-between p-4 bg-slate-900/40 border border-white/5 rounded-xl hover:bg-slate-900/60 hover:border-white/10 transition-all"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-950 border border-white/5 min-w-[100px]">
                                                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400">
                                                        <Clock className="h-2.5 w-2.5" />
                                                        {slot.start_time.slice(0, 5)}
                                                    </div>
                                                    <div className="text-[10px] font-mono text-slate-600">to</div>
                                                    <div className="text-[10px] font-mono text-slate-500">
                                                        {slot.end_time.slice(0, 5)}
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-white uppercase tracking-tight">{slot.subject?.name}</span>
                                                        <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-slate-400 font-bold">{slot.class?.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <User className="h-3 w-3" />
                                                        {slot.teacher?.full_name}
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteSlot(slot.id)}
                                                className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/10 transition-all"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}

                    {slots.length === 0 && (
                        <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-2xl">
                            <BookOpen className="h-10 w-10 text-slate-800 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">Timetable is currently empty.</p>
                            <p className="text-xs text-slate-600 mt-1">Begin by provisioning slots using the control panel on the left.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between pt-8 border-t border-white/5">
                <Button variant="ghost" onClick={onPrev} className="text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Grading
                </Button>
                <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                    <Check className="h-4 w-4" /> Comprehensive Setup Complete
                </div>
            </div>
        </div>
    )
}
