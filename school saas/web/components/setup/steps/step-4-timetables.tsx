"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Trash2, ArrowLeft, Check, Clock, Calendar, User, BookOpen } from "lucide-react"
import { toast } from "sonner"
import { createTimetableSlot, deleteTimetableSlot, getFullTimetable } from "@/lib/actions/schedule"
import { getClasses } from "@/lib/actions/classes"
import { getSubjects } from "@/lib/actions/academic"
import { getTeachersForAssignment } from "@/lib/actions/staff"
import { cn } from "@/lib/utils"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

export function TimetableManagerStep({ onPrev }: { onPrev: () => void }) {
    const [slots, setSlots] = useState<any[]>([])
    const [classes, setClasses] = useState<any[]>([])
    const [subjects, setSubjects] = useState<any[]>([])
    const [teachers, setTeachers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState("Monday")

    // Form State
    const [day, setDay] = useState("Monday")
    const [startTime, setStartTime] = useState("08:00")
    const [endTime, setEndTime] = useState("09:00")
    const [subjectId, setSubjectId] = useState("")
    const [classId, setClassId] = useState("")
    const [teacherId, setTeacherId] = useState("")

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [classesRes, subjectsRes, teachersRes, timetableRes] = await Promise.all([
                getClasses(),
                getSubjects(),
                getTeachersForAssignment(),
                getFullTimetable()
            ])

            if (classesRes.success && classesRes.data) setClasses(classesRes.data)
            if (subjectsRes.success && subjectsRes.data) setSubjects(subjectsRes.data)
            if (teachersRes.success && teachersRes.data) setTeachers(teachersRes.data)
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
            
            // Auto-switch tab to the day we just added to
            setActiveTab(day)
            
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

    if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Initializing Timetable Engine...</div>

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-foreground">Timetable Manager Hub</h2>
                    <p className="text-muted-foreground text-sm">Construct your school's daily schedule. Link subjects and teachers to specific class arms.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                    <BookOpen className="h-4 w-4 text-[var(--school-accent)]" />
                    <span className="text-xs font-bold text-slate-300">{slots.length} Slots Provisioned</span>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left: Add Slot Form */}
                <Card className="bg-card text-card-foreground border-border h-fit xl:sticky xl:top-0">
                    <CardContent className="p-6 space-y-4">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2 mb-2">
                            <Plus className="h-4 w-4 text-[var(--school-accent)]" />
                            Provision New Slot
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Academic Day</Label>
                                <Select value={day} onValueChange={setDay}>
                                    <SelectTrigger className="bg-slate-950 border-border/50 text-foreground">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Start Time</Label>
                                    <Input
                                        type="time"
                                        value={startTime}
                                        onChange={e => setStartTime(e.target.value)}
                                        className="bg-slate-950 border-border/50 text-foreground"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">End Time</Label>
                                    <Input
                                        type="time"
                                        value={endTime}
                                        onChange={e => setEndTime(e.target.value)}
                                        className="bg-slate-950 border-border/50 text-foreground"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Target Class (Arm)</Label>
                                <Select value={classId} onValueChange={setClassId}>
                                    <SelectTrigger className="bg-slate-950 border-border/50 text-foreground">
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Subject</Label>
                                <Select value={subjectId} onValueChange={setSubjectId}>
                                    <SelectTrigger className="bg-slate-950 border-border/50 text-foreground">
                                        <SelectValue placeholder="Select Subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Assigned Teacher</Label>
                                <Select value={teacherId} onValueChange={setTeacherId}>
                                    <SelectTrigger className="bg-slate-950 border-border/50 text-foreground">
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
                                className="w-full bg-[var(--school-accent)] text-foreground font-bold"
                            >
                                {saving ? "Synchronizing..." : "Add to Timetable"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Right: List of Slots with Pagination/Tabs */}
                <div className="xl:col-span-2">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="w-full bg-slate-950 border border-border/50 p-1 mb-6 h-12">
                            {days.map(d => (
                                <TabsTrigger 
                                    key={d} 
                                    value={d}
                                    className="flex-1 text-[10px] uppercase font-black tracking-widest data-[state=active]:bg-card data-[state=active]:text-[var(--school-accent)] transition-all"
                                >
                                    {d.slice(0, 3)}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <ScrollArea className="h-[600px] pr-4 rounded-xl">
                            {days.map(d => (
                                <TabsContent key={d} value={d} className="mt-0 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Calendar className="h-3 w-3 text-[var(--school-accent)]" />
                                            {d} Timeline
                                        </h4>
                                        <span className="text-[10px] text-slate-600 italic">
                                            {slots.filter(s => s.day_of_week === d).length} slots scheduled
                                        </span>
                                    </div>

                                    <div className="grid gap-3">
                                        {slots.filter(s => s.day_of_week === d).length === 0 ? (
                                            <div className="p-20 text-center border-2 border-dashed border-border/50 rounded-2xl bg-white/5">
                                                <BookOpen className="h-8 w-8 text-slate-800 mx-auto mb-4" />
                                                <p className="text-sm text-muted-foreground">No slots provisioned for {d}.</p>
                                            </div>
                                        ) : (
                                            slots.filter(s => s.day_of_week === d).map(slot => (
                                                <div
                                                    key={slot.id}
                                                    className="group flex items-center justify-between p-4 bg-card text-card-foreground border border-border/50 rounded-xl hover:border-[var(--school-accent)]/30 transition-all shadow-sm"
                                                >
                                                    <div className="flex items-center gap-6">
                                                        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-950 border border-border/50 min-w-[100px]">
                                                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400">
                                                                <Clock className="h-2.5 w-2.5" />
                                                                {slot.start_time ? slot.start_time.slice(0, 5) : "--:--"}
                                                            </div>
                                                            <div className="text-[10px] font-mono text-slate-600">to</div>
                                                            <div className="text-[10px] font-mono text-muted-foreground">
                                                                {slot.end_time ? slot.end_time.slice(0, 5) : "--:--"}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-bold text-foreground uppercase tracking-tight">{slot.subject?.name || "Deleted Subject"}</span>
                                                                <span className="text-[10px] bg-secondary/50 border border-border px-2 py-0.5 rounded text-muted-foreground font-bold">{slot.class?.name || "Unknown Class"}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                <User className="h-3 w-3" />
                                                                {slot.teacher?.full_name || "Unassigned Instructor"}
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
                                            ))
                                        )}
                                    </div>
                                </TabsContent>
                            ))}
                        </ScrollArea>
                    </Tabs>
                </div>
            </div>

            <div className="flex justify-between pt-8 border-t border-border/50">
                <Button variant="ghost" onClick={onPrev} className="text-muted-foreground hover:text-slate-200 hover:bg-white/10 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Grading
                </Button>
                <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                    <Check className="h-4 w-4" /> Comprehensive Setup Complete
                </div>
            </div>
        </div>
    )
}
