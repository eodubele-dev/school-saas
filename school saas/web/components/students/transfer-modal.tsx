'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { toast } from 'sonner'
import { transferStudent } from '@/lib/actions/student-management'
import { ArrowRight, ArrowRightLeft } from 'lucide-react'

interface ClassOption {
    id: string
    name: string
}

interface TransferModalProps {
    isOpen: boolean
    onClose: () => void
    student: { id: string, name: string, class: string, classId?: string } | null
    classes: ClassOption[]
}

export function TransferModal({ isOpen, onClose, student, classes }: TransferModalProps) {
    const [targetClass, setTargetClass] = useState<string>("")
    const [reason, setReason] = useState("")
    const [loading, setLoading] = useState(false)

    const handleTransfer = async () => {
        if (!student || !targetClass) return

        setLoading(true)
        try {
            const res = await transferStudent(student.id, targetClass, reason || 'Administrative Transfer')
            if (res.success) {
                toast.success(res.message)
                onClose()
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            toast.error("Failed to transfer student")
        } finally {
            setLoading(false)
        }
    }

    if (!student) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-slate-950 border-white/10 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-[var(--school-accent)]">
                        <ArrowRightLeft className="h-5 w-5" />
                        Transfer Student
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Move <span className="text-white font-bold">{student.name}</span> to a new class.
                        This will update their current placement immediately.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/10">
                        <div>
                            <p className="text-[10px] uppercase text-slate-500 font-bold">Current Class</p>
                            <p className="font-mono text-sm">{student.class}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-500 mx-auto" />
                        <div className="text-right">
                            <p className="text-[10px] uppercase text-slate-500 font-bold">New Class</p>
                            <p className="font-mono text-sm text-[var(--school-accent)]">
                                {classes.find(c => c.id === targetClass)?.name || '...'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Select Destination Class</Label>
                        <Select value={targetClass} onValueChange={setTargetClass}>
                            <SelectTrigger className="bg-slate-900 border-white/10 text-white">
                                <SelectValue placeholder="Choose new class..." />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.filter(c => c.id !== student.classId).map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Reason for Transfer (Optional)</Label>
                        <Textarea
                            placeholder="e.g. Promotion, correction, etc."
                            className="bg-slate-900 border-white/10 text-white resize-none"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} disabled={loading} className="text-slate-400">Cancel</Button>
                    <Button
                        onClick={handleTransfer}
                        disabled={loading || !targetClass}
                        className="bg-[var(--school-accent)] text-white hover:brightness-110"
                    >
                        {loading ? 'Processing...' : 'Confirm Transfer'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
