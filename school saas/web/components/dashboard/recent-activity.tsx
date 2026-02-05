
"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ActivityItem {
    type: string
    message: string
    time: string
}

interface RecentActivityProps {
    data?: ActivityItem[]
}

const ITEMS_PER_PAGE = 5

export function RecentActivity({ data }: RecentActivityProps) {
    const [currentPage, setCurrentPage] = useState(1)
    const activities = data || []

    const totalPages = Math.ceil(activities.length / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const currentActivities = activities.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(p => p + 1)
    }

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(p => p - 1)
    }

    return (
        <Card className="bg-slate-900/80 border-white/10 backdrop-blur-xl shadow-2xl h-full flex flex-col">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white font-semibold text-base tracking-tight">Recent System Activity</CardTitle>
                    <span className="text-xs text-slate-500 font-mono bg-white/5 px-2 py-1 rounded">
                        {activities.length} Events
                    </span>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-6">
                    {currentActivities.length > 0 ? (
                        currentActivities.map((item, index) => (
                            <div key={index} className="flex items-center animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                                <Avatar className="h-9 w-9 bg-slate-800 border border-white/10 shrink-0">
                                    <AvatarFallback className="text-xs text-blue-400 font-bold bg-blue-500/10">
                                        {item.type.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1 min-w-0">
                                    <p className="text-sm font-medium leading-none text-slate-200 truncate">{item.type}</p>
                                    <p className="text-xs text-slate-500 truncate">
                                        {item.message}
                                    </p>
                                </div>
                                <div className="ml-auto text-xs text-slate-400 whitespace-nowrap pl-2">
                                    {new Date(item.time).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric"
                                    })}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-center space-y-2">
                            <div className="h-12 w-12 rounded-full bg-slate-800/50 flex items-center justify-center">
                                <div className="h-2 w-2 bg-slate-600 rounded-full animate-ping" />
                            </div>
                            <p className="text-sm text-slate-500">No recent activity recorded</p>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="pt-4 mt-auto border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                        <button
                            onClick={handlePrev}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                        >
                            <ChevronLeft className="h-3 w-3" />
                            Prev
                        </button>
                        <span className="font-mono text-slate-600">
                            Page <span className="text-slate-300">{currentPage}</span> of {totalPages}
                        </span>
                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-1 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                        >
                            Next
                            <ChevronRight className="h-3 w-3" />
                        </button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
