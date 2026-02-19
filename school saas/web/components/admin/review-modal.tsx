"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PendingItem, approveItem, rejectItem } from "@/lib/actions/approvals"
import { useState } from "react"
import { CheckCircle, XCircle, Stamp, UserCheck, AlertCircle, Clock } from "lucide-react"
import { toast } from "sonner"
import { cn, formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { AttendanceDisputeNotification } from "../attendance/attendance-dispute-notification"
import { LessonEditor } from "../academic/lesson-editor"

interface ReviewModalProps {
    item: PendingItem | null
    isOpen: boolean
    onClose: () => void
    domain: string
}

export function ReviewModal({ item, isOpen, onClose, domain }: ReviewModalProps) {
    const [comment, setComment] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [isStamped, setIsStamped] = useState(false)
    const router = useRouter()

    // Custom styles for the lesson content to ensure "ready-for-students" spacing
    const contentStyles = `
        .lesson-content h1 { font-size: 2.25rem; font-weight: 800; margin-bottom: 2rem; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem; }
        .lesson-content h2 { font-size: 1.5rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1.25rem; color: #1e293b; border-left: 4px solid #3b82f6; padding-left: 1rem; }
        .lesson-content h3 { font-size: 1.25rem; font-weight: 600; margin-top: 2rem; margin-bottom: 0.75rem; color: #334155; }
        .lesson-content p { margin-bottom: 1.5rem; line-height: 1.8; color: #475569; }
        .lesson-content ul, .lesson-content ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
        .lesson-content li { margin-bottom: 0.75rem; line-height: 1.6; }
        .lesson-content table { width: 100%; border-collapse: collapse; margin: 2rem 0; border: 1px solid #e2e8f0; }
        .lesson-content th { background: #f8fafc; padding: 12px; text-align: left; border: 1px solid #e2e8f0; font-weight: 600; }
        .lesson-content td { padding: 12px; border: 1px solid #e2e8f0; }
        .lesson-content hr { margin: 3rem 0; border: 0; border-top: 1px solid #e2e8f0; }
    `

    if (!item) return null

    const handleApprove = async () => {
        setIsProcessing(true)

        // 1. Trigger Stamp Animation
        setIsStamped(true)
        await new Promise(r => setTimeout(r, 1500)) // Let animation play

        // 2. Server Action
        try {
            const res = await approveItem(domain, item.id, item.type)
            if (res.success) {
                toast.success("Approved & Stamped Successfully")
                router.refresh()
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
            const res = await rejectItem(domain, item.id, item.type, comment)
            if (res.success) {
                toast.success("Returned for corrections")
                router.refresh()
                onClose()
            } else {
                toast.error(res.error || "Failed to reject")
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
                    <style>{contentStyles}</style>
                    <div className="bg-white text-slate-900 p-8 min-h-[600px] shadow-2xl relative max-w-3xl mx-auto rounded-sm lesson-content">

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
                        {item.type === 'lesson_plan' || item.type === 'lesson_note' || item.lesson_type === 'lesson_note' ? (
                            <div className="bg-white min-h-[600px] h-full flex flex-col">
                                {/* Document Header - Fits the "Paper" look */}
                                <div className="border-b border-slate-100 p-8 md:p-12 pb-6 mb-0">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className={cn(
                                            "uppercase tracking-widest text-xs font-bold px-3 py-1 rounded border",
                                            item.lesson_type === 'lesson_note'
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                : "bg-blue-50 text-blue-700 border-blue-200"
                                        )}>
                                            {item.lesson_type === 'lesson_note' ? 'Lesson Note' : 'Lesson Plan'}
                                        </div>
                                        <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-200 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Pending Review
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3 text-sm font-mono">
                                        {item.details?.class_name && (
                                            <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-md border border-slate-200 flex items-center gap-2">
                                                <span className="font-bold text-slate-400 text-xs uppercase">Class:</span>
                                                {item.details.class_name}
                                            </span>
                                        )}
                                        {item.details?.subject && (
                                            <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-md border border-slate-200 flex items-center gap-2">
                                                <span className="font-bold text-slate-400 text-xs uppercase">Subject:</span>
                                                {item.details.subject}
                                            </span>
                                        )}
                                        {item.details?.week && (
                                            <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-md border border-slate-200 flex items-center gap-2">
                                                <span className="font-bold text-slate-400 text-xs uppercase">Week:</span>
                                                {item.details.week}
                                            </span>
                                        )}
                                        {item.details?.term && (
                                            <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-md border border-slate-200 flex items-center gap-2">
                                                <span className="font-bold text-slate-400 text-xs uppercase">Term:</span>
                                                {item.details.term}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <LessonEditor
                                        content={item.details?.content || "<p>No content</p>"}
                                        onChange={() => { }}
                                        editable={false}
                                    />
                                </div>
                            </div>
                        ) : item.type === 'attendance_dispute' ? (
                            <div className="-m-8">
                                <AttendanceDisputeNotification
                                    teacherName={item.submitted_by}
                                    photoUrl={item.details?.proof_url}
                                    distance={item.details?.distance}
                                    reason={item.details?.reason}
                                    submittedAt={item.submitted_at}
                                    onApprove={handleApprove}
                                    onDecline={handleReject}
                                    isProcessing={isProcessing}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                <AlertCircle className="h-16 w-16 text-slate-300" />
                                <h3 className="text-xl font-bold">Gradebook Summary</h3>
                                {item.details?.stats ? (
                                    <>
                                        <div className="flex gap-4 text-sm font-medium">
                                            <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full border border-green-500/20">
                                                Pass Rate: {item.details.stats.passRate}%
                                            </span>
                                            <span className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-full border border-blue-500/20">
                                                Class Avg: {item.details.stats.classAverage}
                                            </span>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded text-xs text-left w-full max-w-md space-y-2 border border-slate-100">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Total Students:</span>
                                                <span className="font-mono font-bold">{item.details.stats.studentCount}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Missing CA1:</span>
                                                <span className={cn("font-mono font-bold", item.details.stats.missingCA1 > 0 ? "text-amber-600" : "text-slate-700")}>
                                                    {item.details.stats.missingCA1} students
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Missing Exam:</span>
                                                <span className={cn("font-mono font-bold", item.details.stats.missingExam > 0 ? "text-amber-600" : "text-slate-700")}>
                                                    {item.details.stats.missingExam} students
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-slate-400">Loading stats...</p>
                                )}
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Hide default footer for attendance disputes as it has its own action bar inside the notification view */}
                {item.type !== 'attendance_dispute' && (
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
                )}
            </DialogContent>
        </Dialog>
    )
}
