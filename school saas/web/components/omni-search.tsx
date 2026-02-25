'use client'

import * as React from "react"
import {
    CalendarIcon,
    EnvelopeClosedIcon,
    FaceIcon,
    GearIcon,
    PersonIcon,
    RocketIcon,
} from "@radix-ui/react-icons"
import { Command as CommandPrimitive } from "cmdk"
import { Search, Loader2, CreditCard, Activity } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function OmniSearch({ role }: { role?: string }) {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const inputRef = React.useRef<HTMLInputElement>(null)
    const router = useRouter()

    const isParent = role?.toLowerCase() === 'parent'

    // Toggle on Ctrl+K
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                inputRef.current?.focus()
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    return (
        <div className="relative w-full max-w-2xl">
            <CommandPrimitive className="relative rounded-lg border border-transparent" shouldFilter={false}>
                <div className="flex items-center px-3 border border-white/10 bg-slate-900/50 rounded-xl focus-within:border-indigo-500/50 focus-within:bg-slate-900 transition-all">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-slate-400" />
                    <CommandPrimitive.Input
                        ref={inputRef}
                        value={query}
                        onValueChange={setQuery}
                        onFocus={() => setOpen(true)}
                        onBlur={() => setTimeout(() => setOpen(false), 200)}
                        placeholder={isParent ? "Search fees, results, or messages..." : "Search students, staff, or finance..."}
                        className="flex h-10 w-full rounded-md bg-transparent py-3 text-xs outline-none placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50 text-slate-200"
                    />
                    <div className="flex items-center gap-1">
                        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-800 bg-slate-950 px-1.5 font-mono text-[10px] font-medium text-slate-500 opacity-100">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </div>
                </div>

                {open && (
                    <div className="absolute top-full mt-2 w-full z-50 rounded-xl border border-white/10 bg-[#0d1117] shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
                        <CommandPrimitive.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
                            <CommandPrimitive.Empty className="py-6 text-center text-xs text-slate-500">
                                No results found.
                            </CommandPrimitive.Empty>

                            <CommandPrimitive.Group heading="Quick Actions" className="text-[10px] uppercase tracking-wider font-bold text-slate-500 px-2 py-1.5">
                                {isParent ? (
                                    <>
                                        <CommandItem onSelect={() => router.push('/dashboard/billing/family')}>
                                            <CreditCard size={14} className="mr-2 h-3.5 w-3.5 text-emerald-500" />
                                            <span>Pay School Fees</span>
                                        </CommandItem>
                                        <CommandItem onSelect={() => router.push('/dashboard/messages')}>
                                            <EnvelopeClosedIcon className="mr-2 h-3.5 w-3.5 text-blue-500" />
                                            <span>Message School</span>
                                        </CommandItem>
                                    </>
                                ) : (
                                    <>
                                        <CommandItem onSelect={() => console.log('New Admission')}>
                                            <RocketIcon className="mr-2 h-3.5 w-3.5" />
                                            <span>New Admission</span>
                                        </CommandItem>
                                        <CommandItem onSelect={() => console.log('Schedule')}>
                                            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                            <span>Check Schedule</span>
                                        </CommandItem>
                                    </>
                                )}
                            </CommandPrimitive.Group>

                            <CommandPrimitive.Group heading={isParent ? "My Children" : "Records"} className="text-[10px] uppercase tracking-wider font-bold text-slate-500 px-2 py-1.5 mt-2">
                                {isParent ? (
                                    <>
                                        <CommandItem onSelect={() => router.push('/dashboard/academics/results')}>
                                            <FaceIcon className="mr-2 h-3.5 w-3.5 text-amber-500" />
                                            <span>View Academic Results</span>
                                        </CommandItem>
                                        <CommandItem onSelect={() => router.push('/dashboard/academics/attendance')}>
                                            <Activity className="mr-2 h-3.5 w-3.5 text-rose-500" />
                                            <span>Check Attendance</span>
                                        </CommandItem>
                                    </>
                                ) : (
                                    <>
                                        <CommandItem onSelect={() => console.log('Student')}>
                                            <PersonIcon className="mr-2 h-3.5 w-3.5" />
                                            <span>Find Student</span>
                                        </CommandItem>
                                        <CommandItem onSelect={() => console.log('Staff')}>
                                            <EnvelopeClosedIcon className="mr-2 h-3.5 w-3.5" />
                                            <span>Message Staff</span>
                                        </CommandItem>
                                    </>
                                )}
                            </CommandPrimitive.Group>

                            {query.length > 0 && (
                                <CommandPrimitive.Group heading="Search Results" className="text-[10px] uppercase tracking-wider font-bold text-slate-500 px-2 py-1.5 mt-2">
                                    <CommandItem>
                                        <Search className="mr-2 h-3.5 w-3.5" />
                                        <span>Search for "{query}"...</span>
                                    </CommandItem>
                                </CommandPrimitive.Group>
                            )}
                        </CommandPrimitive.List>
                    </div>
                )}
            </CommandPrimitive>
        </div>
    )
}

function CommandItem({ children, onSelect }: { children: React.ReactNode, onSelect?: () => void }) {
    return (
        <CommandPrimitive.Item
            onSelect={onSelect}
            className="relative flex cursor-default select-none items-center rounded-md px-2 py-2 text-xs outline-none aria-selected:bg-indigo-600 aria-selected:text-white text-slate-300 hover:bg-white/5 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
        >
            {children}
        </CommandPrimitive.Item>
    )
}
