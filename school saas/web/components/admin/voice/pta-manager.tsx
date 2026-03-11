"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar, Clock, Video, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { updatePTAMeetingStatus } from "@/lib/actions/voice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function PTAManager({ meetings = [] }: { meetings: any[] }) {
    const [isLoading, setIsLoading] = useState<string | null>(null)

    const handleUpdateStatus = async (id: string, status: 'scheduled' | 'completed' | 'cancelled') => {
        setIsLoading(id)
        try {
            const result = await updatePTAMeetingStatus(id, status)
            if (result.success) {
                toast.success(`Meeting ${status}`)
            } else {
                toast.error("Failed to update status")
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred")
        } finally {
            setIsLoading(null)
        }
    }

    if (meetings.length === 0) {
        return (
            <Card className="flex flex-col items-center justify-center p-12 text-center border-border bg-black/40 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)] border border-indigo-500/30">
                    <Calendar className="w-10 h-10 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-black text-foreground italic uppercase tracking-tight relative z-10">No PTA Requests</h3>
                <p className="text-muted-foreground mt-2 max-w-sm relative z-10">
                    There are currently no PTA meeting requests from parents. When a parent books a slot via the Platinum Concierge, it will appear here.
                </p>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {meetings.map((meeting) => (
                <Card key={meeting.id} className="overflow-hidden border-border bg-[#0A0A0B] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500 relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-emerald-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-emerald-500/5 transition-all duration-700 pointer-events-none" />
                    <div className="bg-secondary/50 px-6 py-4 border-b border-border/50 flex items-start justify-between relative z-10">
                        <div className="flex gap-4 items-center">
                            <div className="flex -space-x-3">
                                <Avatar className="border-2 border-black ring-2 ring-indigo-500/40 w-12 h-12 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                                    <AvatarImage src={meeting.student?.passport_url} />
                                    <AvatarFallback>{meeting.student?.full_name?.charAt(0) || 'S'}</AvatarFallback>
                                </Avatar>
                                <Avatar className="border-2 border-black ring-2 ring-purple-500/40 w-12 h-12 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-foreground font-bold">
                                        {meeting.parent?.full_name?.charAt(0) || 'P'}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground text-lg tracking-tight">{meeting.student?.full_name}</h4>
                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                    <span>Parent: {meeting.parent?.full_name || 'N/A'}</span>
                                    <span>•</span>
                                    <Badge variant="outline" className="border-indigo-500/30 text-indigo-300 bg-indigo-500/10">
                                        {meeting.student?.class?.name || 'Class TBD'}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <Badge
                            className={`uppercase text-[10px] tracking-widest font-black shadow-lg ${meeting.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-emerald-500/20' :
                                    meeting.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border-red-500/30 shadow-red-500/20' :
                                        'bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30 shadow-amber-500/20'
                                }`}
                        >
                            {meeting.status}
                        </Badge>
                    </div>

                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex gap-8">
                                <div className="space-y-1 p-3 rounded-xl bg-secondary/50 border border-border/50">
                                    <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" /> Date
                                    </p>
                                    <p className="font-medium text-slate-200">
                                        {format(new Date(meeting.scheduled_at), 'MMMM d, yyyy')}
                                    </p>
                                </div>
                                <div className="space-y-1 p-3 rounded-xl bg-secondary/50 border border-border/50">
                                    <p className="text-[10px] text-purple-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" /> Time
                                    </p>
                                    <p className="font-medium text-slate-200">
                                        {format(new Date(meeting.scheduled_at), 'h:mm a')}
                                    </p>
                                </div>
                                <div className="space-y-1 p-3 rounded-xl bg-secondary/50 border border-border/50">
                                    <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                                        <Video className="w-3.5 h-3.5" /> Format
                                    </p>
                                    <p className="font-medium text-slate-200">Virtual (Google Meet)</p>
                                </div>
                            </div>

                            {meeting.status === 'scheduled' && (
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="text-emerald-400 hover:text-foreground bg-emerald-500/10 hover:bg-emerald-500 border-emerald-500/30 transition-all font-bold tracking-tight shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                                        disabled={isLoading === meeting.id}
                                        onClick={() => handleUpdateStatus(meeting.id, 'completed')}
                                    >
                                        {isLoading === meeting.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                        Mark Completed
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="text-red-400 hover:text-foreground bg-red-500/10 hover:bg-red-500 border-red-500/30 transition-all font-bold tracking-tight shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                                        disabled={isLoading === meeting.id}
                                        onClick={() => handleUpdateStatus(meeting.id, 'cancelled')}
                                    >
                                        {isLoading === meeting.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
