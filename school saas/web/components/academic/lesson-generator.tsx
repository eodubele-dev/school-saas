"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Sparkles, Save, Download, Share2, Plus, FileText, Activity, Zap } from "lucide-react"
import { LessonEditor } from "./lesson-editor"
import { generateLessonPlanAI, saveLessonPlan, LessonPlan } from "@/lib/actions/lesson-plan"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface LessonGeneratorProps {
    initialPlan?: LessonPlan | null
    teacherClasses?: any[]
}

export function LessonGenerator({ initialPlan, teacherClasses = [] }: LessonGeneratorProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [id, setId] = useState<string | undefined>(undefined)
    const [topic, setTopic] = useState("")
    const [subject, setSubject] = useState("")
    const [week, setWeek] = useState("Week 1")
    const [level, setLevel] = useState("")
    const [classId, setClassId] = useState("")
    const [content, setContent] = useState("")

    // Sync with initialPlan when it changes (History selection or New)
    useEffect(() => {
        if (initialPlan) {
            setId(initialPlan.id)
            setTopic(initialPlan.title)
            setSubject(initialPlan.subject)
            setWeek(initialPlan.week || "Week 1")
            setClassId(initialPlan.class_id)
            setContent(initialPlan.content)

            const cls = teacherClasses.find(c => c.id === initialPlan.class_id)
            if (cls) setLevel(cls.name)
        } else {
            // New Architect mode: Clear inputs & set defaults
            setId(undefined)
            setTopic("")
            setContent("")
            if (teacherClasses.length > 0) {
                const firstClass = teacherClasses[0]
                setClassId(firstClass.id)
                setLevel(firstClass.name)
                setSubject(firstClass.subject || "General")
            }
        }
    }, [initialPlan, teacherClasses])

    const handleNew = () => {
        router.push(window.location.pathname) // Clears search params like ?id=...
    }

    // AI Generation Handler
    const handleGenerate = async () => {
        if (!topic) {
            toast.error("Please enter a topic")
            return
        }

        setLoading(true)
        const quoteIndex = Math.floor(Math.random() * QUOTES.length)
        const quote = QUOTES[quoteIndex]

        const loadToast = toast.loading(`Architecting... "${quote}"`)

        try {
            const res = await generateLessonPlanAI(topic, subject, level, week)
            if (res.success && res.content) {
                setContent(res.content)
                toast.success("Syllabus Architected Successfully!")
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
        if (!topic || !content || !classId) {
            toast.error("Missing required fields (Topic, Content, or Class)")
            return
        }

        const promise = saveLessonPlan({
            id,
            title: topic,
            content,
            subject,
            week,
            term: "1st Term",
            class_id: classId,
            is_published: published
        })

        toast.promise(promise, {
            loading: 'Saving...',
            success: () => {
                router.refresh()
                return published ? 'Lesson Published!' : 'Draft Saved!'
            },
            error: (err) => err.message || 'Failed to save'
        })
    }

    return (
        <div className="w-full flex-1 flex flex-col lg:flex-row gap-8 h-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Center Console: AI Architect (Rounded Glassmorphic Configuration Panel) */}
            <div className="w-full lg:w-[420px] shrink-0 space-y-6">
                <Card className="p-8 bg-slate-900 border-slate-800 shadow-xl relative overflow-hidden group rounded-3xl">
                    {/* Animated Gradient Glow */}
                    <div className="absolute -top-32 -left-32 w-64 h-64 bg-blue-600/10 blur-[120px] rounded-full group-hover:bg-blue-600/20 transition-colors duration-1000" />
                    <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-cyan-600/10 blur-[120px] rounded-full group-hover:bg-cyan-600/20 transition-colors duration-1000" />

                    <div className="relative space-y-8">
                        <div className="flex justify-between items-start">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-white tracking-tighter flex items-center gap-3 uppercase italic">
                                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg shadow-blue-500/20 ring-1 ring-white/10">
                                        <Sparkles className="h-5 w-5 text-white animate-pulse" />
                                    </div>
                                    Lesson Planner
                                </h3>
                                <div className="flex items-center gap-2 pl-1">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                                    <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest opacity-80">
                                        System Ready
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleNew}
                                className="h-10 w-10 border border-white/5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all rounded-xl"
                                title="Reset Configuration"
                            >
                                <Plus className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                    <Label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Core Parameters</Label>
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                </div>

                                {/* Matte-Black Inset Inputs */}
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] text-slate-400 font-bold uppercase tracking-widest ml-1">Target Class</Label>
                                        <div className="relative group/select">
                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl blur opacity-0 group-hover/select:opacity-100 transition duration-500" />
                                            <Select
                                                value={classId}
                                                onValueChange={(val) => {
                                                    setClassId(val)
                                                    const cls = teacherClasses.find(c => c.id === val)
                                                    if (cls) {
                                                        setLevel(cls.name)
                                                        if (cls.subject) setSubject(cls.subject)
                                                    }
                                                }}
                                            >
                                                <SelectTrigger className="relative bg-slate-950 border-slate-800 text-xs font-medium h-12 text-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all hover:bg-slate-800 shadow-sm">
                                                    <SelectValue placeholder="Select Target Class" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                                                    {teacherClasses.map(c => (
                                                        <SelectItem key={c.id} value={c.id} className="focus:bg-blue-600/20 focus:text-blue-200 text-xs font-medium uppercase tracking-wide">
                                                            {c.name} {c.subject ? `— ${c.subject}` : ''}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] text-slate-400 font-bold uppercase tracking-widest ml-1">Subject</Label>
                                            <div className="relative group/input">
                                                <div className="absolute inset-0 bg-blue-500/10 rounded-xl blur opacity-0 group-focus-within/input:opacity-100 transition duration-500" />
                                                <Input
                                                    className="relative bg-white/5 border-white/10 text-xs font-medium h-12 text-white rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500/80 placeholder:text-slate-500 transition-all hover:bg-white/10 shadow-inner"
                                                    value={subject}
                                                    onChange={(e) => setSubject(e.target.value)}
                                                    placeholder="MATHEMATICS"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] text-slate-400 font-bold uppercase tracking-widest ml-1">Timeline</Label>
                                            <Select value={week} onValueChange={setWeek}>
                                                <SelectTrigger className="bg-white/5 border-white/10 text-xs font-medium h-12 text-slate-200 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500/80 hover:bg-white/10 shadow-inner">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1A1D24] border-white/10 text-slate-300">
                                                    {Array.from({ length: 12 }).map((_, i) => (
                                                        <SelectItem key={i} value={`Week ${i + 1}`} className="focus:bg-blue-600/20 focus:text-blue-200 text-xs font-medium uppercase">
                                                            Week {i + 1}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <Label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Directive</Label>
                                <div className="group/input relative">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/40 to-cyan-500/40 rounded-2xl blur opacity-0 group-hover/input:opacity-100 transition duration-500" />
                                    <Input
                                        className="relative bg-slate-950 border-slate-800 text-sm py-8 px-6 text-slate-100 placeholder:text-slate-500 rounded-2xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm font-medium tracking-wide hover:bg-slate-800"
                                        placeholder="Enter lesson topic or directive..."
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-500 bg-white/10 px-2 py-1 rounded">
                                        AI-V2.4
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="w-full h-16 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 hover:from-blue-600 hover:to-blue-400 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-[0_0_40px_rgba(37,99,235,0.3)] hover:shadow-[0_0_60px_rgba(37,99,235,0.5)] transition-all duration-500 border border-white/10 active:scale-[0.98] group/btn relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                                <span className="relative z-10 flex items-center gap-4">
                                    {loading ? "GENERATING..." : (content ? "UPDATE LESSON PLAN" : "GENERATE LESSON PLAN")}
                                </span>
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Status Indicator Bar */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between group cursor-help transition-colors hover:bg-black/60">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)] animate-pulse z-10 relative" />
                            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-[10px] text-slate-300 font-mono font-bold uppercase tracking-widest">Broadcast-Synced</p>
                            <p className="text-[8px] text-slate-600 font-bold uppercase tracking-wider">Latency: 12ms</p>
                        </div>
                    </div>
                    <div className="text-[9px] font-mono text-blue-500/70 border border-blue-500/20 px-2 py-0.5 rounded bg-blue-500/5">
                        SYS V2.4.0
                    </div>
                </div>
            </div>

            {/* Right Workspace: Syllabus Lab (High-Contrast White Canvas) */}
            <div className="flex-1 flex flex-col gap-6 h-full min-w-0">
                {/* Floating Action Header */}
                <div className="flex justify-between items-center px-2">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-black text-slate-100 tracking-widest uppercase italic flex items-center gap-3">
                        </h2>
                    </div>

                    {/* Floating Action Pills */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="bg-black/40 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 hover:border-blue-500/50 rounded-full h-8 w-8 p-0 flex items-center justify-center backdrop-blur-md transition-all shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => handleSave(true)}
                            className="bg-blue-600 hover:bg-blue-500 text-white rounded-full h-8 px-6 text-[10px] font-black uppercase tracking-widest shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_50px_rgba(37,99,235,0.6)] border border-blue-400/20 transition-all active:scale-95"
                        >
                            <Save className="h-3 w-3 mr-2" />
                            Save & Publish
                        </Button>
                    </div>
                </div>

                <div className="flex-1 bg-[#F8FAFC] rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] relative flex flex-col group/editor ring-8 ring-white/5">
                    {/* Background Tech Grid Pattern (Subtle on White) */}
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-[length:40px_40px] opacity-[0.4] pointer-events-none mix-blend-multiply" />

                    {content ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6 relative z-10 transition-all duration-700">
                            {/* High-Fidelity Paper */}
                            <div className="w-full max-w-none mx-auto bg-white text-slate-900 min-h-full shadow-2xl p-6 lg:p-8 relative animate-in zoom-in-95 duration-700">
                                {/* Watermark */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none z-0 overflow-hidden">
                                    <div className="text-[200px] font-black rotate-[-35deg] whitespace-nowrap tracking-tighter uppercase italic text-slate-900">
                                        CONFIDENTIAL
                                    </div>
                                </div>

                                {/* Header */}
                                <div className="relative z-10 mb-4 border-b-4 border-black pb-2">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h1 className="text-4xl font-black text-black tracking-tighter uppercase leading-none mb-2">
                                                LESSON PLAN
                                            </h1>
                                            <div className="flex items-center gap-3">
                                                <span className="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest">
                                                    {level || 'CLASS LEVEL'}
                                                </span>
                                                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                                                    {subject || 'SUBJECT'} /// {week}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="h-16 w-16 bg-black text-white flex items-center justify-center font-black text-3xl italic">
                                            B
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 prose prose-slate max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-p:font-medium prose-p:text-slate-600">
                                    <LessonEditor content={content} onChange={setContent} editable={true} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 overflow-hidden bg-white/50 backdrop-blur-sm">
                            <div className="relative z-10 max-w-lg mx-auto text-center">
                                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-100 hover:bg-white border-2 border-slate-200 hover:border-blue-500 shadow-xl mb-8 group transition-all duration-500 cursor-default">
                                    <Sparkles className="h-10 w-10 text-slate-400 group-hover:text-blue-500 transition-colors duration-500" />
                                </div>

                                <h3 className="text-4xl font-black tracking-tight text-slate-900 mb-4 uppercase">
                                    Syllabus Lab
                                </h3>
                                <p className="text-sm text-slate-500 font-medium uppercase tracking-widest max-w-xs mx-auto leading-relaxed mb-8">
                                    Awaiting input from Center Console to initiate architecture protocol.
                                </p>

                                <div className="flex items-center justify-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const QUOTES = [
    "Education is the most powerful weapon which you can use to change the world. - Nelson Mandela",
    "The beautiful thing about learning is that no one can take it away from you. - B.B. King",
    "Teachers open the door, but you must enter by yourself. - Chinese Proverb"
]
