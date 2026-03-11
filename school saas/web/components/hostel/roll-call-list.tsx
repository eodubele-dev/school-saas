"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, AlertCircle, Home, LogOut } from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

type Student = {
    id: string
    name: string
    room: string
    status: 'present' | 'absent' | 'exeat' | 'sick_bay'
}

export function RollCallList({
    students,
    onChange
}: {
    students: Student[],
    onChange: (id: string, status: Student['status']) => void
}) {
    return (
        <div className="space-y-2">
            {students.map(student => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-card text-card-foreground rounded-lg border border-border/50">
                    <div className="flex-1">
                        <div className="font-bold text-foreground">{student.name}</div>
                        <div className="text-xs text-muted-foreground">{student.room}</div>
                    </div>

                    <div className="flex items-center gap-1">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => onChange(student.id, 'present')}
                                        className={`p-2 rounded-full transition-all ${student.status === 'present'
                                            ? 'bg-green-500/20 text-green-500 ring-1 ring-green-500'
                                            : 'bg-slate-800 text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        <Home className="h-5 w-5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-card text-card-foreground border-border text-foreground">
                                    Present
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => onChange(student.id, 'absent')}
                                        className={`p-2 rounded-full transition-all ${student.status === 'absent'
                                            ? 'bg-red-500/20 text-red-500 ring-1 ring-red-500'
                                            : 'bg-slate-800 text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        <XCircle className="h-5 w-5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-card text-card-foreground border-border text-foreground">
                                    Absent
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => onChange(student.id, 'sick_bay')}
                                        className={`p-2 rounded-full transition-all ${student.status === 'sick_bay'
                                            ? 'bg-amber-500/20 text-amber-500 ring-1 ring-amber-500'
                                            : 'bg-slate-800 text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        <AlertCircle className="h-5 w-5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-card text-card-foreground border-border text-foreground">
                                    Sick Bay
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => onChange(student.id, 'exeat')}
                                        className={`p-2 rounded-full transition-all ${student.status === 'exeat'
                                            ? 'bg-blue-500/20 text-blue-500 ring-1 ring-blue-500'
                                            : 'bg-slate-800 text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-card text-card-foreground border-border text-foreground">
                                    Exeat (Out)
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            ))}
        </div>
    )
}
