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
        if (!newQs || !Array.isArray(newQs)) return
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
        if (isPublishing && questions.length === 0) {
            return toast.error("Cannot publish an empty assessment", {
                description: "Add at least one question before making this quiz live."
            })
        }
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
            <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="animate-pulse font-medium">Checking for existing drafts...</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col lg:h-[calc(100vh-140px)] gap-4 md:gap-6 animate-in fade-in duration-700 bg-slate-950 text-foreground p-3 md:p-4 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
            {/* Context Breadcrumb - Swipeable on mobile */}
            <div className="w-full overflow-x-auto scrollbar-hide px-4 -mb-4 whitespace-nowrap">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold min-w-max pb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
                    Targeting: <span className="text-blue-400">{className || "Current Class"}</span>
                    <span className="mx-1 opacity-20">|</span>
                    Subject: <span className="text-blue-400">{subjectName || "Current Subject"}</span>
                    <span className="ml-4 text-slate-600 italic hidden sm:inline">Work is saved to this specific context</span>
                </div>
            </div>

            {/* Top Bar - Responsive Grid */}
            <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#1e293b]/50 backdrop-blur-md p-4 rounded-2xl border border-white/5 gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-white hover:bg-white/5 shrink-0"
                        onClick={() => onClose?.()}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="space-y-1 flex-1 min-w-0">
                        <Input
                            value={quizTitle}
                            onChange={(e) => setQuizTitle(e.target.value)}
                            className="bg-transparent border-none text-lg md:text-xl font-serif font-bold text-white p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 truncate"
                            placeholder="Assessment Title..."
                        />
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 uppercase tracking-widest font-black">
                            <span className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-white/5">
                                <Clock className="h-3 w-3 text-blue-400" />
                                <Input
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(parseInt(e.target.value))}
                                    className="w-8 h-4 p-0 bg-transparent border-none text-[10px] font-black focus-visible:ring-0"
                                />
                                Mins
                            </span>
                            <span className="flex items-center gap-1 border-l border-white/10 pl-3">
                                <Shield className="h-3 w-3 text-emerald-400" /> {questions.length} Questions
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-2 md:gap-3 border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                    <div className="flex items-center gap-3 md:mr-4 md:pr-4 md:border-r md:border-white/10">
                        <div className="flex items-center gap-2">
                            <Label className="text-[10px] text-slate-500 font-bold uppercase">Shuffle</Label>
                            <Switch
                                checked={shuffle}
                                onCheckedChange={setShuffle}
                                className="scale-75 md:scale-100 data-[state=checked]:bg-blue-600"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Label className="text-[10px] text-slate-500 font-bold uppercase">Live</Label>
                            <Switch
                                checked={visibility === 'published'}
                                onCheckedChange={(val) => setVisibility(val ? 'published' : 'draft')}
                                className="scale-75 md:scale-100 data-[state=checked]:bg-emerald-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-white/10 bg-white/5 text-slate-300 gap-1.5 font-bold h-9 md:h-10 px-3 md:px-4"
                            onClick={() => handleSave(false)}
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            <span className="hidden xs:inline">Save</span>
                        </Button>
                        <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-500 text-white gap-1.5 font-bold shadow-lg shadow-blue-500/20 h-9 md:h-10 px-3 md:px-4"
                            onClick={() => handleSave(true)}
                            disabled={isSaving}
                        >
                            <Rocket className="h-4 w-4" />
                            <span>Publish</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content Area - Stacked on mobile */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 md:gap-6 overflow-hidden min-h-0">
                {/* Left Sidebar: Source Selection */}
                <div className="w-full lg:w-80 flex-shrink-0 h-[280px] lg:h-full overflow-y-auto bg-[#0a0a0a]/50 rounded-2xl border border-white/5 p-1">
                    <SourceSelector onAddQuestions={addQuestions} />
                </div>

                {/* Center: Canvas */}
                <div className="flex-1 min-w-0 h-full overflow-hidden bg-[#0a0a0a]/30 rounded-2xl border border-white/5">
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
