"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useRouter, useSearchParams } from "next/navigation"

export function StudentSearch({ students }: { students: any[] }) {
    const [open, setOpen] = React.useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentId = searchParams.get("studentId") || students[0]?.id

    const selectedStudent = students.find((s) => s.id === currentId)

    return (
        <div className="mb-6">
            <label className="block text-xs font-medium text-slate-400 mb-2">Search Student</label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between bg-slate-900 border-white/10 text-white hover:bg-slate-800 hover:text-white"
                    >
                        {selectedStudent
                            ? `${selectedStudent.full_name} (${selectedStudent.details})`
                            : "Search by name or class..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0 bg-slate-950 border-white/10 text-white">
                    <Command className="bg-transparent">
                        <CommandInput placeholder="Search by name or class..." className="text-white" />
                        <CommandList>
                            <CommandEmpty>No student found.</CommandEmpty>
                            <CommandGroup>
                                {students.map((student) => (
                                    <CommandItem
                                        key={student.id}
                                        value={`${student.full_name} ${student.details}`}
                                        onSelect={() => {
                                            const params = new URLSearchParams(searchParams)
                                            params.set("studentId", student.id)
                                            router.push(`?${params.toString()}`)
                                            setOpen(false)
                                        }}
                                        className="text-slate-300 aria-selected:bg-white/10 aria-selected:text-white cursor-pointer"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                currentId === student.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <span>{student.full_name}</span>
                                            <span className="text-[10px] text-slate-500">{student.details}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}
