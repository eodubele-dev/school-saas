"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Sparkles, Save, Download, Share2, Plus, FileText, Activity, Zap, BookOpen, CheckCircle2 } from "lucide-react"
import { LessonEditor } from "./lesson-editor"
import { saveLessonPlan, LessonPlan } from "@/lib/actions/lesson-plan"
import { createLesson } from "@/lib/actions/teacher-lesson-publisher"
import { generateLessonPlanAI } from "@/lib/actions/google-ai"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface LessonGeneratorProps {
    initialPlan?: LessonPlan | null
    teacherClasses?: any[]
}

export function LessonGenerator({ initialPlan, teacherClasses = [] }: LessonGeneratorProps) {
    // Custom styles for the lesson content to ensure "ready-for-students" spacing
    const contentStyles = `
        .lesson-content h1 { font-size: 2.25rem; font-weight: 800; margin-bottom: 2rem; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem; }
        .lesson-content h2 { font-size: 1.5rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1.25rem; color: #1e293b; border-left: 4px solid #3b82f6; padding-left: 1rem; }
        .lesson-content h3 { font-size: 1.25rem; font-weight: 600; margin-top: 2rem; margin-bottom: 0.75rem; color: #334155; }
        .lesson-content p { margin-bottom: 1.5rem; line-height: 1.8; color: #475569; }
        .lesson-content ul, .lesson-content ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
        .lesson-content li { margin-bottom: 0.75rem; line-height: 1.6; }
        .lesson-content table { width: 100%; border-collapse: collapse; margin: 2rem 0; border: 1px solid #e2e8f0; }
        .lesson-content th { background: #f8fafc; padding: 12px; text-align: left; border: 1px solid #e2e8f0; font-weight: 600; }
        .lesson-content td { padding: 12px; border: 1px solid #e2e8f0; }
        .lesson-content hr { margin: 3rem 0; border: 0; border-top: 1px solid #e2e8f0; }
    `

    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [id, setId] = useState<string | undefined>(undefined)
    const [topic, setTopic] = useState("")
    const [subject, setSubject] = useState("")
    const [week, setWeek] = useState("Week 1")
    const [level, setLevel] = useState("")
    const [classId, setClassId] = useState("")
    const [content, setContent] = useState("")
    const [type, setType] = useState<"lesson_plan" | "lesson_note">("lesson_plan")
    const [isPublished, setIsPublished] = useState(false)

    // Sync with initialPlan when it changes (History selection or New)
    useEffect(() => {
        if (initialPlan) {
            setId(initialPlan.id)
            setTopic(initialPlan.title)
            setSubject(initialPlan.subject)
            setWeek(initialPlan.week || "Week 1")
            setClassId(initialPlan.class_id)
            setContent(initialPlan.content)
            setType(initialPlan.type || "lesson_plan")
            setIsPublished(initialPlan.is_published || false)

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
            setType("lesson_plan")
            setIsPublished(false)
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

        const loadToast = toast.loading(`Architecting ${type === 'lesson_plan' ? 'Plan' : 'Note'}... "${quote}"`)

        try {
            const res = await generateLessonPlanAI(topic, subject, level, week, type)
            if (res.success && res.content) {
                setContent(res.content)
                toast.success("Syllabus Architected Successfully!")
            } else {
                toast.error(res.error || "Failed to generate content")
            }
        } catch (e: any) {
            toast.error(`AI Error: ${e.message || "Unknown error"}`)
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

        // 1. LESSON NOTE -> Student Locker (Public)
        // 1. LESSON NOTE -> Student Locker (Public)
        if (type === 'lesson_note') {
            // LESSON NOTE -> Teacher Archive (Pending Approval)
            // Ideally, notes should be approved before students see them.
            const archivePromise = saveLessonPlan({
                id,
                title: topic,
                content,
                subject,
                week,
                term: "1st Term", // This should be dynamic based on session
                class_id: classId,
                is_published: true, // Saved as "done" from editing perspective
                approval_status: 'pending', // MUST go to admin
                type: 'lesson_note'
            })

            toast.promise(archivePromise, {
                loading: 'Submitting Note for Approval...',
                success: () => {
                    router.refresh()
                    setIsPublished(true)
                    return 'Lesson Note Submitted for Admin Review!'
                },
                error: (err: any) => err.message || 'Failed to submit'
            })
            return
        }

        // 2. LESSON PLAN -> Teacher Archive (Private)
        const promise = saveLessonPlan({
            id,
            title: topic,
            content,
            subject,
            week,
            term: "1st Term",
            class_id: classId,
            is_published: published,
            type: type
        })

        toast.promise(promise, {
            loading: 'Archiving Plan...',
            success: () => {
                router.refresh()
                setIsPublished(true) // Ensure it marks as published/saved
                return published ? 'Lesson Plan Updated!' : 'Draft Saved!'
            },
            error: (err) => err.message || 'Failed to save'
        })
    }

    return (
        <div className="w-full flex-1 flex flex-col h-full animate-in fade-in duration-700 bg-slate-950">
            {/* Header / Top Bar */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-slate-950 shrink-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg shadow-blue-500/20">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-white">Gemini Teacher Assistant</h2>
                        <p className="text-xs text-slate-400">Powered by Google Generative AI</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Persistent Status Badge in Header */}
                    {initialPlan?.approval_status === 'approved' && (
                        <div className="bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-xs font-semibold text-green-400">Approved</span>
                        </div>
                    )}
                    {initialPlan?.approval_status === 'rejected' && (
                        <div className="bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full flex items-center gap-2" title={initialPlan.rejection_reason}>
                            <Activity className="w-3.5 h-3.5 text-red-500" />
                            <span className="text-xs font-semibold text-red-400">Changes Requested</span>
                        </div>
                    )}
                    {initialPlan?.approval_status === 'pending' && (
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full flex items-center gap-2">
                                <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                                <span className="text-xs font-semibold text-blue-400">In Review</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.refresh()}
                                className="h-8 w-8 p-0 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
                                title="Refresh Status"
                            >
                                <Zap className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {content && (
                        <>
                            <Button variant="outline" size="sm" onClick={handleNew} className="border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white">
                                <Plus className="h-4 w-4 mr-2" /> New Chat
                            </Button>
                            <Button
                                size="sm"
                                className={
                                    type === 'lesson_note'
                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                        : "bg-blue-600 hover:bg-blue-700 text-white"
                                }
                                onClick={() => handleSave(true)}
                            >
                                {isPublished ? (
                                    type === 'lesson_note'
                                        ? <><CheckCircle2 className="h-4 w-4 mr-2" /> Update Note</>
                                        : <><Save className="h-4 w-4 mr-2" /> Update Archive</>
                                ) : type === 'lesson_note' ? (
                                    <><Share2 className="h-4 w-4 mr-2" /> Submit for Review</>
                                ) : (
                                    <><Save className="h-4 w-4 mr-2" /> Save to Archive</>
                                )}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Status Banner Removed - Moved to Header */}

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative flex flex-col">

                {/* Chat/Content View */}
                {!content ? (
                    // Empty State / Input View
                    <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-3xl mx-auto w-full">
                        <div className="mb-8 text-center space-y-2">
                            <h1 className="text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                Hello, Teacher.
                            </h1>
                            <h2 className="text-2xl text-slate-500 font-light">
                                What would you like to teach today?
                            </h2>
                        </div>

                        {/* Input Box */}
                        <Card className="w-full p-2 rounded-2xl shadow-2xl shadow-black/50 border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium text-slate-400">Target Class</Label>
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
                                            <SelectTrigger className="border-0 bg-slate-900/50 focus:ring-0 rounded-xl h-10 text-white">
                                                <SelectValue placeholder="Select Class" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {teacherClasses.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium text-slate-400">Subject</Label>
                                        <Input
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            className="border-0 bg-slate-900/50 focus-visible:ring-0 rounded-xl h-10 text-white placeholder:text-slate-500"
                                            placeholder="Subject..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium text-slate-400">Timeline</Label>
                                        <Select value={week} onValueChange={setWeek}>
                                            <SelectTrigger className="border-0 bg-slate-900/50 focus:ring-0 rounded-xl h-10 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 12 }).map((_, i) => (
                                                    <SelectItem key={i} value={`Week ${i + 1}`}>Week {i + 1}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-medium text-slate-400">Mode</Label>
                                        <Select value={type} onValueChange={(val: any) => setType(val)}>
                                            <SelectTrigger className="border-0 bg-slate-900/50 focus:ring-0 rounded-xl h-10 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="lesson_plan">Lesson Plan</SelectItem>
                                                <SelectItem value="lesson_note">Lesson Note</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="relative">
                                    <Input
                                        className="w-full text-lg p-4 h-16 rounded-xl border-white/10 bg-slate-900/50 text-white focus-visible:ring-blue-500 pr-14 placeholder:text-slate-500"
                                        placeholder="Enter a topic or description (e.g., 'Photosynthesis and its importance')"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                                    />
                                    <Button
                                        size="icon"
                                        className="absolute right-2 top-2 h-12 w-12 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all disabled:opacity-50"
                                        onClick={handleGenerate}
                                        disabled={loading || !topic}
                                    >
                                        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Zap className="h-6 w-6" />}
                                    </Button>
                                </div>
                            </div>
                            <div className="px-4 pb-2 text-[10px] text-slate-500 flex justify-between">
                                <span>Press Enter to generate</span>
                                <span>Gemini 1.5 Flash</span>
                            </div>
                        </Card>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                            {['Motion in Physics', 'Quadratic Equations', 'History of Nigeria'].map((suggestion) => (
                                <button
                                    key={suggestion}
                                    className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left transition-colors group"
                                    onClick={() => setTopic(suggestion)}
                                >
                                    <h3 className="font-medium text-slate-300 text-sm group-hover:text-blue-400">{suggestion}</h3>
                                    <p className="text-xs text-slate-500 mt-1">Generate a lesson...</p>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-950 p-4 md:p-8">
                        <style>{contentStyles}</style>
                        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-slate-200 min-h-full flex flex-col overflow-hidden">
                            {/* Document Header */}
                            <div className="border-b pb-6 mb-8 p-6 md:p-14">
                                <h1 className={`text-3xl font-bold mb-2 uppercase tracking-tight ${type === 'lesson_note' ? 'text-emerald-900' : 'text-slate-900'
                                    }`}>
                                    {type === 'lesson_plan' ? 'Lesson Plan' : 'Lesson Note'}
                                </h1>
                                <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-mono">
                                    <span className="bg-slate-100 px-2 py-1 rounded">{level || 'Class'}</span>
                                    <span className="bg-slate-100 px-2 py-1 rounded">{subject || 'Subject'}</span>
                                    <span className="bg-slate-100 px-2 py-1 rounded">{week}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-6 md:p-14 lesson-content">
                                <LessonEditor content={content} onChange={setContent} editable={true} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

const QUOTES = [
    "Education is the most powerful weapon which you can use to change the world. - Nelson Mandela",
    "The beautiful thing about learning is that no one can take it away from you. - B.B. King",
    "Teachers open the door, but you must enter by yourself. - Chinese Proverb"
]
