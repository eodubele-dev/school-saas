"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus } from "lucide-react"
import { createAssignment } from "@/lib/actions/assignments"
import { toast } from "sonner"

interface CreateAssignmentModalProps {
    classId: string
    subjectId: string
    trigger?: React.ReactNode
}

export function CreateAssignmentModal({ classId, subjectId, trigger }: CreateAssignmentModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        dueDate: "",
        points: "100"
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await createAssignment({
                title: formData.title,
                description: formData.description,
                dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
                points: parseInt(formData.points) || 0,
                classId,
                subjectId
            })

            if (res.success) {
                toast.success("Assignment created successfully")
                setOpen(false)
                setFormData({ title: "", description: "", dueDate: "", points: "100" })
            } else {
                toast.error(res.error || "Failed to create assignment")
            }
        } catch (err) {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-[var(--school-accent)] text-white">
                        <Plus className="h-4 w-4 mr-2" /> Create Assignment
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-slate-950 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Create Assignment</DialogTitle>
                    <DialogDescription>
                        Create a new assignment for your students.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g. Essay on Shakespeare"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            className="bg-slate-900 border-white/10"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Instructions for the assignment..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="bg-slate-900 border-white/10 min-h-[100px]"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input
                                id="dueDate"
                                type="datetime-local"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className="bg-slate-900 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="points">Points</Label>
                            <Input
                                id="points"
                                type="number"
                                value={formData.points}
                                onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                                className="bg-slate-900 border-white/10"
                            />
                        </div>
                    </div>
                </form>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)} className="text-slate-400 hover:text-white">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-[var(--school-accent)]">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Assignment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
