"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PTAManager } from "./pta-manager"
import { FeedbackInbox } from "./feedback-inbox"

interface VoiceDashboardProps {
    ptaMeetings: any[];
    feedbackSubmissions: any[];
}

export function VoiceDashboard({ ptaMeetings, feedbackSubmissions }: VoiceDashboardProps) {
    const [activeTab, setActiveTab] = useState("pta")

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-zinc-900 border border-white/10 p-1 rounded-xl shadow-sm h-auto inline-flex">
                <TabsTrigger value="pta" className="rounded-lg py-2 px-6 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm transition-all font-medium text-zinc-400">
                    PTA Requests
                </TabsTrigger>
                <TabsTrigger value="feedback" className="rounded-lg py-2 px-6 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm transition-all font-medium text-zinc-400">
                    Parent Feedback
                </TabsTrigger>
            </TabsList>

            <TabsContent value="pta" className="m-0 border-none p-0 outline-none">
                <PTAManager meetings={ptaMeetings} />
            </TabsContent>

            <TabsContent value="feedback" className="m-0 border-none p-0 outline-none">
                <FeedbackInbox feedback={feedbackSubmissions} />
            </TabsContent>
        </Tabs>
    )
}
