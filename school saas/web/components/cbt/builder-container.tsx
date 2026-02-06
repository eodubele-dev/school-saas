"use client"

import { useState } from "react"
import { SourceSelector } from "./source-selector"
import { QuizCanvas } from "./quiz-canvas"
import { ChevronLeft, Save, Rocket, Clock, Shield, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { syncAssessment, getQuiz, BankQuestion } from "@/lib/actions/cbt-builder"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface BuilderContainerProps {
    classId: string
    subjectId: string
    className?: string
    subjectName?: string
    initialQuizId?: string
    onClose?: () => void
}

export function BuilderContainer({ classId, subjectId, className, subjectName, initialQuizId, onClose }: BuilderContainerProps) {
    const router = useRouter()
    const [quizId, setQuizId] = useState<string | undefined>(initialQuizId)
    const [quizTitle, setQuizTitle] = useState("Untitled Assessment")
    const [questions, setQuestions] = useState<BankQuestion[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [duration, setDuration] = useState(60)
    const [shuffle, setShuffle] = useState(false)
    const [visibility, setVisibility] = useState<'draft' | 'published'>('draft')

    // Load Existing Draft or Specific Quiz
    useEffect(() => {
        async function loadContent() {
            setIsLoading(true)
            try {
                const res = await getQuiz(classId, subjectId, initialQuizId)

                if (res.success && res.data) {
                    const quiz = res.data
                    setQuizId(quiz.id)
                    setQuizTitle(quiz.title)
                    setDuration(quiz.duration_minutes || 60)
                    setShuffle(quiz.shuffle_mode || false)
                    setVisibility(quiz.is_active ? 'published' : 'draft')

                    if (quiz.questions) {
                        setQuestions(quiz.questions.map((q: any) => ({
                            id: q.id,
                            question_text: q.question_text,
                            options: q.options,
                            correct_option: q.correct_option,
                            explanation: q.explanation || "",
                            points: q.points || 1
                        })))
                    }
                }
            } catch (e) {
                console.error("Failed to load content", e)
            } finally {
                setIsLoading(false)
            }
        }
        loadContent()
    }, [classId, subjectId, initialQuizId])

    const addQuestions = (newQs: BankQuestion[]) => {
        setQuestions(prev => [...prev, ...newQs.map(q => ({
            ...q,
            id: q.id || crypto.randomUUID(),
            points: 1
        }))])
    }

    const removeQuestion = (id: string) => {
        setQuestions(prev => prev.filter(q => q.id !== id))
    }

    const updateQuestion = (id: string, updates: Partial<BankQuestion>) => {
        setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q))
    }

    const handleSave = async (isPublishing: boolean = false) => {
        if (!quizTitle) return toast.error("Enter a title")
        setIsSaving(true)

        const targetVisibility = isPublishing ? 'published' : visibility

        try {
            const res = await syncAssessment({
                id: quizId,
                title: quizTitle,
                class_id: classId,
                subject_id: subjectId,
                duration,
                shuffle_mode: shuffle,
                visibility: targetVisibility,
                total_marks: questions.reduce((sum, q) => sum + (q.points || 0), 0)
            }, questions)

            if (res.success) {
                setQuizId(res.quizId)
                if (isPublishing) {
                    setVisibility('published')
                    toast.success("Assessment Published Successfully", {
                        description: "Your quiz is now live for all students in this class."
                    })
                    // Clear the page/Close builder after publish as requested
                    setTimeout(() => {
                        onClose?.()
                    }, 1500)
                } else {
                    toast.success("Draft Revision Saved")
                }
                router.refresh()
            } else {
                toast.error(res.error || "Failed to save")
            }
        } catch {
            toast.error("An unexpected error occurred")
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] text-slate-500 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="animate-pulse font-medium">Checking for existing drafts...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-700 bg-slate-950 text-white p-4 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
            {/* Context Breadcrumb */}
            <div className="px-4 -mb-4 flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Targeting: <span className="text-blue-400">{className || "Current Class"}</span>
                <span className="mx-1 opacity-20">|</span>
                Subject: <span className="text-blue-400">{subjectName || "Current Subject"}</span>
                <span className="ml-auto text-slate-600 italic">Work is saved to this specific context</span>
            </div>

            {/* Top Bar */}
            <div className="flex items-center justify-between bg-slate-900/40 backdrop-blur-md p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-4 flex-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-slate-500 hover:text-white"
                        onClick={() => onClose?.()}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="space-y-0.5 max-w-md w-full">
                        <Input
                            value={quizTitle}
                            onChange={(e) => setQuizTitle(e.target.value)}
                            className="bg-transparent border-none text-xl font-serif font-bold text-white p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                            placeholder="Type Assessment Title..."
                        />
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-[hsl(var(--school-accent))]" />
                                <Input
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(parseInt(e.target.value))}
                                    className="w-12 h-4 p-0 bg-transparent border-none text-[10px] font-bold focus-visible:ring-0"
                                />
                                Mins
                            </span>
                            <span className="flex items-center gap-1 border-l border-white/10 pl-3">
                                <Shield className="h-3 w-3 text-emerald-400" /> {questions.length} Questions
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-4 mr-6 px-6 border-r border-white/5">
                        <div className="flex items-center gap-2">
                            <Label className="text-xs text-slate-400 font-medium">Shuffle</Label>
                            <Switch
                                checked={shuffle}
                                onCheckedChange={setShuffle}
                                className="bg-slate-700 data-[state=checked]:bg-blue-600 border-transparent data-[state=unchecked]:opacity-50"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Label className="text-xs text-slate-400 font-medium">Live</Label>
                            <Switch
                                checked={visibility === 'published'}
                                onCheckedChange={(val) => setVisibility(val ? 'published' : 'draft')}
                                className="bg-slate-700 data-[state=checked]:bg-emerald-500 border-transparent data-[state=unchecked]:opacity-50"
                            />
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        className="border-white/10 bg-white/5 text-slate-300 gap-2 font-bold"
                        onClick={() => handleSave(false)}
                        disabled={isSaving}
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Revision
                    </Button>
                    <Button
                        className="bg-blue-600 hover:bg-blue-600 text-white gap-2 font-bold shadow-lg shadow-blue-500/20"
                        onClick={() => handleSave(true)}
                        disabled={isSaving}
                    >
                        <Rocket className="h-4 w-4" />
                        Publish
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex gap-4 md:gap-6 overflow-hidden min-h-0">
                {/* Left Sidebar: Source Selection */}
                <div className="w-64 md:w-80 flex-shrink-0 h-full overflow-y-auto">
                    <SourceSelector onAddQuestions={addQuestions} />
                </div>

                {/* Center: Canvas */}
                <div className="flex-1 min-w-0 h-full overflow-hidden">
                    <QuizCanvas
                        questions={questions}
                        onRemove={removeQuestion}
                        onUpdate={updateQuestion}
                        onReorder={setQuestions}
                    />
                </div>
            </div>
        </div>
    )
}
