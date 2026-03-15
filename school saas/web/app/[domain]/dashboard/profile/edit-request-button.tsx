"use client"

import { useState } from "react"
import { Edit, Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { createProfileUpdateRequest } from "@/lib/actions/profile-requests"

export function EditRequestButton({ studentId }: { studentId: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [description, setDescription] = useState("")

    const handleSubmit = async () => {
        if (!description.trim()) {
            toast.error("Please describe the changes you need")
            return
        }

        setLoading(true)
        try {
            const res = await createProfileUpdateRequest(studentId, description)
            if (res.success) {
                toast.success("Request Sent Successfully", {
                    description: "School administrators will review your request shortly."
                })
                setOpen(false)
                setDescription("")
            } else {
                toast.error(res.error || "Failed to send request")
            }
        } catch (error) {
            toast.error("An error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="bg-transparent border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 gap-2 transition-all active:scale-95"
                >
                    <Edit className="h-4 w-4" />
                    <span className="hidden md:inline">Request Edit</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-slate-950 border-white/10 text-slate-200">
                <DialogHeader>
                    <DialogTitle className="text-white flex items-center gap-2 font-serif text-xl">
                        <Edit className="h-5 w-5 text-cyan-500" />
                        Request Profile Update
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Describe the personal or academic details that need correction. An administrator will verify and apply these changes.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Textarea 
                        placeholder="e.g. Please correct the date of birth to 15th October 2013..."
                        className="bg-slate-900 border-white/5 text-white placeholder:text-slate-600 focus-visible:ring-cyan-500 h-32"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <DialogFooter>
                    <Button 
                        variant="ghost" 
                        onClick={() => setOpen(false)}
                        className="text-slate-400 hover:text-white hover:bg-white/5"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white gap-2 px-6"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Submit Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
