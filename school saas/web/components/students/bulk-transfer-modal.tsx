'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { toast } from 'sonner'
import { bulkTransferStudents } from '@/lib/actions/student-management'
import { Users, ArrowRight } from 'lucide-react'

interface ClassOption {
    id: string
    name: string
}

interface BulkTransferModalProps {
    isOpen: boolean
    onClose: () => void
    studentIds: string[]
    classes: ClassOption[]
}

export function BulkTransferModal({ isOpen, onClose, studentIds, classes }: BulkTransferModalProps) {
    const [targetClass, setTargetClass] = useState<string>("")
    const [reason, setReason] = useState("")
    const [loading, setLoading] = useState(false)

    const handleTransfer = async () => {
        if (!studentIds.length || !targetClass) return

        setLoading(true)
        try {
            const res = await bulkTransferStudents(studentIds, targetClass, reason || 'Bulk Promotion')
            if (res.success) {
                toast.success(res.message)
                onClose()
            } else {
                toast.error(res.message)
            }
        } catch (error) {
            toast.error("Failed to process bulk transfer")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-slate-950 border-white/10 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-[var(--school-accent)]">
                        <Users className="h-5 w-5" />
                        Bulk Promote Students
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        You are about to move <span className="text-white font-bold">{studentIds.length}</span> students to a new class.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-center p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="text-center">
                            <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Move Selected To</p>
                            <div className="flex items-center gap-2 text-xl font-bold text-[var(--school-accent)]">
                                {targetClass ? classes.find(c => c.id === targetClass)?.name : "Select Class"}
                                <ArrowRight className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Select Destination Class</Label>
                        <Select value={targetClass} onValueChange={setTargetClass}>
                            <SelectTrigger className="bg-slate-900 border-white/10 text-white">
                                <SelectValue placeholder="Choose new class..." />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Reason (Optional)</Label>
                        <Textarea
                            placeholder="e.g. End of Session Promotion"
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
                        {loading ? 'Promoting...' : `Promote ${studentIds.length} Students`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
