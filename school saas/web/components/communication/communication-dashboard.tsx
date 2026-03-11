"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AbsenteeFollowUp } from "./absentee-followup"
import { BroadcastComposer } from "./broadcast-composer"
import { ChatInterface } from "./chat-interface"
import { CommunicationSettingsView } from "./communication-settings"
import { getUserRole } from "@/lib/actions/communication"

export function CommunicationDashboard({ initialRole }: { initialRole?: string }) {
    const [role] = useState<string | null>(initialRole || null)

    const isParent = role === 'parent'
    const isStaff = role && ['admin', 'teacher', 'principal', 'owner', 'manager', 'registrar', 'bursar'].includes(role)
    const isAdmin = role && ['admin', 'principal', 'owner', 'manager'].includes(role)

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-foreground">Communication Hub</h2>
                <p className="text-sm text-muted-foreground">
                    {isParent
                        ? "Communicate directly with school staff and teachers."
                        : "Manage broadcasts, follow up on absentees, and configure automated alerts."}
                </p>
            </div>

            <Tabs key={role || 'loading'} defaultValue={isParent ? "chat" : isStaff ? "absentees" : "chat"} className="space-y-6">
                {role && (
                    <TabsList className="bg-card text-card-foreground border border-border/50 p-1 text-muted-foreground">
                        {isStaff && (
                            <TabsTrigger value="absentees" className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-foreground">Daily Absentees</TabsTrigger>
                        )}
                        {isAdmin && (
                            <TabsTrigger value="broadcast" className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-foreground">Broadcast</TabsTrigger>
                        )}
                        <TabsTrigger value="chat" className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-foreground">Parent Chat</TabsTrigger>
                        {isAdmin && (
                            <TabsTrigger value="settings" className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-foreground">Settings</TabsTrigger>
                        )}
                    </TabsList>
                )}

                {isStaff && (
                    <TabsContent value="absentees" className="space-y-4">
                        <AbsenteeFollowUp />
                    </TabsContent>
                )}

                {isAdmin && (
                    <TabsContent value="broadcast" className="max-w-3xl">
                        <BroadcastComposer />
                    </TabsContent>
                )}

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
