"use client"

import { useState } from "react"
import { format, isSameMonth, parseISO } from "date-fns"
import { CalendarDays, MapPin, Trophy, BookOpen, Clock, Filter, PartyPopper } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SchoolEvent } from "@/lib/actions/calendar"
import { cn } from "@/lib/utils"

interface EventListProps {
    events: SchoolEvent[]
}

export function EventList({ events }: EventListProps) {
    const [filter, setFilter] = useState<'all' | 'academic' | 'holiday' | 'sports' | 'exam'>('all')

    const filteredEvents = events.filter(e => filter === 'all' || e.type === filter)

    // Group by Month
    const groupedEvents: Record<string, SchoolEvent[]> = {}
    filteredEvents.forEach(event => {
        const date = new Date(event.start_date)
        const monthKey = format(date, "MMMM yyyy")
        if (!groupedEvents[monthKey]) groupedEvents[monthKey] = []
        groupedEvents[monthKey].push(event)
    })

    const getIcon = (type: string) => {
        switch (type) {
            case 'academic': return <BookOpen className="h-4 w-4 text-blue-500" />
            case 'holiday': return <PartyPopper className="h-4 w-4 text-pink-500" />
            case 'sports': return <Trophy className="h-4 w-4 text-amber-500" />
            case 'exam': return <Clock className="h-4 w-4 text-red-500" />
            default: return <CalendarDays className="h-4 w-4 text-slate-500" />
        }
    }

    const getColor = (type: string) => {
        switch (type) {
            case 'academic': return "bg-blue-500/10 border-blue-500/20 text-blue-500"
            case 'holiday': return "bg-pink-500/10 border-pink-500/20 text-pink-500"
            case 'sports': return "bg-amber-500/10 border-amber-500/20 text-amber-500"
            case 'exam': return "bg-red-500/10 border-red-500/20 text-red-500"
            default: return "bg-slate-500/10 border-slate-500/20 text-slate-500"
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
                <Button
                    variant={filter === 'all' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('all')}
                    className="h-8"
                >
                    All Events
                </Button>
                <Button
                    variant={filter === 'academic' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('academic')}
                    className="h-8 text-blue-400 hover:text-blue-300"
                >
                    Academic
                </Button>
                <Button
                    variant={filter === 'exam' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('exam')}
                    className="h-8 text-red-400 hover:text-red-300"
                >
                    Exams
                </Button>
                <Button
                    variant={filter === 'sports' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('sports')}
                    className="h-8 text-amber-400 hover:text-amber-300"
                >
                    Sports
                </Button>
                <Button
                    variant={filter === 'holiday' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('holiday')}
                    className="h-8 text-pink-400 hover:text-pink-300"
                >
                    Holidays
                </Button>
            </div>

            <div className="space-y-8">
                {Object.entries(groupedEvents).map(([month, monthEvents]) => (
                    <div key={month} className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-400 sticky top-0 bg-slate-950/80 backdrop-blur-sm py-2 z-10">
                            {month}
                        </h3>
                        <div className="grid gap-3">
                            {monthEvents.map(event => (
                                <div
                                    key={event.id}
                                    className="group flex gap-4 p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:border-white/10 hover:bg-slate-900 transition-all"
                                >
                                    <div className={cn(
                                        "flex-shrink-0 w-16 h-16 rounded-lg flex flex-col items-center justify-center border",
                                        getColor(event.type)
                                    )}>
                                        <span className="text-xl font-bold">{format(new Date(event.start_date), "d")}</span>
                                        <span className="text-[10px] uppercase font-medium">{format(new Date(event.start_date), "EEE")}</span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h4 className="text-white font-medium group-hover:text-[var(--school-accent)] transition-colors truncate">
                                                    {event.title}
                                                </h4>
                                                <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                                                    {event.description}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className={cn("capitalize border-0", getColor(event.type))}>
                                                {getIcon(event.type)}
                                                <span className="ml-1.5">{event.type}</span>
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {filteredEvents.length === 0 && (
                    <div className="py-12 text-center border border-dashed border-white/10 rounded-xl">
                        <p className="text-slate-500">No events found for this category.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
