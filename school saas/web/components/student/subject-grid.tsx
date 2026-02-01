"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BookOpen, ChevronRight } from "lucide-react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function SubjectGrid({ subjects }: { subjects: any[] }) {
    const [selectedSubject, setSelectedSubject] = useState<any>(null)

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {subjects.map(subject => (
                <Drawer key={subject.id}>
                    <DrawerTrigger asChild>
                        <Card className="p-4 bg-slate-900 border-white/5 hover:border-[var(--school-accent)]/50 transition-colors cursor-pointer group">
                            <div className="flex justify-between items-start mb-3">
                                <div className={`h-8 w-8 rounded-full ${subject.color} flex items-center justify-center text-white font-bold text-xs`}>
                                    {subject.name.substring(0, 2)}
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
                            </div>

                            <h3 className="font-bold text-white truncate mb-1">{subject.name}</h3>

                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>CA Score</span>
                                    <span>{subject.ca} / {subject.target}</span>
                                </div>
                                <Progress
                                    value={(subject.ca / subject.target) * 100}
                                    className="h-1.5 bg-slate-800"
                                    indicatorClassName={subject.color}
                                />
                            </div>
                        </Card>
                    </DrawerTrigger>

                    <DrawerContent className="bg-slate-950 border-white/10">
                        <div className="max-w-2xl mx-auto w-full p-6 space-y-4">
                            <DrawerHeader>
                                <DrawerTitle className="text-2xl font-bold text-white flex items-center gap-2">
                                    <BookOpen className="h-6 w-6 text-[var(--school-accent)]" />
                                    {subject.name} - Lesson Notes
                                </DrawerTitle>
                            </DrawerHeader>

                            {/* Mock Lesson Notes Content */}
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="p-4 rounded-lg bg-slate-900 border border-white/5 flex justify-between items-center">
                                        <div>
                                            <h4 className="text-white font-medium">Week {i}: Introduction to Topic</h4>
                                            <p className="text-sm text-slate-400">Uploaded by Mr. Teacher • 2 days ago</p>
                                        </div>
                                        <Button variant="outline" size="sm" className="border-white/10 text-slate-300">View</Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </DrawerContent>
                </Drawer>
            ))}
        </div>
    )
}
