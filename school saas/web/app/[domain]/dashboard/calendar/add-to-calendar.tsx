"use client"

import { Button } from "@/components/ui/button"
import { CalendarPlus, Smartphone, Check } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface AddToCalendarProps {
    title: string
    description: string
    startDate: string
    endDate: string
}

export function AddToCalendarButton({ title, description, startDate, endDate }: AddToCalendarProps) {

    const handleGoogleCalendar = () => {
        const format = (dateStr: string) => {
            const date = new Date(dateStr)
            return date.toISOString().replace(/-|:|\.\d\d\d/g, "")
        }
        const start = format(startDate)
        const end = format(endDate || startDate)
        const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(description || "")}&sf=true&output=xml`
        window.open(url, '_blank')
    }

    const handleSyncToPhone = () => {
        // Generate ICS file content
        const formatICS = (dateStr: string) => {
            const date = new Date(dateStr)
            return date.toISOString().replace(/-|:|\.\d\d\d/g, "").slice(0, 15) + 'Z'
        }

        const start = formatICS(startDate)
        const end = formatICS(endDate || startDate)
        const now = formatICS(new Date().toISOString())

        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//EduFlow//School Calendar//EN
BEGIN:VEVENT
UID:${now}-${title.replace(/\s/g, '')}@eduflow.com
DTSTAMP:${now}
DTSTART:${start}
DTEND:${end}
SUMMARY:${title}
DESCRIPTION:${description || ""}
END:VEVENT
END:VCALENDAR`

        // Create blob and download
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${title}.ics`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast.success("Calendar Event Downloaded", {
            description: "Open the file to add to your phone's calendar."
        })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                    title="Add to Calendar"
                >
                    <CalendarPlus className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-slate-200">
                <DropdownMenuItem onClick={handleSyncToPhone} className="cursor-pointer focus:bg-cyan-500/10 focus:text-cyan-400">
                    <Smartphone className="mr-2 h-4 w-4" />
                    <span>Sync to Phone (ICS)</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={handleGoogleCalendar} className="cursor-pointer focus:bg-cyan-500/10 focus:text-cyan-400">
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    <span>Google Calendar</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
