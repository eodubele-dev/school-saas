"use client"

import { formatDistanceToNow } from "date-fns"
import { Star, MessageSquarePlus, Clock, Inbox } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function FeedbackInbox({ feedback = [] }: { feedback: any[] }) {

    if (feedback.length === 0) {
        return (
            <Card className="flex flex-col items-center justify-center p-12 text-center border-border bg-card shadow-sm">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6 border border-border">
                    <Inbox className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground tracking-tight">Inbox Empty</h3>
                <p className="text-muted-foreground mt-2 max-w-sm text-sm">
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
                    className="overflow-hidden border-border bg-card shadow-sm hover:border-border/80 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 group"
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                >
                    <CardContent className="p-0">
                        {/* Header Area */}
                        <div className="bg-secondary/30 p-5 border-b border-border flex justify-between items-start">
                            <div className="flex gap-3">
                                <Avatar className="h-10 w-10 border-2 border-background">
                                    <AvatarFallback className="bg-secondary text-foreground font-semibold">
                                        {item.user?.full_name?.charAt(0) || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-semibold text-foreground text-sm line-clamp-1 tracking-tight">{item.user?.full_name || 'Anonymous Parent'}</h4>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium mt-0.5">
                                        <Clock className="w-3 h-3 text-muted-foreground" />
                                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>

                            {/* Stars Rating Badge */}
                            <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-full text-xs font-semibold tracking-widest border border-amber-500/20">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                {item.rating}.0
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-5 space-y-4">
                            <Badge variant="outline" className="border-border text-foreground bg-secondary/30 tracking-widest font-semibold text-[10px] uppercase">
                                {item.category || 'General Inquiry'}
                            </Badge>

                            <div className="relative p-2">
                                <MessageSquarePlus className="absolute -top-2 -left-2 w-10 h-10 text-muted/30 -z-10" />
                                <p className="text-sm text-muted-foreground leading-relaxed pl-3 z-10 relative italic border-l-2 border-border">
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
