"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Wrench, CheckCircle2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { createMaintenanceTicket, updateMaintenanceTicket } from "@/lib/actions/hostel"

import { useRouter } from "next/navigation"

export function MaintenanceClient({
    initialTickets,
    staffList = []
}: {
    initialTickets: any[],
    staffList?: any[]
}) {
    const router = useRouter()
    // Using props directly ensures reactivity with router.refresh()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [newTicket, setNewTicket] = useState({ title: "", desc: "", priority: "medium", location: "" })

    const statusColors: any = {
        pending: "bg-amber-500/10 text-amber-500",
        assigned: "bg-blue-500/10 text-blue-500",
        in_progress: "bg-purple-500/10 text-purple-500",
        resolved: "bg-green-500/10 text-green-500",
    }

    const priorityColors: any = {
        low: "bg-slate-500/10 text-slate-400",
        medium: "bg-blue-500/10 text-blue-400",
        high: "bg-amber-500/10 text-amber-500",
        critical: "bg-red-500/10 text-red-500",
    }

    const handleSubmit = async () => {
        if (!newTicket.title) return toast.error("Title is required")

        setIsSubmitting(true)
        const res = await createMaintenanceTicket(
            newTicket.title,
            newTicket.desc,
            newTicket.priority,
            newTicket.location
        )
        setIsSubmitting(false)

        if (res.success) {
            toast.success("Maintenance Ticket Created")
            setNewTicket({ title: "", desc: "", priority: "medium", location: "" })
            setIsOpen(false)
            router.refresh()
        } else {
            toast.error(res.error || "Failed to create ticket")
        }
    }

    const handleAssign = async (ticketId: string, staffId: string) => {
        const res = await updateMaintenanceTicket(ticketId, {
            assigned_to: staffId,
            status: 'assigned'
        })
        if (res.success) {
            toast.success("Ticket Assigned")
            router.refresh()
        } else {
            toast.error(res.error || "Failed to assign")
        }
    }

    const handleStatusUpdate = async (ticketId: string, status: string) => {
        const res = await updateMaintenanceTicket(ticketId, { status })
        if (res.success) {
            toast.success(`Ticket marked as ${status.replace('_', ' ')}`)
            router.refresh()
        } else {
            toast.error(res.error || "Failed to update status")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Maintenance Log</h2>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[var(--school-accent)] text-white">
                            <Plus className="mr-2 h-4 w-4" /> New Ticket
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-950 border-white/10 text-white">
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg">Log Issue</h3>
                            <Input
                                placeholder="Problem Title (e.g. Broken Fan)"
                                className="bg-slate-900 border-white/10"
                                onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                            />
                            <Input
                                placeholder="Location (e.g. Room 101)"
                                className="bg-slate-900 border-white/10"
                                onChange={(e) => setNewTicket({ ...newTicket, location: e.target.value })}
                            />
                            <Select onValueChange={(v) => setNewTicket({ ...newTicket, priority: v })}>
                                <SelectTrigger className="bg-slate-900 border-white/10">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                            <Textarea
                                placeholder="Description..."
                                className="bg-slate-900 border-white/10"
                                onChange={(e) => setNewTicket({ ...newTicket, desc: e.target.value })}
                            />
                            <Button
                                className="w-full bg-[var(--school-accent)]"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Submitting..." : "Submit Request"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {initialTickets.length > 0 ? initialTickets.map(ticket => (
                    <Card key={ticket.id} className="p-4 bg-slate-900 border-white/5 flex items-center justify-between group hover:border-[var(--school-accent)]/50 transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center bg-slate-800`}>
                                <Wrench className="h-6 w-6 text-slate-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">{ticket.title}</h3>
                                <p className="text-sm text-slate-400">
                                    {ticket.location_type === 'hostel_room' ? 'Hostel' : 'General'} • {new Date(ticket.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end gap-1 px-3">
                                <Badge variant="outline" className={`capitalize border-0 ${priorityColors[ticket.priority]}`}>
                                    {ticket.priority}
                                </Badge>
                                <Badge variant="outline" className={`capitalize border-0 ${statusColors[ticket.status]}`}>
                                    {ticket.status.replace('_', ' ')}
                                </Badge>
                            </div>

                            <div className="flex items-center gap-2 border-l border-white/10 pl-4 h-12">
                                {ticket.status === 'pending' && (
                                    <div className="flex items-center gap-2">
                                        <Wrench className="h-4 w-4 text-amber-500" />
                                        <Select onValueChange={(v) => handleAssign(ticket.id, v)}>
                                            <SelectTrigger className="h-9 w-40 bg-slate-800 border-white/5 text-xs text-white hover:bg-slate-700 transition-colors">
                                                <SelectValue placeholder="Assign Staff to Fix" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                                                {staffList.length > 0 ? staffList.map((s: any) => (
                                                    <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>
                                                )) : (
                                                    <div className="p-2 text-xs text-slate-500 italic">No staff found</div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {(ticket.status === 'assigned' || ticket.status === 'in_progress') && (
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="text-[10px] text-slate-500 italic">
                                            Assigned to: <span className="text-blue-400 not-italic font-medium">{ticket.assigned_staff?.full_name || 'Staff Member'}</span>
                                        </span>
                                        <div className="flex gap-2">
                                            {ticket.status === 'assigned' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-[10px] bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20"
                                                    onClick={() => handleStatusUpdate(ticket.id, 'in_progress')}
                                                >
                                                    Start Work
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-7 text-[10px] bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
                                                onClick={() => handleStatusUpdate(ticket.id, 'resolved')}
                                            >
                                                Mark Resolved
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {ticket.status === 'resolved' && (
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-[10px] text-slate-500 italic">Completed by Staff</span>
                                        <span className="text-xs text-green-500/70 flex items-center gap-1 font-medium">
                                            <CheckCircle2 className="h-4 w-4" /> Finalized
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                )) : (
                    <div className="py-20 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-dashed border-white/10">
                        No maintenance tickets found.
                    </div>
                )}
            </div>
        </div>
    )
}
