"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen, Download } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export function LessonViewer({ lesson, onBack }: { lesson: any, onBack: () => void }) {
    const contentStyles = `
        .lesson-content h1 { font-size: 2.25rem; font-weight: 800; margin-bottom: 2rem; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem; }
        .lesson-content h2 { font-size: 1.5rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1.25rem; color: #1e293b; border-left: 4px solid #3b82f6; padding-left: 1rem; }
        .lesson-content h3 { font-size: 1.25rem; font-weight: 600; margin-top: 2rem; margin-bottom: 0.75rem; color: #334155; }
        .lesson-content p { margin-bottom: 1.5rem; line-height: 1.8; color: #475569; font-size: 1.05rem; }
        .lesson-content ul, .lesson-content ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
        .lesson-content li { margin-bottom: 0.75rem; line-height: 1.6; color: #475569; }
        .lesson-content table { width: 100%; border-collapse: collapse; margin: 2rem 0; border: 1px solid #e2e8f0; }
        .lesson-content th { background: #f8fafc; padding: 12px; text-align: left; border: 1px solid #e2e8f0; font-weight: 600; }
        .lesson-content td { padding: 12px; border: 1px solid #e2e8f0; }
        
        @media print {
            .no-print { display: none !important; }
            .print-padding { padding: 40px !important; }
            body { background: white !important; }
        }
    `

    const handleDownload = () => {
        // Simple and effective: Print triggers "Save as PDF" in most browsers
        // We ensure the content looks good for print via the @media print styles
        window.print()
    }

    return (
        <div className="flex flex-col h-full animat-in slide-in-from-right-4 bg-slate-950">
            <style>{contentStyles}</style>

            <div className="flex items-center justify-between gap-2 mb-4 px-2 no-print">
                <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-400 hover:text-white hover:bg-white/5">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to Locker
                </Button>
            </div>

            <div className="bg-slate-900 shadow-2xl rounded-2xl overflow-hidden flex-1 flex flex-col border border-white/10">
                {/* Visual Header */}
                <div className="bg-slate-950 p-8 text-white no-print border-b border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <BookOpen className="h-5 w-5 text-blue-400" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">Lesson Note</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white">{lesson.title}</h2>
                    <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-mono">
                        <span className="bg-white/5 border border-white/5 px-2 py-1 rounded">Week {lesson.week}</span>
                        <span className="bg-white/5 border border-white/5 px-2 py-1 rounded">{lesson.grade_level}</span>
                        <span className="bg-white/5 border border-white/5 px-2 py-1 rounded">{lesson.subject}</span>
                    </div>
                </div>

                {/* Print-only Header */}
                <div className="hidden print:block p-10 border-b-2 border-slate-200 mb-8">
                    <h1 className="text-4xl font-black text-slate-900 mb-2 uppercase tracking-tight">{lesson.title}</h1>
                    <p className="text-slate-500 font-mono">Subject: {lesson.subject} | Level: {lesson.grade_level} | Week: {lesson.week}</p>
                </div>

                <ScrollArea className="flex-1 p-6 md:p-12 bg-slate-950/50 print:overflow-visible">
                    <div className="lesson-content print-padding max-w-4xl mx-auto bg-white shadow-xl min-h-[800px] p-8 md:p-12 rounded-sm relative">
                        {/* Paper texture effect/glow */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-b from-black/5 to-transparent pointer-events-none" />
                        <div dangerouslySetInnerHTML={{ __html: lesson.content || "<p>No content available.</p>" }} />
                    </div>
                </ScrollArea>

                <div className="p-6 bg-slate-900 border-t border-white/10 flex justify-end gap-3 no-print">
                    <Button
                        variant="default"
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                        onClick={handleDownload}
                    >
                        <Download className="h-4 w-4 mr-2" /> Download PDF / Print
                    </Button>
                </div>
            </div>
        </div>
    )
}
