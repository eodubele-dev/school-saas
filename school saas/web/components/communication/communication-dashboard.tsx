"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AbsenteeFollowUp } from "./absentee-followup"
import { BroadcastComposer } from "./broadcast-composer"
import { ChatInterface } from "./chat-interface"

export function CommunicationDashboard() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-white">Communication Hub</h2>
                <p className="text-sm text-slate-400">Manage broadcasts, follow up on absentees, and chat with parents.</p>
            </div>

            <Tabs defaultValue="absentees" className="space-y-6">
                <TabsList className="bg-slate-900 border border-white/5 p-1 text-slate-400">
                    <TabsTrigger value="absentees" className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-white">Daily Absentees</TabsTrigger>
                    <TabsTrigger value="broadcast" className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-white">Broadcast</TabsTrigger>
                    <TabsTrigger value="chat" className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-white">Parent Chat</TabsTrigger>
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
            </Tabs>
        </div>
    )
}
