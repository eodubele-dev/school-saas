"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { CreatePostForm } from "./create-post-form"
import { FeedList } from "./feed-list"

interface ClassFeedManagerProps {
    classes: { id: string; name: string }[]
}

export function ClassFeedManager({ classes }: ClassFeedManagerProps) {
    const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || "")
    const [refreshTrigger, setRefreshTrigger] = useState(0)

    const handlePostCreated = () => {
        setRefreshTrigger(prev => prev + 1)
        // Optionally switch tab to feed if on mobile
    }

    if (classes.length === 0) {
        return <div>No classes assigned.</div>
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Class Selector */}
            <Card>
                <CardContent className="p-4">
                    <div className="space-y-2">
                        <Label>Select Class</Label>
                        <select
                            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                        >
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Desktop: Side-by-side or Stacked? 
                Let's do stacked for simplicity and mobile-first. 
                "What's New" input at top, feed below.
            */}

            <div className="space-y-6">
                <CreatePostForm
                    classId={selectedClassId}
                    onPostCreated={handlePostCreated}
                />

                <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Class Updates</h3>
                    <FeedList
                        classId={selectedClassId}
                        refreshTrigger={refreshTrigger}
                    />
                </div>
            </div>
        </div>
    )
}
