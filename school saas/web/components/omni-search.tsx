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
import { Search, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
// import { Dialog, DialogContent } from "@/components/ui/dialog" // Using cmdk Dialog directly or shadcn wrapper if available.
// Since shadcn command is not yet in components/ui, simplified version here or install shadcn command.
// I'll build a custom wrapper using cmdk primitive for speed and "obsidian" styling.

export function OmniSearch() {
    const [open, setOpen] = React.useState(false)

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="relative group flex items-center gap-2 h-9 w-64 rounded-full border border-white/10 bg-white/5 px-3 text-sm text-slate-400 hover:bg-white/10 hover:border-white/20 transition-all outline-none focus:ring-2 focus:ring-blue-500/50"
            >
                <Search className="h-4 w-4" />
                <span className="flex-1 text-left truncate">Search students, staff...</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-slate-400 opacity-100">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            {open && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 flex items-start justify-center pt-[20vh]">
                    <div className="w-full max-w-lg overflow-hidden rounded-xl border border-white/10 bg-[#0d1117] shadow-2xl animate-in zoom-in-95 duration-200">
                        <CommandPrimitive className="h-full w-full">
                            <div className="flex items-center border-b border-white/10 px-3" cmdk-input-wrapper="">
                                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-white" />
                                <CommandPrimitive.Input
                                    placeholder="Type a command or search..."
                                    className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-50 text-white"
                                />
                            </div>
                            <CommandPrimitive.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
                                <CommandPrimitive.Empty className="py-6 text-center text-sm text-slate-500">
                                    No results found.
                                </CommandPrimitive.Empty>

                                <CommandPrimitive.Group heading="Quick Actions" className="text-xs font-medium text-slate-500 px-2 py-1.5">
                                    <CommandItem onSelect={() => setOpen(false)}>
                                        <RocketIcon className="mr-2 h-4 w-4" />
                                        <span>New Admission</span>
                                    </CommandItem>
                                    <CommandItem onSelect={() => setOpen(false)}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        <span>Check Schedule</span>
                                    </CommandItem>
                                </CommandPrimitive.Group>

                                <CommandPrimitive.Group heading="Records" className="text-xs font-medium text-slate-500 px-2 py-1.5 mt-2">
                                    <CommandItem onSelect={() => setOpen(false)}>
                                        <PersonIcon className="mr-2 h-4 w-4" />
                                        <span>Find Student</span>
                                    </CommandItem>
                                    <CommandItem onSelect={() => setOpen(false)}>
                                        <EnvelopeClosedIcon className="mr-2 h-4 w-4" />
                                        <span>Message Staff</span>
                                    </CommandItem>
                                </CommandPrimitive.Group>

                                <CommandPrimitive.Group heading="Settings" className="text-xs font-medium text-slate-500 px-2 py-1.5 mt-2">
                                    <CommandItem onSelect={() => setOpen(false)}>
                                        <GearIcon className="mr-2 h-4 w-4" />
                                        <span>General Settings</span>
                                    </CommandItem>
                                </CommandPrimitive.Group>

                            </CommandPrimitive.List>
                        </CommandPrimitive>
                    </div>
                    {/* Simple backdrop click logic could be added or use Dialogue primitive properly */}
                    <div className="absolute inset-0 z-[-1]" onClick={() => setOpen(false)} />
                </div>
            )}
        </>
    )
}

function CommandItem({ children, onSelect }: { children: React.ReactNode, onSelect?: () => void }) {
    return (
        <CommandPrimitive.Item
            onSelect={onSelect}
            className="relative flex cursor-default select-none items-center rounded-md px-2 py-2 text-sm outline-none aria-selected:bg-blue-600 aria-selected:text-white text-slate-300 hover:bg-white/5 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
        >
            {children}
        </CommandPrimitive.Item>
    )
}
