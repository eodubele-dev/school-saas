"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AbsenteeFollowUp } from "./absentee-followup"
import { BroadcastComposer } from "./broadcast-composer"
import { ChatInterface } from "./chat-interface"
import { CommunicationSettingsView } from "./communication-settings"
import { getUserRole } from "@/lib/actions/communication"

export function CommunicationDashboard() {
    const [role, setRole] = useState<string | null>(null)

    useEffect(() => {
        const fetchRole = async () => {
            const res = await getUserRole()
            if (res.success) {
                setRole(res.role)
            }
        }
        fetchRole()
    }, [])

    const isAdmin = role === 'admin' || role === 'principal' || role === 'bursar'

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-white">Communication Hub</h2>
                <p className="text-sm text-slate-400">Manage broadcasts, follow up on absentees, and configure automated alerts.</p>
            </div>

            <Tabs defaultValue="absentees" className="space-y-6">
                <TabsList className="bg-slate-900 border border-white/5 p-1 text-slate-400">
                    <TabsTrigger value="absentees" className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-white">Daily Absentees</TabsTrigger>
                    <TabsTrigger value="broadcast" className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-white">Broadcast</TabsTrigger>
                    <TabsTrigger value="chat" className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-white">Parent Chat</TabsTrigger>
                    {isAdmin && (
                        <TabsTrigger value="settings" className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-white">Settings</TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="absentees" className="space-y-4">
                    <AbsenteeFollowUp />
                </TabsContent>

                <TabsContent value="broadcast" className="max-w-3xl">
                    <BroadcastComposer />
                </TabsContent>

                <TabsContent value="chat">
                    <ChatInterface />
                </TabsContent>

                {isAdmin && (
                    <TabsContent value="settings">
                        <CommunicationSettingsView />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    )
}
