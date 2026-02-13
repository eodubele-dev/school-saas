"use client"

import { useState, useEffect } from "react"
import { formatDate } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Loader2, MessageSquare, AlertCircle, CheckCircle } from "lucide-react"
import { getDailyAbsentees, sendBulkSMS } from "@/lib/actions/communication"
import { toast } from "sonner"

export function AbsenteeFollowUp() {
    const [loading, setLoading] = useState(true)
    const [absentees, setAbsentees] = useState<any[]>([])
    const [sending, setSending] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        const res = await getDailyAbsentees()
        if (res.success && res.data) {
            setAbsentees(res.data)
        }
        setLoading(false)
    }

    const handleBulkNotify = async () => {
        setSending(true)
        try {
            const recipients = absentees
                .filter(a => a.student?.parent?.phone)
                .map(a => ({
                    phone: a.student.parent.phone,
                    name: a.student.parent.full_name || a.student.full_name || "Parent"
                }))

            if (recipients.length === 0) {
                toast.error("No valid parent phone numbers found for absentees")
                setSending(false)
                return
            }

            const res = await sendBulkSMS(
                recipients,
                "Dear Parent, your child was marked absent today. Please contact the school office if this is an error."
            )

            if (res.success) {
                toast.success(`Sent SMS to ${recipients.length} parents`)
            } else {
                toast.error("Failed to send SMS")
            }
        } catch (error) {
            toast.error("An error occurred")
        }
        setSending(false)
    }

    if (loading) return <div className="h-40 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>

    return (
        <Card className="bg-slate-900 border-white/5 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        Daily Absentees
                    </h3>
                    <p className="text-sm text-slate-400">Students marked absent today ({formatDate(new Date())})</p>
                </div>
                <Button
                    onClick={handleBulkNotify}
                    disabled={sending || absentees.length === 0}
                    className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20"
                >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MessageSquare className="h-4 w-4 mr-2" />}
                    Notify All Parents
                </Button>
            </div>

            {absentees.length === 0 ? (
                <div className="text-center py-10 text-slate-500 flex flex-col items-center">
                    <CheckCircle className="h-10 w-10 mb-2 text-emerald-500/50" />
                    <p>No absentees recorded today.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {absentees.map((record: any) => (
                        <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8 bg-slate-800">
                                    <AvatarFallback>{record.student?.full_name?.[0] || 'S'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium text-white">{record.student?.full_name || 'Unknown Student'}</p>
                                    <p className="text-xs text-slate-400">Class: {record.student?.class_id || 'N/A'}</p>
                                </div>
                            </div>
                            <span className="text-xs text-red-400 font-medium px-2 py-1 rounded bg-red-400/10 border border-red-400/20">
                                Absent
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    )
}
