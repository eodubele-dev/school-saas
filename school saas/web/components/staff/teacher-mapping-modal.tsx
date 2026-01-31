"use client"

import { useState } from "react"
import { BookOpen, School, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
// import { assignTeacher } from "@/lib/actions/staff" // To be implemented

export function TeacherMappingModal({ teacher, classes }: { teacher: any, classes: any[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        classId: "",
        subject: "",
        isFormTeacher: false
    })

    const handleAssign = async () => {
        if (!formData.classId) return toast.error("Please select a class")

        setLoading(true)
        // Simulate assignment
        await new Promise(resolve => setTimeout(resolve, 1000))
        toast.success(`Assigned to ${formData.subject || 'Class'} successfully`)
        setOpen(false)
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="flex items-center w-full cursor-pointer hover:bg-white/5 py-1.5 px-2 rounded-sm text-sm">
                    <School className="mr-2 h-4 w-4" /> Assign Class
                </div>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Assign Class & Subject</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Map <span className="text-white font-medium">{teacher.full_name}</span> to a class.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Select Class</Label>
                        <Select
                            value={formData.classId}
                            onValueChange={val => setFormData({ ...formData, classId: val })}
                        >
                            <SelectTrigger className="bg-slate-950 border-white/10">
                                <SelectValue placeholder="Select a class..." />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                                {classes.map((cls) => (
                                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Subject (Optional)</Label>
                        <div className="relative">
                            <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                className="bg-slate-950 border-white/10 pl-9"
                                placeholder="e.g. Mathematics"
                                value={formData.subject}
                                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 border border-white/10 rounded-md p-3 bg-slate-950">
                        <input
                            type="checkbox"
                            id="formTeacher"
                            className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-[var(--school-accent)] focus:ring-[var(--school-accent)]"
                            checked={formData.isFormTeacher}
                            onChange={(e) => setFormData({ ...formData, isFormTeacher: e.target.checked })}
                        />
                        <div className="grid gap-1.5 leading-none">
                            <label
                                htmlFor="formTeacher"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Set as Form Teacher?
                            </label>
                            <p className="text-xs text-slate-500">
                                Form teachers handle attendance and report cards for this class.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)} className="text-slate-400">Cancel</Button>
                    <Button
                        onClick={handleAssign}
                        disabled={loading}
                        className="bg-[var(--school-accent)] text-white hover:brightness-110"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Assignment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
