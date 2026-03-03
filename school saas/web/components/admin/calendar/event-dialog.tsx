"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { CalendarDays, Save, Sparkles, AlertCircle } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { createSchoolEvent, updateSchoolEvent, type SchoolEvent } from "@/lib/actions/calendar"

interface EventDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
    event?: SchoolEvent | null
}

export function EventDialog({ open, onOpenChange, onSuccess, event }: EventDialogProps) {
    const isEditing = !!event

    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [type, setType] = useState<SchoolEvent["type"]>("academic")
    const [isPublic, setIsPublic] = useState(true)

    useEffect(() => {
        if (open) {
            if (event) {
                setTitle(event.title)
                setDescription(event.description || "")
                // Format for datetime-local input
                setStartDate(new Date(event.start_date).toISOString().slice(0, 16))
                setEndDate(event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : "")
                setType(event.type)
                setIsPublic(event.is_public)
            } else {
                setTitle("")
                setDescription("")
                setStartDate("")
                setEndDate("")
                setType("academic")
                setIsPublic(true)
            }
        }
    }, [open, event])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (!startDate) {
                toast.error("Start date is required")
                setLoading(false)
                return
            }

            const data = {
                title,
                description,
                start_date: new Date(startDate).toISOString(),
                end_date: endDate ? new Date(endDate).toISOString() : null as any,
                type,
                is_public: isPublic
            }

            let res
            if (isEditing) {
                res = await updateSchoolEvent(event.id, data)
            } else {
                res = await createSchoolEvent(data)
            }

            if (res.success) {
                toast.success(isEditing ? "Event updated successfully" : "Event created successfully")
                onSuccess()
                onOpenChange(false)
            } else {
                toast.error(res.error || "Failed to save event")
            }
        } catch (error: any) {
            toast.error(error.message || "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-slate-950 border-slate-800 text-slate-200">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-500/10 rounded-full flex items-center justify-center">
                            <CalendarDays className="h-5 w-5 text-indigo-500" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl text-white">
                                {isEditing ? "Edit Event" : "Create New Event"}
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                                {isEditing ? "Update the details for this calendar event." : "Add a new event to the school calendar."}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-white">Event Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g. Mid-Term Break"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="bg-slate-900 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start_date" className="text-white">Start Date & Time</Label>
                                <Input
                                    id="start_date"
                                    type="datetime-local"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-slate-900 border-white/10 text-white [color-scheme:dark] focus-visible:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end_date" className="text-white">End Date & Time</Label>
                                <Input
                                    id="end_date"
                                    type="datetime-local"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-slate-900 border-white/10 text-white [color-scheme:dark] focus-visible:ring-indigo-500"
                                />
                                <p className="text-[10px] text-slate-500">Optional for single-day events</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type" className="text-white">Event Category</Label>
                            <Select value={type} onValueChange={(val: any) => setType(val)}>
                                <SelectTrigger className="bg-slate-900 border-white/10 text-white focus:ring-indigo-500">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                    <SelectItem value="academic">Academic</SelectItem>
                                    <SelectItem value="holiday">Holiday</SelectItem>
                                    <SelectItem value="exam">Examination</SelectItem>
                                    <SelectItem value="sports">Sports</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-white">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Brief details about this event..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="bg-slate-900 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500 resize-none"
                                rows={3}
                            />
                        </div>

                        <div className="flex flex-row items-center justify-between rounded-xl border border-white/10 bg-slate-900/50 p-4">
                            <div className="space-y-0.5">
                                <Label className="text-white font-medium flex items-center gap-2">
                                    Visibility
                                    {isPublic && <Sparkles className="h-3 w-3 text-amber-500" />}
                                </Label>
                                <p className="text-xs text-slate-400">
                                    {isPublic ? "Visible to students, parents, and staff" : "Hidden (Draft mode or internal only)"}
                                </p>
                            </div>
                            <Switch
                                checked={isPublic}
                                onCheckedChange={setIsPublic}
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-white/5">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="text-slate-400 hover:bg-slate-800 hover:text-white"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !title || !startDate}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] gap-2"
                        >
                            {loading ? (
                                <span className="animate-spin text-lg leading-none py-0.5">↻</span>
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {isEditing ? "Save Changes" : "Create Event"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
