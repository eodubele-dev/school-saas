"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PendingItem, approveItem, rejectItem } from "@/lib/actions/approvals"
import { useState } from "react"
import { CheckCircle, XCircle, Stamp, UserCheck, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { cn, formatDate } from "@/lib/utils"

interface ReviewModalProps {
    item: PendingItem | null
    isOpen: boolean
    onClose: () => void
}

export function ReviewModal({ item, isOpen, onClose }: ReviewModalProps) {
    const [comment, setComment] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [isStamped, setIsStamped] = useState(false)

    if (!item) return null

    const handleApprove = async () => {
        setIsProcessing(true)

        // 1. Trigger Stamp Animation
        setIsStamped(true)
        await new Promise(r => setTimeout(r, 1500)) // Let animation play

        // 2. Server Action
        try {
            const res = await approveItem(item.id, item.type)
            if (res.success) {
                toast.success("Approved & Stamped Successfully")
                onClose()
            } else {
                toast.error("Failed to approve")
                setIsStamped(false)
            }
        } catch (e) {
            toast.error("Error processing approval")
            setIsStamped(false)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleReject = async () => {
        if (!comment) {
            toast.error("Please provide a rejection reason")
            return
        }
        setIsProcessing(true)
        try {
            const res = await rejectItem(item.id, item.type, comment)
            if (res.success) {
                toast.success("Returned for corrections")
                onClose()
            } else {
                toast.error("Failed to reject")
            }
        } catch (e) {
            toast.error("Error processing rejection")
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[90vh] bg-slate-950 border-white/10 flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b border-white/10 bg-slate-900">
                    <DialogTitle className="text-white flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-blue-400" />
                        Reviewing: <span className="text-blue-200">{item.title}</span>
                    </DialogTitle>
                    <p className="text-xs text-slate-400">Submitted by {item.submitted_by} on {formatDate(item.submitted_at)}</p>
                </DialogHeader>

                <ScrollArea className="flex-1 p-8 bg-slate-900/50">
                    <div className="bg-white text-slate-900 p-8 min-h-[600px] shadow-2xl relative max-w-3xl mx-auto rounded-sm">

                        {/* Digital Stamp Overlay */}
                        <div className={cn(
                            "absolute top-10 right-10 pointer-events-none transition-all duration-500 transform",
                            isStamped ? "opacity-100 scale-100 rotate-[-12deg]" : "opacity-0 scale-150 rotate-0"
                        )}>
                            <div className="w-40 h-40 border-4 border-emerald-600 rounded-full flex flex-col items-center justify-center p-2 text-emerald-600 font-bold uppercase tracking-widest opacity-80 mix-blend-multiply">
                                <span className="text-[10px]">Approved By</span>
                                <span className="text-sm text-center leading-tight my-1">Principal's Office</span>
                                <Stamp className="h-8 w-8 my-1" />
                                <span className="text-[10px]">{formatDate(new Date())}</span>
                            </div>
                        </div>

                        {/* Content */}
                        {item.type === 'lesson_plan' ? (
                            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: item.details?.content || "<p>No content</p>" }} />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                <AlertCircle className="h-16 w-16 text-slate-300" />
                                <h3 className="text-xl font-bold">Gradebook Summary</h3>
                                <p>Pass Rate: 85% | Class Average: 68.5</p>
                                <div className="p-4 bg-slate-100 rounded text-xs text-left w-full max-w-md">
                                    <p>Missing CA1: 0 students</p>
                                    <p>Missing Exam: 2 students (Absent)</p>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <DialogFooter className="p-6 border-t border-white/10 bg-slate-900 flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                    <Textarea
                        placeholder="Add comments for rejection or notes..."
                        className="flex-1 bg-slate-950 border-white/10 text-white min-h-[60px]"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <Button variant="destructive" onClick={handleReject} disabled={isProcessing || isStamped}>
                            <XCircle className="h-4 w-4 mr-2" /> Needs Correction
                        </Button>
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleApprove} disabled={isProcessing || isStamped}>
                            <CheckCircle className="h-4 w-4 mr-2" /> Approve & Stamp
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
