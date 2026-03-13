"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PendingItem } from "@/lib/actions/approvals"
import { cn, formatDate } from "@/lib/utils"
import { useState } from "react"
import { ReviewModal } from "./review-modal"
import { FileText, Calculator, Clock, ChevronRight, MapPin, GraduationCap } from "lucide-react"

import { useRouter, useSearchParams } from "next/navigation"

export function ApprovalQueue({ initialItems, domain }: { initialItems: PendingItem[], domain: string }) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null)

    // Get filter from URL or default to 'all'
    const lessonFilter = (searchParams.get('filter') as 'all' | 'lesson_plan' | 'lesson_note') || 'all'

    const setLessonFilter = (filter: string) => {
        const params = new URLSearchParams(searchParams)
        if (filter === 'all') {
            params.delete('filter')
        } else {
            params.set('filter', filter)
        }
        router.replace(`?${params.toString()}`, { scroll: false })
    }

    const lessonPlans = initialItems.filter(i => {
        if (i.type !== 'lesson_plan') return false
        if (lessonFilter === 'all') return true
        const type = i.lesson_type || 'lesson_plan' // Default to plan if null
        return type === lessonFilter
    })
    const gradebooks = initialItems.filter(i => i.type === 'gradebook')
    const termResults = initialItems.filter(i => i.type === 'term_result')
    const disputes = initialItems.filter(i => i.type === 'attendance_dispute')

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            <QueueList
                title="Lesson Plans"
                icon={FileText}
                items={lessonPlans}
                onSelect={setSelectedItem}
                filter={
                    <div className="flex gap-1 bg-slate-950 p-0.5 rounded border border-border/50">
                        <button
                            onClick={(e) => { e.stopPropagation(); setLessonFilter('all'); }}
                            className={cn("px-2 py-0.5 text-[10px] rounded transition-colors", lessonFilter === 'all' ? "bg-indigo-600 text-foreground" : "text-muted-foreground hover:text-slate-300")}
                        >All</button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setLessonFilter('lesson_plan'); }}
                            className={cn("px-2 py-0.5 text-[10px] rounded transition-colors", lessonFilter === 'lesson_plan' ? "bg-indigo-600 text-foreground" : "text-muted-foreground hover:text-slate-300")}
                        >Plans</button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setLessonFilter('lesson_note'); }}
                            className={cn("px-2 py-0.5 text-[10px] rounded transition-colors", lessonFilter === 'lesson_note' ? "bg-indigo-600 text-foreground" : "text-muted-foreground hover:text-slate-300")}
                        >Notes</button>
                    </div>
                }
            />

            {/* Debug (Client Side) - Removed */}
            <QueueList
                title="Gradebooks"
                icon={Calculator}
                items={gradebooks}
                onSelect={setSelectedItem}
            />
            <QueueList
                title="Term Results"
                icon={GraduationCap}
                items={termResults}
                onSelect={setSelectedItem}
                accent="text-emerald-400"
            />
            <QueueList
                title="Attendance Disputes"
                icon={MapPin}
                items={disputes}
                onSelect={setSelectedItem}
                accent="text-red-400"
            />

            <ReviewModal
                item={selectedItem}
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
                domain={domain}
            />
        </div>
    )
}

function QueueList({ title, icon: Icon, items, onSelect, accent, filter }: {
    title: string,
    icon: any,
    items: PendingItem[],
    onSelect: (i: PendingItem) => void,
    accent?: string,
    filter?: React.ReactNode
}) {
    return (
        <Card className="bg-card text-card-foreground/50 border-border flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-border bg-card text-card-foreground flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Icon className={cn("h-5 w-5", accent || "text-[var(--school-accent)]")} />
                    <h3 className="font-bold text-foreground uppercase tracking-tight text-xs">{title}</h3>
                </div>
                {filter}
                <Badge variant="outline" className="bg-slate-800/50 text-muted-foreground border-border">
                    {items.length} Pending
                </Badge>
            </div>
            <ScrollArea className="flex-1 p-2">
                <div className="space-y-1">
                    {items.map(item => (
                        <button
                            key={item.id}
                            onClick={() => onSelect(item)}
                            className="w-full text-left p-4 rounded-lg hover:bg-secondary/50 transition-all group border border-transparent hover:border-border/50 flex justify-between items-center"
                        >
                            <div>
                                <h4 className="font-medium text-slate-200 group-hover:text-blue-400 transition-colors">{item.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                    <span>{item.submitted_by}</span>
                                    <span>•</span>
                                    <Clock className="h-3 w-3" />
                                    <span>{formatDate(item.submitted_at)}</span>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-foreground transition-colors" />
                        </button>
                    ))}
                    {items.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground opacity-50">
                            <p className="text-sm">All caught up!</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </Card>
    )
}
