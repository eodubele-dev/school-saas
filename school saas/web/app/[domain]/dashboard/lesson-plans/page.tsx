"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileText, Sparkles, Brain } from "lucide-react"

export default function LessonPlansPage() {
    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-700 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight glow-blue font-serif">Lesson Plans</h1>
                    <p className="text-slate-400">Curated academic content and AI-powered lesson generation.</p>
                </div>
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
                <Card className="bg-slate-900/50 border-white/5 backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardHeader>
                        <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                            <FileText className="h-6 w-6 text-emerald-400" />
                        </div>
                        <CardTitle className="text-white">EduFlow Platinum Edition Module</CardTitle>
                        <CardDescription className="text-slate-400">
                            The AI Lesson Generator is being optimized.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold uppercase tracking-wider">
                            <Brain className="h-3 w-3 animate-pulse" />
                            AI Lesson Generator lives here
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Generate detailed lesson plans, learning objectives, and classroom activities based on the Nigerian National Curriculum in seconds.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
