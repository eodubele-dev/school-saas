"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { addCurriculumMilestone, updateCurriculumMilestone, deleteCurriculumMilestone } from "@/lib/actions/curriculum"
import { Loader2, Trash2 } from "lucide-react"

const milestoneSchema = z.object({
    subject: z.string().min(2, "Subject is required"),
    topic: z.string().min(2, "Topic is required"),
    grade_level: z.string().min(2, "Grade Level is required"),
    week_range: z.string().min(2, "Week Range is required"),
    status: z.enum(['locked', 'in-progress', 'completed']),
    progress_percent: z.coerce.number().min(0).max(100).optional().default(0),
})

interface MilestoneFormProps {
    isOpen: boolean
    onClose: () => void
    studentId: string
    initialData?: any
    onSuccess: (action: 'create' | 'update' | 'delete', data?: any, id?: string) => void
}

export function MilestoneForm({ isOpen, onClose, studentId, initialData, onSuccess }: MilestoneFormProps) {
    const isEditing = !!initialData
    const [isLoading, setIsLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const form = useForm<z.infer<typeof milestoneSchema>>({
        resolver: zodResolver(milestoneSchema),
        defaultValues: {
            subject: initialData?.subject || "",
            topic: initialData?.topic || "",
            grade_level: initialData?.grade_level || "",
            week_range: initialData?.week_range || "",
            status: initialData?.status || "locked",
            progress_percent: initialData?.progress_percent || 0,
        },
    })

    const statusValue = form.watch("status")

    async function onSubmit(values: z.infer<typeof milestoneSchema>) {
        setIsLoading(true)
        try {
            if (isEditing) {
                const result = await updateCurriculumMilestone(initialData.id, values)
                if (result.success) {
                    toast.success("Milestone Updated", { description: "The curriculum roadmap has been updated." })
                    onSuccess('update', result.data)
                    onClose()
                } else {
                    toast.error("Update Failed", { description: result.error || "Something went wrong." })
                }
            } else {
                const result = await addCurriculumMilestone({ ...values, student_id: studentId })
                if (result.success) {
                    toast.success("Milestone Created", { description: "New roadmap item added securely." })
                    onSuccess('create', result.data)
                    onClose()
                } else {
                    toast.error("Creation Failed", { description: result.error || "Something went wrong." })
                }
            }
        } catch (error) {
            toast.error("System Error", { description: "Could not connect to the database." })
        } finally {
            setIsLoading(false)
        }
    }

    async function handleDelete() {
        if (!initialData?.id || !confirm("Are you sure you want to delete this milestone?")) return;

        setIsDeleting(true)
        try {
            const result = await deleteCurriculumMilestone(initialData.id)
            if (result.success) {
                toast.success("Milestone Deleted")
                onSuccess('delete', undefined, initialData.id)
                onClose()
            } else {
                toast.error("Deletion Failed", { description: result.error })
            }
        } catch (error) {
            toast.error("System Error")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] bg-[#0A0A0B] border-white/10 text-white shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />
                <DialogHeader className="pt-4">
                    <DialogTitle className="text-xl font-bold tracking-tight">
                        {isEditing ? "Edit Milestone" : "Add New Milestone"}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        {isEditing ? "Update the student's curriculum progression." : "Assign a new topic or module to the student's roadmap."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="subject"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-300 text-xs uppercase tracking-widest font-bold">Subject</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Mathematics" className="bg-white/5 border-white/10 focus-visible:ring-cyan-500 text-white" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-red-400 text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="grade_level"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-300 text-xs uppercase tracking-widest font-bold">Grade Level</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. JSS 2" className="bg-white/5 border-white/10 focus-visible:ring-cyan-500 text-white" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-red-400 text-xs" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="topic"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-300 text-xs uppercase tracking-widest font-bold">Topic / Unit</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Algebraic Expressions" className="bg-white/5 border-white/10 focus-visible:ring-cyan-500 text-white" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-red-400 text-xs" />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="week_range"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-300 text-xs uppercase tracking-widest font-bold">Week Range</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Week 1-2" className="bg-white/5 border-white/10 focus-visible:ring-cyan-500 text-white" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-red-400 text-xs" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-300 text-xs uppercase tracking-widest font-bold">Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-cyan-500">
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                                                <SelectItem value="locked">Locked</SelectItem>
                                                <SelectItem value="in-progress">In Progress</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-red-400 text-xs" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {statusValue === 'in-progress' && (
                            <FormField
                                control={form.control}
                                name="progress_percent"
                                render={({ field }) => (
                                    <FormItem className="bg-cyan-500/10 p-4 rounded-xl border border-cyan-500/20">
                                        <div className="flex justify-between items-center mb-2">
                                            <FormLabel className="text-cyan-400 text-xs uppercase tracking-widest font-bold m-0">Progress Percentage</FormLabel>
                                            <span className="text-xs font-mono text-cyan-200">{field.value}%</span>
                                        </div>
                                        <FormControl>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="5"
                                                className="w-full accent-cyan-500"
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-400 text-xs" />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="flex gap-2 pt-4">
                            {isEditing && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 px-3"
                                    onClick={handleDelete}
                                    disabled={isLoading || isDeleting}
                                >
                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </Button>
                            )}
                            <Button
                                type="submit"
                                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all"
                                disabled={isLoading || isDeleting}
                            >
                                {isLoading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                                ) : (
                                    isEditing ? "Save Changes" : "Create Milestone"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
