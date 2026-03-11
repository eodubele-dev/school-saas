"use client"

import { formatDistanceToNow } from "date-fns"
import { Star, MessageSquarePlus, Clock, Inbox } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function FeedbackInbox({ feedback = [] }: { feedback: any[] }) {

    if (feedback.length === 0) {
        return (
            <Card className="flex flex-col items-center justify-center p-12 text-center border-border bg-black/40 backdrop-blur-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent pointer-events-none" />
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)] border border-emerald-500/30">
                    <Inbox className="w-10 h-10 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-black text-foreground italic uppercase tracking-tight relative z-10">Inbox Empty</h3>
                <p className="text-muted-foreground mt-2 max-w-sm relative z-10">
                    There are currently no feedback submissions from parents.
                </p>
            </Card>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedback.map((item, index) => (
                <Card
                    key={item.id}
                    className="overflow-hidden border-border bg-[#0A0A0B] backdrop-blur-xl hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(16,185,129,0.15)] transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 relative group"
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-teal-500/0 to-transparent group-hover:from-emerald-500/5 group-hover:via-teal-500/5 transition-all duration-700 pointer-events-none" />
                    <CardContent className="p-0 relative z-10">
                        {/* Header Area */}
                        <div className="bg-secondary/50 p-5 border-b border-border/50 flex justify-between items-start">
                            <div className="flex gap-3">
                                <Avatar className="h-10 w-10 border-2 border-black ring-2 ring-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                                    <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-600 text-foreground font-bold">
                                        {item.user?.full_name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-bold text-foreground text-sm line-clamp-1 tracking-tight">{item.user?.full_name || 'Anonymous Parent'}</h4>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium mt-0.5">
                                        <Clock className="w-3 h-3 text-emerald-400" />
                                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>

                            {/* Stars Rating Badge */}
                            <div className="flex items-center gap-1 bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full text-xs font-black tracking-widest border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                {item.rating}.0
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-5 space-y-4">
                            <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 bg-emerald-500/10 tracking-widest font-bold text-[10px] uppercase">
                                {item.category || 'General Inquiry'}
                            </Badge>

                            <div className="relative p-2">
                                <MessageSquarePlus className="absolute -top-2 -left-2 w-10 h-10 text-emerald-500/10 -z-10" />
                                <p className="text-sm text-slate-200 leading-relaxed pl-3 z-10 relative italic border-l-2 border-emerald-500/30">
                                    "{item.message}"
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
