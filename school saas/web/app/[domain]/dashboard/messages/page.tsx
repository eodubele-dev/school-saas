"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MessageSquare, Zap, Users } from "lucide-react"

export default function MessagesPage() {
    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-700 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight glow-blue font-serif">Communication Hub</h1>
                    <p className="text-slate-400">Collaborate with peers, parents, and administration.</p>
                </div>
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
                <Card className="bg-slate-900/50 border-white/5 backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardHeader>
                        <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                            <MessageSquare className="h-6 w-6 text-cyan-400" />
                        </div>
                        <CardTitle className="text-white">EduFlow Platinum Edition Module</CardTitle>
                        <CardDescription className="text-slate-400">
                            Unified messaging for modern schools.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold uppercase tracking-wider">
                            <Zap className="h-3 w-3 animate-pulse" />
                            Real-time Notifications Active
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Send announcements to parents, chat with subject teachers, and manage school-wide bulletins from a single secure interface.
                        </p>
                    </CardContent>
                </Card>

                <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-40">
                    <Users className="h-16 w-16 text-slate-700 mb-4" />
                    <p className="text-lg text-slate-500 font-medium">Provisioning secure communication channels...</p>
                </div>
            </div>
        </div>
    )
}
