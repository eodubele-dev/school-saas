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
            <Card className="flex flex-col items-center justify-center p-12 text-center border-border bg-card shadow-sm">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6 border border-border">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground tracking-tight">No PTA Requests</h3>
                <p className="text-muted-foreground mt-2 max-w-sm text-sm">
                    There are currently no PTA meeting requests from parents. When a parent books a slot via the Platinum Concierge, it will appear here.
                </p>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {meetings.map((meeting) => (
                <Card key={meeting.id} className="overflow-hidden border-border bg-card shadow-sm transition-all hover:border-border/80">
                    <div className="bg-secondary/30 px-6 py-4 border-b border-border flex items-start justify-between">
                        <div className="flex gap-4 items-center">
                            <div className="flex -space-x-3">
                                <Avatar className="border-2 border-background w-10 h-10">
                                    <AvatarImage src={meeting.student?.passport_url} />
                                    <AvatarFallback>{meeting.student?.full_name?.charAt(0) || 'S'}</AvatarFallback>
                                </Avatar>
                                <Avatar className="border-2 border-background w-10 h-10">
                                    <AvatarFallback className="bg-secondary text-foreground font-semibold">
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
                            variant="outline"
                            className={`uppercase text-[10px] tracking-widest font-semibold ${
                                meeting.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                meeting.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            }`}
                        >
                            {meeting.status}
                        </Badge>
                    </div>

                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex gap-8">
                                <div className="space-y-1 p-3 rounded-lg bg-secondary/30 border border-border">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" /> Date
                                    </p>
                                    <p className="font-medium text-foreground text-sm">
                                        {format(new Date(meeting.scheduled_at), 'MMMM d, yyyy')}
                                    </p>
                                </div>
                                <div className="space-y-1 p-3 rounded-lg bg-secondary/30 border border-border">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" /> Time
                                    </p>
                                    <p className="font-medium text-foreground text-sm">
                                        {format(new Date(meeting.scheduled_at), 'h:mm a')}
                                    </p>
                                </div>
                                <div className="space-y-1 p-3 rounded-lg bg-secondary/30 border border-border">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1.5">
                                        <Video className="w-3.5 h-3.5" /> Format
                                    </p>
                                    <p className="font-medium text-foreground text-sm">Virtual (Google Meet)</p>
                                </div>
                            </div>

                            {meeting.status === 'scheduled' && (
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-foreground hover:bg-secondary border-border transition-all font-medium tracking-tight"
                                        disabled={isLoading === meeting.id}
                                        onClick={() => handleUpdateStatus(meeting.id, 'completed')}
                                    >
                                        {isLoading === meeting.id ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-500" />}
                                        Mark Completed
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-foreground hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 border-border transition-all font-medium tracking-tight"
                                        disabled={isLoading === meeting.id}
                                        onClick={() => handleUpdateStatus(meeting.id, 'cancelled')}
                                    >
                                        {isLoading === meeting.id ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <XCircle className="w-3.5 h-3.5 mr-2 text-red-500 opacity-70" />}
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
