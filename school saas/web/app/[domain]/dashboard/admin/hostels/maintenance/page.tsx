"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Wrench, CheckCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export default function MaintenancePage() {
    const [tickets, setTickets] = useState<any[]>([
        { id: 1, title: "Broken Fan", location: "Room 101", priority: "high", status: "pending", date: "2025-10-23" },
        { id: 2, title: "Leaking Tap", location: "Room 205", priority: "low", status: "assigned", date: "2025-10-22" },
        { id: 3, title: "Burnt Socket", location: "Common Room", priority: "critical", status: "resolved", date: "2025-10-20" },
    ])

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

    const [newTicket, setNewTicket] = useState({ title: "", desc: "", priority: "medium", location: "" })

    const handleSubmit = () => {
        // Mock submission
        setTickets(prev => [{
            id: Math.random(),
            title: newTicket.title,
            location: newTicket.location,
            priority: newTicket.priority,
            status: "pending",
            date: new Date().toISOString().split('T')[0]
        }, ...prev])

        toast.success("Maintenance Ticket Created")
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Maintenance Log</h2>

                <Dialog>
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
                                <SelectContent>
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
                            <Button className="w-full bg-[var(--school-accent)]" onClick={handleSubmit}>Submit Request</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {tickets.map(ticket => (
                    <Card key={ticket.id} className="p-4 bg-slate-900 border-white/5 flex items-center justify-between group hover:border-[var(--school-accent)]/50 transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-full flex items-center justify-center bg-slate-800`}>
                                <Wrench className="h-6 w-6 text-slate-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg">{ticket.title}</h3>
                                <p className="text-sm text-slate-400">{ticket.location} • {ticket.date}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`capitalize border-0 ${priorityColors[ticket.priority]}`}>
                                {ticket.priority}
                            </Badge>
                            <Badge variant="outline" className={`capitalize border-0 ${statusColors[ticket.status]}`}>
                                {ticket.status.replace('_', ' ')}
                            </Badge>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
