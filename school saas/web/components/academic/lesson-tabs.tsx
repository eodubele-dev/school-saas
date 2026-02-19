"use client"

import { Tabs as TabsRoot, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useRouter, useSearchParams } from "next/navigation"

interface LessonTabsProps {
    defaultTab: string
    children: React.ReactNode
}

export function LessonTabs({ defaultTab, children }: LessonTabsProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentTab = searchParams.get('tab') || defaultTab

    const onTabChange = (val: string) => {
        const params = new URLSearchParams(searchParams)
        params.set('tab', val)
        // If switching tabs, we might want to clear specific query params like edit_id if navigating away from AI? 
        // For now, let's keep it simple and just switch tabs. 
        // Actually, if we leave AI tab, we should probably clear edit_id to avoid confusion if we go back? 
        // User asked for "Edit" to work, which sets edit_id AND tab=ai. 
        // If I click "Archives", edit_id remains. If I go back to AI, it reloads the plan. That seems fine.

        router.push(`?${params.toString()}`, { scroll: false })
    }

    return (
        <TabsRoot value={currentTab} onValueChange={onTabChange} className="flex-1 flex flex-col">
            {children}
        </TabsRoot>
    )
}
