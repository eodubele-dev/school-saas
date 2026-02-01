"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BookOpenCheck, Sparkles, Wand2 } from "lucide-react"

export default function GradebookPage() {
    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-700 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight glow-blue font-serif">Gradebook</h1>
                    <p className="text-slate-400">Advanced student assessment and AI narrative reports.</p>
                </div>
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
                <Card className="bg-slate-900/50 border-white/5 backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardHeader>
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
                            <BookOpenCheck className="h-6 w-6 text-blue-400" />
                        </div>
                        <CardTitle className="text-white">EduFlow Platinum Edition Module</CardTitle>
                        <CardDescription className="text-slate-400">
                            The AI Narrative engine is being initialized.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-xs text-blue-400 font-bold uppercase tracking-wider">
                            <Wand2 className="h-3 w-3 animate-pulse" />
                            AI Narrative Generator lives here
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Automatically generate comprehensive terminal reports and behavioral narratives based on academic performance and attendance data.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
