"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs"
import { Loader2, Check, X, Calendar } from "lucide-react"
import { toast } from "sonner"
import { getPendingLeaveRequests, updateLeaveRequestStatus } from "@/lib/actions/admin-attendance"
import { format } from "date-fns"

export function LeaveRequestManager() {
    const [loading, setLoading] = useState(true)
    const [requests, setRequests] = useState<any[]>([])
    const [processing, setProcessing] = useState<string | null>(null)

    useEffect(() => {
        loadRequests()
    }, [])

    const loadRequests = async () => {
        setLoading(true)
        const res = await getPendingLeaveRequests()
        if (res.success && res.data) {
            setRequests(res.data)
        } else {
            console.error(res.error)
            toast.error(`Failed: ${res.error}`)
        }
        setLoading(false)
    }

    const handleAction = async (id: string, action: 'approved' | 'rejected') => {
        setProcessing(id)
        const res = await updateLeaveRequestStatus(id, action)
        if (res.success) {
            toast.success(`Request ${action}`)
            setRequests(prev => prev.filter(r => r.id !== id))
        } else {
            toast.error("Failed to update status")
        }
        setProcessing(null)
    }

    return (
        <Card className="p-6 bg-slate-900 border-white/5 h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    Leave Requests
                </h3>
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                    {requests.length} Pending
                </Badge>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-500" /></div>
            ) : requests.length === 0 ? (
                <div className="text-center py-12 text-slate-500 border border-dashed border-white/5 rounded-lg bg-white/[0.02]">
                    No pending requests
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((r) => (
                        <div key={r.id} className="p-4 rounded-xl bg-slate-950/50 border border-white/5 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">

                                    <Avatar>
                                        <AvatarImage src={r?.staff?.avatar_url} />
                                        <AvatarFallback>{r?.staff?.full_name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-bold text-white">{r.staff?.full_name}</p>
                                        <p className="text-xs text-slate-400 capitalize">{r.staff?.role} • <span className="text-blue-400">{r.leave_type}</span></p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">Requested on</p>
                                    <p className="text-xs font-medium text-slate-300">{format(new Date(r.created_at), 'MMM d, yyyy')}</p>
                                </div>
                            </div>

                            <div className="bg-white/5 p-3 rounded-lg text-sm text-slate-300">
                                <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/5">
                                    <span className="text-slate-500 text-xs uppercase tracking-wider">Duration</span>
                                    <span className="font-mono text-blue-300">
                                        {format(new Date(r.start_date), 'MMM d')} - {format(new Date(r.end_date), 'MMM d, yyyy')}
                                    </span>
                                </div>
                                <p className="italic">"{r.reason}"</p>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
                                    size="sm"
                                    onClick={() => handleAction(r.id, 'approved')}
                                    disabled={!!processing}
                                >
                                    {processing === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                                    Approve
                                </Button>
                                <Button
                                    className="flex-1 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/20"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAction(r.id, 'rejected')}
                                    disabled={!!processing}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Reject
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )
            }
        </Card >
    )
}
