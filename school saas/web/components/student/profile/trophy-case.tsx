"use client"

import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Award, Clock, Star, Zap, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const ICON_MAP: any = {
    'clock': Clock,
    'math': Zap,
    'sparkle': Star,
    'default': Award
}

export function TrophyCase({ achievements }: { achievements: any[] }) {

    const handleShare = () => {
        toast.success("Certificate generated! Opening WhatsApp to share...")
        // In a real app, this would generate an image blob and use the Web Share API
    }

    return (
        <Card className="p-6 bg-card text-card-foreground border-border/50 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-foreground font-bold text-lg flex items-center gap-2">
                        <Award className="h-5 w-5 text-yellow-500" />
                        Trophy Case
                    </h3>
                    <p className="text-sm text-muted-foreground">Digital Achievement Badges</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleShare} className="border-border text-slate-300 hover:text-foreground hover:bg-secondary/50 bg-card text-card-foreground/50">
                    <Share2 className="h-3 w-3 mr-2" /> Share
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {achievements.map((badge) => {
                    const Icon = ICON_MAP[badge.icon_key] || ICON_MAP['default']
                    return (
                        <TooltipProvider key={badge.id}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="group flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/50 border border-border/50 hover:border-yellow-500/50 transition-all cursor-pointer relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 shadow-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ring-2 ring-yellow-400/20">
                                            <Icon className="h-7 w-7 text-foreground drop-shadow-md" />
                                        </div>
                                        <h4 className="text-sm font-bold text-foreground text-center leading-tight">{badge.title}</h4>
                                        <span className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{badge.category}</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-card text-card-foreground border-border text-foreground max-w-[200px]">
                                    <p className="font-bold text-xs mb-1">Awarded on {badge.awarded_at}</p>
                                    <p className="text-xs text-slate-300">"{badge.comment}"</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )
                })}

                {achievements.length === 0 && (
                    <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
                        No achievements yet. Keep working hard!
                    </div>
                )}
            </div>
        </Card>
    )
}
