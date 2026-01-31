"use client"

import { useState } from "react"
import { GradebookEntry } from "@/components/academic/gradebook-entry"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface WrapperProps {
    initialClasses: { id: string, name: string }[]
    initialSubjects: { id: string, name: string }[]
    term: string
    session: string
}

export function GradebookEntryWrapper({ initialClasses, initialSubjects, term, session }: WrapperProps) {
    const [selectedClassId, setSelectedClassId] = useState(initialClasses[0]?.id || "")
    const [selectedSubjectId, setSelectedSubjectId] = useState(initialSubjects[0]?.id || "")

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg bg-card">
                <div className="space-y-2 w-full md:w-[200px]">
                    <Label>Class</Label>
                    <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                            {initialClasses.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2 w-full md:w-[200px]">
                    <Label>Subject</Label>
                    <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                            {initialSubjects.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {selectedClassId && selectedSubjectId ? (
                <GradebookEntry
                    classId={selectedClassId}
                    subjectId={selectedSubjectId}
                    term={term}
                    session={session}
                />
            ) : (
                <div className="text-center py-10 text-muted-foreground">
                    Please select a class and subject to view the gradebook.
                </div>
            )}
        </div>
    )
}
