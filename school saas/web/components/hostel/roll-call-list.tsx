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
                <div key={student.id} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-white/5">
                    <div className="flex-1">
                        <div className="font-bold text-white">{student.name}</div>
                        <div className="text-xs text-slate-400">{student.room}</div>
                    </div>

                    <div className="flex items-center gap-1">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => onChange(student.id, 'present')}
                                        className={`p-2 rounded-full transition-all ${student.status === 'present'
                                            ? 'bg-green-500/20 text-green-500 ring-1 ring-green-500'
                                            : 'bg-slate-800 text-slate-500 hover:text-white'
                                            }`}
                                    >
                                        <Home className="h-5 w-5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-900 border-white/10 text-white">
                                    Present
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => onChange(student.id, 'absent')}
                                        className={`p-2 rounded-full transition-all ${student.status === 'absent'
                                            ? 'bg-red-500/20 text-red-500 ring-1 ring-red-500'
                                            : 'bg-slate-800 text-slate-500 hover:text-white'
                                            }`}
                                    >
                                        <XCircle className="h-5 w-5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-900 border-white/10 text-white">
                                    Absent
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => onChange(student.id, 'sick_bay')}
                                        className={`p-2 rounded-full transition-all ${student.status === 'sick_bay'
                                            ? 'bg-amber-500/20 text-amber-500 ring-1 ring-amber-500'
                                            : 'bg-slate-800 text-slate-500 hover:text-white'
                                            }`}
                                    >
                                        <AlertCircle className="h-5 w-5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-900 border-white/10 text-white">
                                    Sick Bay
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => onChange(student.id, 'exeat')}
                                        className={`p-2 rounded-full transition-all ${student.status === 'exeat'
                                            ? 'bg-blue-500/20 text-blue-500 ring-1 ring-blue-500'
                                            : 'bg-slate-800 text-slate-500 hover:text-white'
                                            }`}
                                    >
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-900 border-white/10 text-white">
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
