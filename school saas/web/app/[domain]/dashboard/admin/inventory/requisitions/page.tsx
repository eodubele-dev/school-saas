"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X, Clock, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function RequisitionsPage() {
    const [requests, setRequests] = useState([
        { id: 1, user: "Mr. Chioma (Math)", item: "Whiteboard Markers", qty: 2, date: "10 mins ago", status: "pending" },
        { id: 2, user: "Mrs. Adebayo (Admin)", item: "A4 Paper", qty: 5, date: "1 hour ago", status: "pending" },
        { id: 3, user: "Coach Moses", item: "First Aid Kit Refill", qty: 1, date: "Yesterday", status: "approved" },
    ])

    const handleApprove = (id: number) => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: "approved" } : r))
        toast.success("Requisition Approved: Stock Deduced.")
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">Requisition Control</h2>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="bg-slate-900 border border-white/5">
                    <TabsTrigger value="pending" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-500">
                        Pending Approvals
                    </TabsTrigger>
                    <TabsTrigger value="history">Request History</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4 pt-4">
                    {requests.filter(r => r.status === 'pending').map(req => (
                        <Card key={req.id} className="p-4 bg-slate-900 border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{req.user}</h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Badge variant="secondary" className="bg-blue-900/40 text-blue-300 hover:bg-blue-900/60 font-mono">
                                            {req.qty} x {req.item}
                                        </Badge>
                                        <span className="flex items-center gap-1 text-xs">
                                            <Clock className="h-3 w-3" /> {req.date}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-500 hover:bg-red-500/10 hover:text-red-400"
                                >
                                    <X className="h-4 w-4 mr-1" /> Reject
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleApprove(req.id)}
                                >
                                    <Check className="h-4 w-4 mr-1" /> Approve
                                </Button>
                            </div>
                        </Card>
                    ))}

                    {requests.filter(r => r.status === 'pending').length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                            No pending requests.
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history">
                    <div className="text-slate-500 text-center py-8">Historical data loading...</div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
