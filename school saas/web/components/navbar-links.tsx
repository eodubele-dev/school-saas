'use client'

import { Calendar, Book, ExternalLink, ChevronDown, Folder } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
// import { useOmniSearch } from "@/components/omni-search" // Assuming we refactor OmniSearch
// For now, dispath event
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavbarLinksProps {
    domain: string
    scheduleData: any
    userRole?: string
}

export function NavbarLinks({ domain, scheduleData, userRole = 'User' }: NavbarLinksProps) {
    const [nextClass, setNextClass] = useState<{ name: string, time: string } | null>(null)
    const isParent = userRole.toLowerCase() === 'parent'

    useEffect(() => {
        if (scheduleData?.schedule) {
            const now = new Date()
            const currentTime = now.getHours() * 60 + now.getMinutes()

            // Find first class that hasn't started yet (or strictly "Next" implies future)
            // Time string "10:30:00" -> 10*60 + 30
            const upcoming = scheduleData.schedule.find((slot: any) => {
                const [h, m] = slot.start_time.split(':').map(Number)
                return (h * 60 + m) > currentTime
            })

            if (upcoming) {
                setNextClass({
                    name: upcoming.subject?.name || 'Class',
                    time: upcoming.start_time.slice(0, 5) // HH:MM
                })
            }
        }
    }, [scheduleData])

    const handleResourcesClick = (e: React.MouseEvent) => {
        e.preventDefault()
        toast.info("School Resource Vault", {
            description: "Your Admin is currently setting up the digital library.",
            icon: <Folder className="h-4 w-4 text-blue-500" />
        })
    }

    const triggerSearch = () => {
        // Dispatch keydown event for Cmd+K to trigger OmniSearch
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
    }

    const DesktopView = () => (
        <div className="hidden lg:flex items-center gap-6">
            {!isParent && (
                <Link
                    href="/dashboard/schedule"
                    className="text-sm font-medium text-slate-400 hover:text-white hover:underline decoration-blue-500 underline-offset-4 transition-all flex items-center gap-2 group"
                >
                    <Calendar className="h-3.5 w-3.5 group-hover:text-blue-400" />
                    <span>My Schedule</span>
                    {nextClass && (
                        <span className="ml-1 text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded-full animate-pulse">
                            Next: {nextClass.name} ({nextClass.time})
                        </span>
                    )}
                </Link>
            )}

            <button
                onClick={triggerSearch}
                className="text-sm font-medium text-slate-400 hover:text-white transition-all flex items-center gap-2 border border-slate-700/50 hover:border-slate-500 rounded-md px-3 py-1.5 bg-slate-800/20"
            >
                <Book className="h-3.5 w-3.5" />
                Directory
            </button>

            <Link
                href="#"
                onClick={handleResourcesClick}
                className="text-sm font-medium text-slate-500 hover:text-blue-400 transition-all flex items-center gap-2"
            >
                <Folder className="h-3.5 w-3.5" />
                Resources
            </Link>
        </div>
    )

    const MobileView = () => (
        <div className="lg:hidden">
            <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-white">
                    Utilities <ChevronDown className="h-3 w-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-slate-800 text-slate-300">
                    {!isParent && (
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/schedule" className="flex items-center gap-2 cursor-pointer focus:bg-slate-800 focus:text-white">
                                <Calendar className="h-4 w-4" /> My Schedule
                            </Link>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={triggerSearch} className="flex items-center gap-2 cursor-pointer focus:bg-slate-800 focus:text-white">
                        <Book className="h-4 w-4" /> Directory
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleResourcesClick} className="flex items-center gap-2 cursor-pointer focus:bg-slate-800 focus:text-white">
                        <Folder className="h-4 w-4" /> Resources
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )

    return (
        <>
            <DesktopView />
            <MobileView />
        </>
    )
}
