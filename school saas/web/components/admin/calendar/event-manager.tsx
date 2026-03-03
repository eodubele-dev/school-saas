"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    CalendarDays,
    Plus,
    MoreVertical,
    Pencil,
    Trash2,
    Calendar,
    Clock,
    EyeOff
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { EventDialog } from "./event-dialog"
import { deleteSchoolEvent, type SchoolEvent } from "@/lib/actions/calendar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function EventManager({ initialEvents }: { initialEvents: SchoolEvent[] }) {
    const router = useRouter()

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedEvent, setSelectedEvent] = useState<SchoolEvent | null>(null)
    const [loadingDelete, setLoadingDelete] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    const handleCreateNew = () => {
        setSelectedEvent(null)
        setIsDialogOpen(true)
    }

    const handleEdit = (event: SchoolEvent) => {
        setSelectedEvent(event)
        setIsDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return

        setLoadingDelete(id)
        try {
            const res = await deleteSchoolEvent(id)
            if (res.success) {
                toast.success("Event deleted successfully")
                router.refresh()
            } else {
                toast.error(res.error || "Failed to delete event")
            }
        } catch (e: any) {
            toast.error(e.message || "An error occurred")
        } finally {
            setLoadingDelete(null)
        }
    }

    const getStatusColor = (type: string) => {
        switch (type) {
            case 'holiday': return 'text-pink-500 bg-pink-500/10 border-pink-500/20'
            case 'exam': return 'text-amber-500 bg-amber-500/10 border-amber-500/20'
            case 'sports': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
            default: return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
        }
    }

    const filteredEvents = initialEvents.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        event.type.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-72">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Calendar className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                </div>
                <Button
                    onClick={handleCreateNew}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] gap-2 whitespace-nowrap"
                >
                    <Plus className="h-4 w-4" />
                    Publish Event
                </Button>
            </div>

            <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-900/80 border-b border-white/5 text-slate-400">
                            <tr>
                                <th className="px-6 py-4 font-medium">Event Details</th>
                                <th className="px-6 py-4 font-medium">Date & Time</th>
                                <th className="px-6 py-4 font-medium">Category</th>
                                <th className="px-6 py-4 font-medium">Visibility</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredEvents.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-20" />
                                        <p>{searchQuery ? "No events match your search." : "No calendar events found."}</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredEvents.map((event) => (
                                    <tr key={event.id} className="hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">
                                                {event.title}
                                            </div>
                                            {event.description && (
                                                <div className="text-xs text-slate-500 truncate max-w-[250px]">
                                                    {event.description}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <Clock className="h-3.5 w-3.5 text-slate-500" />
                                                {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                {event.end_date && ` - ${new Date(event.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(event.type)}`}>
                                                {event.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {event.is_public ? (
                                                <span className="text-emerald-400 text-xs flex items-center gap-1.5 font-medium">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                                    Public
                                                </span>
                                            ) : (
                                                <span className="text-amber-500 text-xs flex items-center gap-1.5 font-medium">
                                                    <EyeOff className="h-3 w-3" />
                                                    Hidden
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 data-[state=open]:bg-indigo-500/10 data-[state=open]:text-indigo-400">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-slate-200 w-40">
                                                    <DropdownMenuItem
                                                        className="focus:bg-slate-800 focus:text-indigo-400 cursor-pointer text-indigo-400 flex items-center gap-2"
                                                        onClick={() => handleEdit(event)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                        Edit Event
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-white/5" />
                                                    <DropdownMenuItem
                                                        className="focus:bg-red-500/10 focus:text-red-500 cursor-pointer text-red-500 flex items-center gap-2"
                                                        onClick={() => handleDelete(event.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        {loadingDelete === event.id ? 'Deleting...' : 'Delete'}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <EventDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSuccess={() => router.refresh()}
                event={selectedEvent}
            />
        </div>
    )
}
