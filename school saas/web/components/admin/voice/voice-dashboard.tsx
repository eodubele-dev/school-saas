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
            <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl shadow-lg backdrop-blur-xl h-auto">
                <TabsTrigger value="pta" className="rounded-lg py-2.5 px-6 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400 data-[state=active]:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all font-semibold tracking-wide">
                    PTA Requests
                </TabsTrigger>
                <TabsTrigger value="feedback" className="rounded-lg py-2.5 px-6 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400 data-[state=active]:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all font-semibold tracking-wide">
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
