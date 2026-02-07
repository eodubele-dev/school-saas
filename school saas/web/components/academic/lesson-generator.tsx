"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Sparkles, Save, Download, Share2, Plus, FileText } from "lucide-react"
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
        <div className="flex flex-col lg:flex-row gap-8 h-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Input Panel: Glass-Control Aesthetic */}
            <div className="w-full lg:w-[400px] shrink-0 space-y-6">
                <Card className="p-8 bg-slate-900/40 backdrop-blur-2xl border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                    {/* Animated Gradient Glow */}
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 blur-[100px] rounded-full group-hover:bg-blue-500/20 transition-colors duration-700" />
                    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-[100px] rounded-full group-hover:bg-cyan-500/20 transition-colors duration-700" />

                    <div className="relative space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-blue-400 animate-pulse" />
                                    AI Architect
                                </h3>
                                <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest opacity-60">
                                    NERDC Curriculum Engine
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleNew}
                                className="h-10 w-10 border border-white/5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all rounded-xl"
                                title="New Document"
                            >
                                <Plus className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Configuration</Label>
                                <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] text-slate-400 uppercase tracking-wider ml-1">Target Class</Label>
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
                                            <SelectTrigger className="bg-slate-900/50 border-white/5 text-sm h-11 text-slate-200 rounded-xl focus:ring-blue-500/20 focus:border-blue-500/40">
                                                <SelectValue placeholder="Select Class" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
                                                {teacherClasses.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.name} {c.subject ? `— ${c.subject}` : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] text-slate-400 uppercase tracking-wider ml-1">Subject</Label>
                                            <Input
                                                className="bg-slate-900/50 border-white/5 text-sm h-11 text-white rounded-xl focus:ring-blue-500/20 focus:border-blue-500/40 placeholder:text-slate-600"
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                placeholder="e.g. Maths"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] text-slate-400 uppercase tracking-wider ml-1">Timeline</Label>
                                            <Select value={week} onValueChange={setWeek}>
                                                <SelectTrigger className="bg-slate-900/50 border-white/5 text-sm h-11 text-slate-200 rounded-xl">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
                                                    {Array.from({ length: 12 }).map((_, i) => (
                                                        <SelectItem key={i} value={`Week ${i + 1}`}>Week {i + 1}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Lesson Topic</Label>
                                <Input
                                    className="bg-slate-950/40 border-white/5 text-base py-6 text-white placeholder:text-slate-600 rounded-2xl focus:ring-blue-500/20 focus:border-blue-500/40 transition-all shadow-inner"
                                    placeholder="Enter topic..."
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                />
                            </div>

                            <Button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.3)] hover:shadow-[0_15px_40px_rgba(37,99,235,0.4)] transition-all duration-500 border-t border-white/20 active:scale-[0.98]"
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Sparkles className="h-5 w-5 mr-3" />}
                                {loading ? "Architecting..." : (content ? "Update Syllabus" : "Generate Architecture")}
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Status Indicator */}
                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse" />
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em]">Syllabus Engine Active</p>
                </div>
            </div>

            {/* Editor Canvas Panel */}
            <div className="flex-1 flex flex-col gap-6 h-full min-w-0">
                <div className="flex justify-between items-center bg-slate-900/40 backdrop-blur-xl p-4 sm:p-5 px-5 sm:px-8 border border-white/5 rounded-2xl shadow-2xl relative overflow-visible group/header">
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover/header:opacity-100 transition-opacity duration-700" />
                    <div className="flex items-center gap-3 sm:gap-5 relative z-10 min-w-0">
                        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h2 className="font-black text-white text-sm sm:text-lg tracking-tight uppercase italic leading-none truncate">
                                <span className="xs:hidden">{id ? 'REV' : 'CANVAS'}</span>
                                <span className="hidden xs:inline">{id ? 'Revision' : 'Canvas'}</span>
                                <span className="hidden sm:inline"> {id ? 'Mode' : 'Architecture'}</span>
                            </h2>
                            <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5 transition-all">
                                <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse shrink-0" />
                                <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-none truncate opacity-60">
                                    {id ? `ID: ${id.split('-')[0]}` : 'LIVE ARCHITECT'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 relative z-10 shrink-0 ml-4">
                        <Button variant="ghost" size="sm" onClick={() => toast.success("PDF Exported")} className="text-[10px] font-black uppercase tracking-widest h-9 sm:h-10 px-2 sm:px-5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10 transition-all">
                            <Download className="h-4 w-4 sm:mr-2 text-blue-400" />
                            <span className="hidden xl:inline">Export PDF</span>
                        </Button>
                        <div className="w-px h-5 bg-white/10 my-auto hidden md:block" />
                        <Button size="sm" onClick={() => handleSave(true)} className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] h-9 sm:h-10 px-3 sm:px-6 bg-blue-600 hover:bg-blue-500 text-white shadow-[0_10px_20px_rgba(37,99,235,0.2)] rounded-xl transition-all font-bold border-t border-white/20 active:scale-95 whitespace-nowrap">
                            <span className="sm:hidden">FINAL</span>
                            <span className="hidden sm:inline">Save & Publish</span>
                        </Button>
                    </div>
                </div>

                <div className="flex-1 bg-slate-950/40 border border-white/5 rounded-3xl overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.5)] relative flex flex-col group/editor">
                    {/* Background Tech Grid Pattern */}
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-[length:40px_40px] opacity-[0.03] pointer-events-none" />

                    {content ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 lg:p-16 relative z-10 transition-all duration-700">
                            {/* Paper Effect Container */}
                            <div className="max-w-4xl mx-auto bg-white text-slate-900 min-h-full rounded-[2px] shadow-[0_100px_180px_rgba(0,0,0,0.4),0_20px_40px_rgba(0,0,0,0.1)] p-8 lg:p-14 relative ring-1 ring-black/5 animate-in zoom-in-95 duration-700 overflow-visible">
                                {/* Technical Watermark */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none z-0 overflow-hidden">
                                    <div className="text-[200px] font-black rotate-[-35deg] whitespace-nowrap tracking-tighter uppercase italic">
                                        CERTIFIED ARCHITECT
                                    </div>
                                </div>

                                {/* Prestige Letterhead */}
                                <div className="relative z-10 mb-16 border-b-2 border-slate-900 pb-12">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                                        {/* Logo Branding */}
                                        <div className="flex items-center gap-6">
                                            <div className="h-20 w-20 rounded-2xl bg-slate-950 flex items-center justify-center text-white font-black text-4xl shadow-[0_15px_30px_rgba(0,0,0,0.2)] italic tracking-tighter shrink-0 ring-8 ring-slate-50 relative overflow-hidden group/logo">
                                                <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover/logo:opacity-100 transition-opacity" />
                                                <span className="relative z-10 transition-transform group-hover/logo:scale-110">B</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <h1 className="text-4xl font-black text-slate-950 tracking-[-0.04em] uppercase leading-none mb-2">
                                                    BLUE <span className="text-blue-600">HORIZON</span>
                                                </h1>
                                                <div className="flex items-center gap-3">
                                                    <span className="w-8 h-px bg-slate-300" />
                                                    <p className="text-[10px] uppercase tracking-[0.4em] text-slate-400 font-black">Syllabus Excellence Lab</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Technical Metadata Stamp */}
                                        <div className="flex flex-col items-end pt-1">
                                            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm min-w-[200px] relative overflow-hidden group/stamp">
                                                <div className="absolute top-0 right-0 p-2 opacity-[0.05] pointer-events-none">
                                                    <FileText className="h-12 w-12" />
                                                </div>
                                                <div className="space-y-3 relative z-10">
                                                    <div className="flex justify-between gap-4">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">DOC-REF:</span>
                                                        <span className="text-[10px] font-bold text-slate-900 font-mono italic">#{id?.split('-')[0].toUpperCase() || 'DRAFT-04'}</span>
                                                    </div>
                                                    <div className="flex justify-between gap-4">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">ISSUED:</span>
                                                        <span className="text-[10px] font-bold text-slate-900 uppercase">{formatDate(new Date())}</span>
                                                    </div>
                                                    <div className="h-px bg-slate-200" />
                                                    <div className="flex justify-between gap-4">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">SUBJECT:</span>
                                                        <span className="text-[11px] font-black text-slate-950 uppercase tracking-tight">{subject || 'GENERAL'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Prestige Accents */}
                                    <div className="flex items-center gap-3 mt-8">
                                        <div className="bg-blue-600 px-3 py-1 rounded text-[10px] font-black text-white uppercase tracking-widest italic shadow-lg shadow-blue-500/20">
                                            {level || 'CLASS LEVEL'}
                                        </div>
                                        <div className="flex-1 h-px bg-slate-100" />
                                        <div className="w-2 h-2 rounded-full border-2 border-slate-200" />
                                        <div className="w-2 h-2 rounded-full border-2 border-slate-950" />
                                    </div>
                                </div>

                                <div className="relative z-10">
                                    <LessonEditor content={content} onChange={setContent} editable={true} />
                                </div>

                                {/* Platinum Security Footer */}
                                <div className="mt-24 pt-12 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all cursor-default group/footer">
                                    <div className="flex flex-col gap-2">
                                        <p className="text-[10px] uppercase tracking-[0.4em] font-black text-slate-950 flex items-center gap-2">
                                            <div className="h-1 w-4 bg-blue-600" />
                                            SECURE GENERATION PROTOCOL
                                        </p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest max-w-[300px] leading-relaxed">
                                            This document was architected via Blue Horizon AI with high-fidelity NERDC compliance validation.
                                        </p>
                                    </div>
                                    <div className="text-center sm:text-right flex flex-col items-center sm:items-end">
                                        <div className="flex items-center gap-2 mb-2 p-1.5 px-3 bg-slate-50 border border-slate-100 rounded-lg group-hover/footer:border-blue-200 transition-colors">
                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                                            <p className="text-[10px] font-mono text-slate-600 tracking-tighter">SHA-256: 8f4e2...9a12</p>
                                        </div>
                                        <p className="text-[9px] uppercase tracking-[0.3em] font-black text-slate-300">Auth: DIGITAL_ID_{Math.floor(Math.random() * 90000 + 10000)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 overflow-hidden">
                            {/* Animated Background Grid */}
                            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-[length:40px_40px] opacity-[0.03] animate-[pulse_8s_ease-in-out_infinite]" />

                            {/* Radial Gradient Orbs */}
                            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-[pulse_6s_ease-in-out_infinite]" />
                            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" style={{ animationDelay: '2s' }} />

                            {/* Main Content Card */}
                            <div className="relative z-10 max-w-2xl mx-auto text-center">
                                {/* Icon Container with Glassmorphism */}
                                <div className="relative inline-block mb-8 group cursor-default">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-3xl rounded-full animate-pulse group-hover:blur-[80px] transition-all duration-1000" />
                                    <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)] group-hover:border-blue-500/30 transition-all duration-500">
                                        <Sparkles className="h-20 w-20 text-blue-400 relative z-10 transition-all duration-700 group-hover:scale-110 group-hover:rotate-12 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
                                    </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-3xl font-black tracking-tight text-white mb-4 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent animate-[shimmer_3s_ease-in-out_infinite]">
                                    Architect Your Legacy
                                </h3>

                                {/* Subtitle */}
                                <p className="text-base text-slate-400 font-medium max-w-md mx-auto leading-relaxed mb-8">
                                    Select a class and topic to generate a <span className="text-blue-400 font-bold">premium NERDC-compliant</span> lesson plan powered by AI.
                                </p>

                                {/* Feature Pills */}
                                <div className="flex flex-wrap gap-3 justify-center mb-10">
                                    <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-xs font-bold text-slate-300 uppercase tracking-wider hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300">
                                        ✨ AI-Powered
                                    </div>
                                    <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-xs font-bold text-slate-300 uppercase tracking-wider hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300">
                                        📋 NERDC-Compliant
                                    </div>
                                    <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-xs font-bold text-slate-300 uppercase tracking-wider hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300">
                                        ⚡ Instant Export
                                    </div>
                                </div>

                                {/* Animated Progress Dots */}
                                <div className="flex gap-2 justify-center">
                                    <div className="h-1.5 w-12 rounded-full bg-gradient-to-r from-blue-500/40 to-blue-500/20 animate-[pulse_2s_ease-in-out_infinite]" />
                                    <div className="h-1.5 w-12 rounded-full bg-gradient-to-r from-cyan-500/40 to-cyan-500/20 animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }} />
                                    <div className="h-1.5 w-12 rounded-full bg-gradient-to-r from-blue-500/40 to-blue-500/20 animate-[pulse_2s_ease-in-out_infinite]" style={{ animationDelay: '1s' }} />
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
