import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface StaffPerformance {
    id: string
    name: string
    gradebookStatus: 'Caught Up' | 'Lagging'
    lessonPlanStatus: 'On Track' | 'Pending'
}

export function StaffLeaderboard({ staff }: { staff: StaffPerformance[] }) {
    return (
        <Card className="bg-card text-card-foreground border-border overflow-hidden">
            <div className="p-4 border-b border-border/50 bg-secondary/50">
                <h3 className="text-sm font-medium text-slate-300">Staff Performance</h3>
            </div>
            <div className="divide-y divide-white/5">
                {staff.map((s) => (
                    <div key={s.id} className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-border">
                                <AvatarFallback className="bg-slate-800 text-muted-foreground text-xs">
                                    {s.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="text-sm font-medium text-slate-200">{s.name}</div>
                                <div className="text-[10px] text-muted-foreground">Physics Dept</div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                            <Badge variant="outline" className={`text-[9px] h-4 ${s.gradebookStatus === 'Caught Up' ? 'border-green-500/30 text-green-500' : 'border-red-500/30 text-red-500'}`}>
                                {s.gradebookStatus === 'Caught Up' ? 'Grades OK' : 'Grades Late'}
                            </Badge>
                            {/* Only show Lesson Plan warning if pending */}
                            {s.lessonPlanStatus === 'Pending' && (
                                <span className="text-[9px] text-amber-500">Lesson Plan Pending</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    )
}
