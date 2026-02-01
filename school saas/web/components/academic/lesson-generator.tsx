"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Sparkles, Save, Download, Share2 } from "lucide-react"
import { LessonEditor } from "./lesson-editor"
import { generateLessonPlanAI, saveLessonPlan } from "@/lib/actions/lesson-plan"
import { toast } from "sonner"

import { useRouter } from "next/navigation"

const QUOTES = [
    "Education is the most powerful weapon which you can use to change the world. - Nelson Mandela",
    "The beautiful thing about learning is that no one can take it away from you. - B.B. King",
    "Teachers open the door, but you must enter by yourself. - Chinese Proverb"
]

export function LessonGenerator() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [topic, setTopic] = useState("")
    const [subject, setSubject] = useState("Mathematics")
    const [week, setWeek] = useState("Week 1")
    const [level, setLevel] = useState("JSS 1")
    const [content, setContent] = useState("")

    // AI Generation Handler
    const handleGenerate = async () => {
        if (!topic) {
            toast.error("Please enter a topic")
            return
        }

        setLoading(true)
        const quoteIndex = Math.floor(Math.random() * QUOTES.length)
        const quote = QUOTES[quoteIndex]

        // Show quote toast or UI
        const loadToast = toast.loading(`Generating... "${quote}"`)

        try {
            const res = await generateLessonPlanAI(topic, subject, level, week)
            if (res.success && res.content) {
                setContent(res.content)
                toast.success("Lesson Note Generated!")
            } else {
                toast.error("Failed to generate content")
            }
        } catch (e) {
            toast.error("AI Error")
        } finally {
            toast.dismiss(loadToast)
            setLoading(false)
        }
    }

    const handleSave = async (published: boolean) => {
        if (!topic || !content) return

        const promise = saveLessonPlan({
            title: topic,
            content,
            subject,
            week,
            term: "1st Term",
            class_id: "75440ad8-62d3-4679-b883-7c966a4618e7", // Demo Defaults
            is_published: published
        })

        toast.promise(promise, {
            loading: 'Saving...',
            success: () => {
                router.refresh() // Refresh server components (Recent Plans sidebar)
                return 'Lesson Saved!'
            },
            error: 'Failed to save'
        })
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            {/* Input Panel */}
            <div className="h-fit space-y-6">
                <Card className="p-6 bg-slate-900/80 border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    <div className="relative space-y-5">
                        <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-4 rounded-xl border border-blue-500/30 flex gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg h-fit">
                                <Sparkles className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-blue-300 font-bold text-sm mb-1">AI Architect</h3>
                                <p className="text-[11px] text-blue-200/60 leading-tight">
                                    Generate NERDC-compliant lesson notes in seconds using Gemini 1.5.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-400">Class Level</Label>
                                    <Select value={level} onValueChange={setLevel}>
                                        <SelectTrigger className="bg-slate-800/50 border-white/10 text-xs h-9 text-slate-200"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="JSS 1">JSS 1</SelectItem>
                                            <SelectItem value="JSS 2">JSS 2</SelectItem>
                                            <SelectItem value="SSS 1">SSS 1</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs text-slate-400">Subject</Label>
                                    <Select value={subject} onValueChange={setSubject}>
                                        <SelectTrigger className="bg-slate-800/50 border-white/10 text-xs h-9 text-slate-200"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Mathematics">Mathematics</SelectItem>
                                            <SelectItem value="English">English</SelectItem>
                                            <SelectItem value="Basic Science">Basic Science</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-400">Week</Label>
                                <Select value={week} onValueChange={setWeek}>
                                    <SelectTrigger className="bg-slate-800/50 border-white/10 text-xs h-9 text-slate-200"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 12 }).map((_, i) => (
                                            <SelectItem key={i} value={`Week ${i + 1}`}>Week {i + 1}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-400">Topic (NERDC)</Label>
                                <Input
                                    className="bg-slate-800/50 border-white/10 text-sm h-10 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                    placeholder="e.g. Introduction to Algebra"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                />
                            </div>

                            <Button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="w-full h-10 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all duration-300 border border-t-white/20"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                {loading ? "Architecting..." : "Generate Lesson Note"}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Editor Panel */}
            <div className="lg:col-span-2 flex flex-col gap-4 h-full">
                <div className="flex justify-between items-center bg-slate-900/80 backdrop-blur p-3 px-4 border border-white/5 rounded-xl shadow-lg">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        <h2 className="font-bold text-slate-200 text-sm">Editor Canvas</h2>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => toast.success("PDF Downloaded")} className="text-xs h-8 text-slate-400 hover:text-white hover:bg-white/5">
                            <Download className="h-3 w-3 mr-2" /> PDF
                        </Button>
                        <div className="w-px h-6 bg-white/10 my-auto" />
                        <Button variant="ghost" size="sm" onClick={() => handleSave(false)} className="text-xs h-8 text-slate-400 hover:text-white hover:bg-white/5">
                            <Save className="h-3 w-3 mr-2" /> Save Draft
                        </Button>
                        <Button size="sm" onClick={() => handleSave(true)} className="text-xs h-8 bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20">
                            <Share2 className="h-3 w-3 mr-2" /> Publish
                        </Button>
                    </div>
                </div>

                <div className="flex-1 bg-slate-900/50 border border-white/5 rounded-xl overflow-hidden shadow-2xl relative flex flex-col">
                    {content ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-500 p-8">
                            {/* Paper Effect Container */}
                            <div className="max-w-3xl mx-auto bg-white text-slate-900 min-h-full rounded-sm shadow-xl p-8 lg:p-12 relative">
                                {/* Header Watermark Effect */}
                                <div className="flex items-center gap-4 border-b-2 border-slate-100 pb-6 mb-8">
                                    <div className="h-16 w-16 rounded bg-blue-900 flex items-center justify-center text-white font-bold text-xl">S</div>
                                    <div>
                                        <h3 className="font-bold text-2xl text-slate-900">Blue Horizon High</h3>
                                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">Official Lesson Note</p>
                                    </div>
                                    <div className="ml-auto text-right text-xs text-slate-400">
                                        <p>{date.toLocaleDateString()}</p>
                                        <p>{subject} • {level}</p>
                                    </div>
                                </div>

                                <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-700">
                                    <LessonEditor content={content} onChange={setContent} editable={true} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400/50 bg-[url('/grid-pattern.svg')] bg-[length:24px_24px] opacity-60">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full" />
                                <Sparkles className="h-20 w-20 mb-6 text-slate-600 relative z-10" />
                            </div>
                            <p className="text-sm font-medium tracking-wide text-slate-300">Ready to architect your lesson?</p>
                            <p className="text-xs text-slate-500 mt-2">Select a topic to begin generation.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Helper to get current date
const date = new Date()
