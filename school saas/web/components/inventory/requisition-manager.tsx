"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X, Clock, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { approveRequisition, rejectRequisition } from "@/lib/actions/inventory"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface RequisitionManagerProps {
    initialRequests: any[]
}

export function RequisitionManager({ initialRequests }: RequisitionManagerProps) {
    // We rely on server revalidation, but local state can provide instant feedback
    // Ideally we'd use useOptimistic, but for now simple state synced with props or just router.refresh
    const [requests, setRequests] = useState(initialRequests)
    const [rejectId, setRejectId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [rejectReason, setRejectReason] = useState("")

    // Filter derived from state
    const pendingRequests = requests.filter(r => r.status === 'pending')
    const historyRequests = requests.filter(r => r.status !== 'pending')

    const handleApprove = async (req: any) => {
        const itemsToApprove = req.items.map((i: any) => ({
            itemId: i.item_id,
            approvedQty: i.quantity_requested // Auto-approve requested amount for now
        }))

        // Wait, `items` in mapped object will be `inventory_requisition_items` rows.
        // It has `item_id` column?
        // My query: `items:inventory_requisition_items(quantity_requested, item:inventory_items(name, unit_type))`
        // I need to add `item_id` to the select list.

        toast.promise(approveRequisition(req.id, itemsToApprove), {
            loading: 'Processing approval...',
            success: () => {
                // Optimistic update
                setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: 'approved' } : r))
                return 'Requisition Approved'
            },
            error: 'Failed to approve'
        })
    }

    const handleReject = async () => {
        if (!rejectId) return
        setLoading(true)
        const res = await rejectRequisition(rejectId, rejectReason)
        if (res.success) {
            toast.success("Requisition Rejected")
            setRequests(prev => prev.map(r => r.id === rejectId ? { ...r, status: 'rejected' } : r))
            setRejectId(null)
            setRejectReason("")
        } else {
            toast.error("Failed to reject")
        }
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Requisition Control</h2>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="bg-slate-900 border border-white/5">
                    <TabsTrigger value="pending" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-500">
                        Pending Approvals ({pendingRequests.length})
                    </TabsTrigger>
                    <TabsTrigger value="history">Request History</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4 pt-4">
                    {pendingRequests.map(req => (
                        <Card key={req.id} className="p-4 bg-slate-900 border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">
                                        {req.requested_by_profile?.full_name || 'Unknown User'}
                                        <span className="text-xs font-normal text-slate-500 ml-2">({req.requested_by_profile?.role || 'Staff'})</span>
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400 mt-1">
                                        {req.items?.map((line: any, idx: number) => (
                                            <Badge key={idx} variant="secondary" className="bg-blue-900/40 text-blue-300 hover:bg-blue-900/60 font-mono">
                                                {line.quantity_requested} x {line.item?.name}
                                            </Badge>
                                        ))}
                                        <span className="flex items-center gap-1 text-xs ml-2">
                                            <Clock className="h-3 w-3" /> {new Date(req.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 w-full md:w-auto">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-500 hover:bg-red-500/10 hover:text-red-400 flex-1 md:flex-none"
                                    onClick={() => setRejectId(req.id)}
                                >
                                    <X className="h-4 w-4 mr-1" /> Reject
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white flex-1 md:flex-none"
                                    onClick={() => handleApprove(req)}
                                >
                                    <Check className="h-4 w-4 mr-1" /> Approve
                                </Button>
                            </div>
                        </Card>
                    ))}

                    {pendingRequests.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            No pending requests.
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history" className="space-y-4 pt-4">
                    {historyRequests.map(req => (
                        <Card key={req.id} className="p-4 bg-slate-900 border-white/5 flex items-center justify-between opacity-75 hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-4">
                                <div>
                                    <h3 className="font-bold text-slate-300">
                                        {req.requested_by_profile?.full_name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        {req.items?.map((line: any, idx: number) => (
                                            <span key={idx} className="text-xs">
                                                {line.quantity_requested} x {line.item?.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <Badge className={req.status === 'approved' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}>
                                    {req.status}
                                </Badge>
                            </div>
                        </Card>
                    ))}
                    {historyRequests.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            No history available.
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            <Dialog open={!!rejectId} onOpenChange={(v) => !v && setRejectId(null)}>
                <DialogContent className="bg-slate-900 border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Reject Requisition</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Please provide a reason for rejecting this request.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Reason</Label>
                            <Input
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="bg-slate-950 border-white/10"
                                placeholder="e.g. Out of stock, not budget approved..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setRejectId(null)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
