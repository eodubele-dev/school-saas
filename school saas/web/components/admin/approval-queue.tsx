"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PendingItem } from "@/lib/actions/approvals"
import { formatDate } from "@/lib/utils"
import { useState } from "react"
import { ReviewModal } from "./review-modal"
import { FileText, Calculator, Clock, ChevronRight } from "lucide-react"

export function ApprovalQueue({ initialItems }: { initialItems: PendingItem[] }) {
    const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null)

    const lessonPlans = initialItems.filter(i => i.type === 'lesson_plan')
    const gradebooks = initialItems.filter(i => i.type === 'gradebook')

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <QueueList
                title="Lesson Plans for Review"
                icon={FileText}
                items={lessonPlans}
                onSelect={setSelectedItem}
            />
            <QueueList
                title="Result Sheets & Gradebooks"
                icon={Calculator}
                items={gradebooks}
                onSelect={setSelectedItem}
            />

            <ReviewModal
                item={selectedItem}
                isOpen={!!selectedItem}
                onClose={() => setSelectedItem(null)}
            />
        </div>
    )
}

function QueueList({ title, icon: Icon, items, onSelect }: { title: string, icon: any, items: PendingItem[], onSelect: (i: PendingItem) => void }) {
    return (
        <Card className="bg-slate-900/50 border-white/10 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-slate-900 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-[var(--school-accent)]" />
                    <h3 className="font-bold text-white">{title}</h3>
                </div>
                <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                    {items.length} Pending
                </Badge>
            </div>
            <ScrollArea className="flex-1 p-2">
                <div className="space-y-1">
                    {items.map(item => (
                        <button
                            key={item.id}
                            onClick={() => onSelect(item)}
                            className="w-full text-left p-4 rounded-lg hover:bg-white/5 transition-all group border border-transparent hover:border-white/5 flex justify-between items-center"
                        >
                            <div>
                                <h4 className="font-medium text-slate-200 group-hover:text-blue-400 transition-colors">{item.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                    <span>{item.submitted_by}</span>
                                    <span>•</span>
                                    <Clock className="h-3 w-3" />
                                    <span>{formatDate(item.submitted_at)}</span>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-white transition-colors" />
                        </button>
                    ))}
                    {items.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-500 opacity-50">
                            <p className="text-sm">All caught up!</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </Card>
    )
}
