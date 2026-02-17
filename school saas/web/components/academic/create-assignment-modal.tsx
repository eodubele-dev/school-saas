"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Plus, UploadCloud, File as FileIcon, X, Pencil } from "lucide-react"
import { createAssignment, updateAssignment } from "@/lib/actions/assignments"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Assignment } from "@/types/assignments"

interface CreateAssignmentModalProps {
    classId: string
    subjectId: string
    trigger?: React.ReactNode
    initialData?: Assignment
    isOpen?: boolean
    onClose?: () => void
}

export function CreateAssignmentModal({ classId, subjectId, trigger, initialData, isOpen, onClose }: CreateAssignmentModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        dueDate: "",
        points: "100"
    })
    const [file, setFile] = useState<File | null>(null)
    const [existingFile, setExistingFile] = useState<{ url: string, name: string } | null>(null)

    // Sync external open state if controlled
    useEffect(() => {
        if (isOpen !== undefined) {
            setOpen(isOpen)
        }
    }, [isOpen])

    // Populate form if editing
    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                description: initialData.description || "",
                dueDate: initialData.due_date ? new Date(initialData.due_date).toISOString().slice(0, 16) : "",
                points: initialData.points?.toString() || "100"
            })
            if (initialData.file_url) {
                setExistingFile({
                    url: initialData.file_url,
                    name: initialData.file_name || "Attached File"
                })
            }
        } else {
            // Reset if switching to create mode
            setFormData({ title: "", description: "", dueDate: "", points: "100" })
            setExistingFile(null)
        }
    }, [initialData, open])

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen && onClose) {
            onClose()
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const removeFile = () => setFile(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const supabase = createClient()
            let fileUrl = existingFile?.url
            let fileName = existingFile?.name

            // 1. Upload New File if exists
            if (file) {
                const fileExt = file.name.split('.').pop()
                const path = `questions/${Date.now()}.${fileExt}`

                const { data, error: uploadError } = await supabase.storage
                    .from('assignments')
                    .upload(path, file)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('assignments')
                    .getPublicUrl(path)

                fileUrl = publicUrl
                fileName = file.name
            }

            const payload = {
                title: formData.title,
                description: formData.description,
                dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
                points: parseInt(formData.points) || 0,
                classId,
                subjectId,
                fileUrl,
                fileName
            }

            let res;
            if (initialData) {
                res = await updateAssignment(initialData.id, payload)
            } else {
                res = await createAssignment(payload)
            }

            if (res.success) {
                toast.success(initialData ? "Assignment updated successfully" : "Assignment created successfully")
                handleOpenChange(false)
                if (!initialData) {
                    setFormData({ title: "", description: "", dueDate: "", points: "100" })
                    setFile(null)
                    setExistingFile(null)
                }
            } else {
                toast.error(res.error || "Failed to save assignment")
            }
        } catch (err: any) {
            console.error(err)
            toast.error(err.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-[var(--school-accent)] text-white">
                        <Plus className="h-4 w-4 mr-2" /> Create Assignment
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-slate-950 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Assignment" : "Create Assignment"}</DialogTitle>
                    <DialogDescription>
                        {initialData ? "Update assignment details." : "Create a new assignment for your students."}
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
                    <div className="space-y-2">
                        <Label>Question Paper / Attachments (Optional)</Label>
                        {!file && !existingFile ? (
                            <div className="border border-dashed border-white/10 rounded-lg p-4 flex flex-col items-center justify-center bg-slate-900/50 hover:bg-slate-900 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                />
                                <UploadCloud className="h-6 w-6 text-slate-500 mb-1" />
                                <p className="text-xs text-slate-400 font-medium">Click to upload question paper</p>
                                <p className="text-[10px] text-slate-600">PDF, DOCX, JPG (Max 10MB)</p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-2.5 bg-slate-900 border border-white/10 rounded-lg">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className="h-8 w-8 bg-blue-500/10 rounded flex items-center justify-center flex-shrink-0">
                                        <FileIcon className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <div className="truncate">
                                        <p className="text-xs font-medium text-white truncate">{file ? file.name : existingFile?.name}</p>
                                        <p className="text-[10px] text-slate-500">{file ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : 'Existing File'}</p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setFile(null)
                                        setExistingFile(null)
                                    }}
                                    className="h-8 w-8 text-slate-500 hover:text-red-400"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </form>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => handleOpenChange(false)} className="text-slate-400 hover:text-white">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-[var(--school-accent)]">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? "Update Assignment" : "Create Assignment"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
