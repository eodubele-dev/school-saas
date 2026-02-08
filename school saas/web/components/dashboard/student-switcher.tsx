"use client"

import * as React from "react"
import { Check, ChevronsUpDown, User, GraduationCap } from "lucide-react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Student {
    id: string
    full_name: string
    avatar_url?: string
    classes?: { name: string } | { name: string }[]
}

const getClassName = (s: Student) => {
    if (Array.isArray(s.classes)) {
        return s.classes[0]?.name || 'No Class'
    }
    return s.classes?.name || 'No Class'
}

export function StudentSwitcher({ students = [] }: { students: Student[] }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // specific logic: if no student ID in URL, default to first student.
    const activeStudentId = searchParams.get('studentId') ?? students[0]?.id

    // Find active student object
    const activeStudent = students.find(s => s.id === activeStudentId) || students[0]

    const onStudentSelect = (studentId: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('studentId', studentId)
        router.push(`${pathname}?${params.toString()}`)
    }

    if (!students.length) return null

    return (
        <div className="px-4 py-2">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3 pl-1">
                Select Child Profile
            </p>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full justify-between h-auto py-3 bg-slate-900/50 border-slate-800 hover:bg-slate-800 hover:text-white text-left group"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <Avatar className="h-9 w-9 border border-slate-700">
                                <AvatarImage src={activeStudent?.avatar_url} />
                                <AvatarFallback className="bg-blue-600 text-white font-bold">
                                    {activeStudent?.full_name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col truncate">
                                <span className="text-sm font-bold text-slate-200 truncate group-hover:text-white transition-colors">
                                    {activeStudent?.full_name}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono uppercase truncate">
                                    {getClassName(activeStudent)}
                                </span>
                            </div>
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[240px] bg-slate-900 border-slate-800 text-slate-200">
                    <DropdownMenuLabel className="text-xs text-slate-500 font-mono uppercase tracking-widest">
                        My Children
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-800" />
                    {students.map((student) => (
                        <DropdownMenuItem
                            key={student.id}
                            onSelect={() => onStudentSelect(student.id)}
                            className="flex items-center gap-2 cursor-pointer focus:bg-slate-800 focus:text-white"
                        >
                            <Avatar className="h-6 w-6 border border-slate-700">
                                <AvatarImage src={student.avatar_url} />
                                <AvatarFallback className="bg-slate-700 text-[10px]">
                                    {student.full_name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col flex-1 truncate">
                                <span className="truncate text-sm font-medium">{student.full_name}</span>
                                <span className="text-[9px] text-slate-500">{getClassName(student)}</span>
                            </div>
                            {activeStudentId === student.id && (
                                <Check className="ml-auto h-4 w-4 text-emerald-500" />
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
