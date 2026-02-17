"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { UploadCloud, File as FileIcon, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { submitAssignment } from "@/lib/actions/assignments"

interface SubmitAssignmentModalProps {
    assignment: any
    trigger: React.ReactNode
    onSuccess?: () => void
}

export function SubmitAssignmentModal({ assignment, trigger, onSuccess }: SubmitAssignmentModalProps) {
    const [open, setOpen] = useState(false)
    const [content, setContent] = useState("")
    const [file, setFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const removeFile = () => setFile(null)

    const handleSubmit = async () => {
        if (!content && !file) {
            toast.error("Please add some text or attach a file.")
            return
        }

        setIsSubmitting(true)

        try {
            const supabase = createClient()
            let fileUrl = undefined

            // 1. Upload File if exists
            if (file) {
                const fileExt = file.name.split('.').pop()
                const fileName = `${assignment.id}/${Date.now()}.${fileExt}` // assignment_id/timestamp.ext

                const { data, error: uploadError } = await supabase.storage
                    .from('assignments')
                    .upload(fileName, file)

                if (uploadError) throw uploadError

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('assignments')
                    .getPublicUrl(fileName)

                fileUrl = publicUrl
            }

            // 2. Submit to Server Action
            const result = await submitAssignment(assignment.id, content, fileUrl)

            if (!result.success) {
                throw new Error(result.error || "Failed to submit")
            }

            toast.success("Assignment submitted successfully!")
            setOpen(false)
            setContent("")
            setFile(null)
            if (onSuccess) onSuccess()

        } catch (error: any) {
            console.error("Submission error:", error)
            toast.error(error.message || "Failed to submit assignment.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-slate-950 border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle>Submit Assignment</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        {assignment.title} • {assignment.subject}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {assignment.description && (
                        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 max-h-[150px] overflow-y-auto">
                            <div className="flex justify-between items-center mb-1">
                                <Label className="text-[10px] uppercase tracking-wider text-slate-500 block">Instructions / Questions</Label>
                                {assignment.fileUrl && (
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="h-auto p-0 text-cyan-400 text-[10px] font-bold h-4"
                                        onClick={() => window.open(assignment.fileUrl, '_blank')}
                                    >
                                        <FileIcon className="h-3 w-3 mr-1" />
                                        View Attachment
                                    </Button>
                                )}
                            </div>
                            <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {assignment.description}
                            </div>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="content" className="text-slate-300">Your Answer / Comments</Label>
                        <Textarea
                            id="content"
                            placeholder="Type your answer or add comments for your teacher here..."
                            className="bg-slate-900 border-slate-700 min-h-[150px] text-white placeholder:text-slate-500"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label className="text-slate-300">Attachments</Label>
                        {!file ? (
                            <div className="border border-dashed border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-900/50 hover:bg-slate-900 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handleFileChange}
                                />
                                <UploadCloud className="h-8 w-8 text-slate-500 mb-2" />
                                <p className="text-sm text-slate-400 font-medium">Click to upload file</p>
                                <p className="text-xs text-slate-600">PDF, DOCX, JPG (Max 10MB)</p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-700 rounded-lg">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="h-10 w-10 bg-[var(--school-accent)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <FileIcon className="h-5 w-5 text-[var(--school-accent)]" />
                                    </div>
                                    <div className="truncate">
                                        <p className="text-sm font-medium text-white truncate">{file.name}</p>
                                        <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={removeFile}
                                    className="text-slate-400 hover:text-red-400"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)} className="text-slate-400 hover:text-white hover:bg-white/10">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-[var(--school-accent)] text-white hover:bg-blue-600">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Turn In Assignment'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
