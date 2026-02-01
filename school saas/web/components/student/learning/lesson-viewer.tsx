"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, Download } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export function LessonViewer({ lesson, onBack }: { lesson: any, onBack: () => void }) {
    return (
        <div className="flex flex-col h-full animat-in slide-in-from-right-4">
            <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-400 hover:text-white p-0 h-auto">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                </Button>
            </div>

            <div className="bg-white rounded-xl overflow-hidden flex-1 flex flex-col">
                <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-start">
                    <div>
                        <h2 className="text-slate-900 font-bold text-lg">{lesson.topic}</h2>
                        <p className="text-slate-500 text-xs">Week {lesson.week} • {lesson.grade_level}</p>
                    </div>
                </div>

                <ScrollArea className="flex-1 p-6 bg-white text-slate-800">
                    <div className="prose prose-sm max-w-none">
                        {/* 
                           In a real app, this would be a Markdown renderer like react-markdown.
                           For simplicity, we just inject the text or html. 
                        */}
                        <div dangerouslySetInnerHTML={{ __html: lesson.content || "<p>No content available.</p>" }} />

                        {!lesson.content && (
                            <div className="space-y-4">
                                <p><strong>Overview:</strong> Understanding the core concepts of {lesson.topic}.</p>
                                <p>This lesson covers:</p>
                                <ul>
                                    {lesson.subtopics?.split(',').map((s: string, i: number) => (
                                        <li key={i}>{s.trim()}</li>
                                    )) || <li>General Introduction</li>}
                                </ul>
                                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-800 my-4 text-sm">
                                    <strong>Teacher's Note:</strong> Please review the textbook pages 45-50 before the next class.
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                    <Button size="sm" variant="outline" className="border-slate-300 text-slate-700">
                        <Download className="h-4 w-4 mr-2" /> Download PDF
                    </Button>
                </div>
            </div>
        </div>
    )
}
