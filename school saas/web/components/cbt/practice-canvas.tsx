"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
    ChevronLeft, 
    ChevronRight, 
    CheckCircle2, 
    XCircle, 
    Sparkles, 
    Loader2, 
    RotateCcw, 
    Trophy,
    BookOpen
} from "lucide-react"
import { getAIExplanation, submitPracticeResults } from "@/lib/actions/cbt-practice"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function PracticeCanvas({ 
    questions, 
    sessionId, 
    metadata,
    onExit 
}: { 
    questions: any[], 
    sessionId: string | null,
    metadata: { subject: string, examType: string, year: string },
    onExit: () => void 
}) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [userAnswers, setUserAnswers] = useState<Record<number, number>>({})
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [explaining, setExplaining] = useState<number | null>(null)
    const [explanations, setExplanations] = useState<Record<number, string>>({})
    const [showInstantFeedback, setShowInstantFeedback] = useState(true)

    const currentQuestion = questions[currentIndex]
    const selectedOption = userAnswers[currentIndex]
    const hasAnswered = selectedOption !== undefined
    const isCorrect = selectedOption === currentQuestion.correct_option

    const progress = ((currentIndex + 1) / questions.length) * 100

    const handleOptionSelect = (optionIndex: number) => {
        if (isSubmitted) return
        setUserAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }))
    }

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1)
        }
    }

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1)
        }
    }

    const handleExplain = async () => {
        if (explanations[currentIndex]) return
        
        try {
            setExplaining(currentIndex)
            const res = await getAIExplanation(
                currentQuestion.question_text,
                currentQuestion.options,
                currentQuestion.options[currentQuestion.correct_option]
            )
            
            if (res.success && res.data) {
                setExplanations(prev => ({ ...prev, [currentIndex]: res.data }))
            } else {
                toast.error(res.error || "AI could not generate explanation")
            }
        } catch (error) {
            console.error("AI Explanation error:", error)
            toast.error("Network error: Failed to get AI explanation")
        } finally {
            setExplaining(null)
        }
    }

    const handleSubmit = async () => {
        const score = questions.reduce((acc, q, idx) => {
            return acc + (userAnswers[idx] === q.correct_option ? 1 : 0)
        }, 0)

        try {
            setIsSubmitted(true)
            
            if (sessionId) {
                const answersArray = questions.map((q, idx) => ({
                    question_id: q.id,
                    selected: userAnswers[idx],
                    is_correct: userAnswers[idx] === q.correct_option
                }))
                await submitPracticeResults(sessionId, score, answersArray)
            }
            
            toast.success("Practice session completed!")
        } catch (error) {
            console.error("Submit results error:", error)
            toast.error("Network error: Results were not saved, but you can see your score here.")
        }
    }

    if (isSubmitted) {
        const score = questions.reduce((acc, q, idx) => acc + (userAnswers[idx] === q.correct_option ? 1 : 0), 0)
        const percentage = Math.round((score / questions.length) * 100)

        return (
            <Card className="bg-slate-900 border-white/5 p-12 text-center space-y-8 animate-in zoom-in duration-500">
                <div className="flex justify-center">
                    <div className="p-6 bg-cyan-500/10 rounded-full border border-cyan-500/20">
                        <Trophy size={64} className="text-cyan-400 animate-bounce" />
                    </div>
                </div>
                
                <div className="space-y-2">
                    <h2 className="text-4xl font-black text-white">Session Summary</h2>
                    <p className="text-slate-400 uppercase tracking-widest text-xs font-bold">
                        {metadata.examType} {metadata.subject} • {metadata.year}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                    <div className="bg-slate-950 p-6 rounded-2xl border border-white/5">
                        <p className="text-3xl font-black text-white">{score}/{questions.length}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Total Score</p>
                    </div>
                    <div className="bg-slate-950 p-6 rounded-2xl border border-white/5">
                        <p className="text-3xl font-black text-cyan-400">{percentage}%</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Accuracy</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button 
                        onClick={() => {
                            setIsSubmitted(false)
                            setCurrentIndex(0)
                            setUserAnswers({})
                            setExplanations({})
                        }}
                        variant="outline" 
                        className="border-white/10 hover:bg-white/5 text-white h-12"
                    >
                        <RotateCcw size={16} className="mr-2" />
                        Restart Practice
                    </Button>
                    <Button 
                        onClick={onExit}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white h-12"
                    >
                        Return to Hub
                    </Button>
                </div>
            </Card>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-700">
            {/* Header / Nav */}
            <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <Button onClick={onExit} variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                        <ChevronLeft size={24} />
                    </Button>
                    <div>
                        <h3 className="text-sm font-bold text-white">{metadata.subject}</h3>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
                            {metadata.examType} {metadata.year} • Question {currentIndex + 1} of {questions.length}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-3 py-1">
                        Practice Mode
                    </Badge>
                </div>
            </div>

            <Progress value={progress} className="h-1.5 bg-slate-900" indicatorClassName="bg-cyan-500 transition-all duration-500" />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
                {/* Question Area */}
                <Card className="bg-slate-900/40 border-white/5 p-8 space-y-8 min-h-[400px]">
                    <div className="space-y-4">
                        <Badge className="bg-slate-800 text-slate-400 border-none px-3">Q{currentIndex + 1}</Badge>
                        <h2 className="text-xl md:text-2xl font-medium text-white leading-relaxed">
                            {currentQuestion.question_text}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {currentQuestion.options.map((option: string, idx: number) => {
                            const isSelected = selectedOption === idx
                            const isAnswerKey = idx === currentQuestion.correct_option
                            const showSuccess = (showInstantFeedback && hasAnswered && isAnswerKey) || (isSubmitted && isAnswerKey)
                            const showDanger = (showInstantFeedback && hasAnswered && isSelected && !isCorrect)

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionSelect(idx)}
                                    disabled={isSubmitted || (showInstantFeedback && hasAnswered)}
                                    className={cn(
                                        "w-full p-4 rounded-xl text-left border transition-all duration-200 flex items-center justify-between group",
                                        isSelected 
                                            ? "bg-cyan-500/10 border-cyan-500/50 text-white" 
                                            : "bg-slate-950/50 border-white/5 text-slate-400 hover:border-white/20 hover:bg-slate-950",
                                        showSuccess && "bg-emerald-500/20 border-emerald-500/50 text-emerald-400",
                                        showDanger && "bg-rose-500/20 border-rose-500/50 text-rose-400"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border",
                                            isSelected ? "bg-cyan-500 text-white border-cyan-400" : "bg-slate-900 border-white/10"
                                        )}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className="text-sm md:text-base">{option}</span>
                                    </div>
                                    
                                    {showSuccess && <CheckCircle2 size={20} className="text-emerald-400" />}
                                    {showDanger && <XCircle size={20} className="text-rose-400" />}
                                </button>
                            )
                        })}
                    </div>
                </Card>

                {/* Sidebar / Info */}
                <div className="space-y-6">
                    {/* AI Explanation Card */}
                    {(showInstantFeedback && hasAnswered) && (
                        <Card className="bg-slate-900 border-cyan-500/20 p-6 space-y-4 animate-in slide-in-from-right-4">
                            <div className="flex items-center gap-2 text-cyan-400">
                                <Sparkles size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">AI Tutor Insight</span>
                            </div>
                            
                            {explanations[currentIndex] ? (
                                <div className="text-xs text-slate-300 leading-relaxed font-serif italic">
                                    "{explanations[currentIndex]}"
                                </div>
                            ) : (
                                <Button 
                                    onClick={handleExplain}
                                    disabled={!!explaining}
                                    className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 h-10 text-xs font-bold"
                                >
                                    {explaining === currentIndex ? (
                                        <Loader2 size={14} className="animate-spin mr-2" />
                                    ) : (
                                        <Sparkles size={14} className="mr-2" />
                                    )}
                                    Explain this answer
                                </Button>
                            )}

                            {!explanations[currentIndex] && currentQuestion.explanation && (
                                <div className="pt-2">
                                    <p className="text-[9px] text-slate-500 font-bold uppercase mb-1">Textbook Reference:</p>
                                    <p className="text-xs text-slate-400">{currentQuestion.explanation}</p>
                                </div>
                            )}
                        </Card>
                    )}

                    {/* Navigation Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button 
                            onClick={handlePrev}
                            disabled={currentIndex === 0}
                            variant="outline" 
                            className="bg-slate-950 border-white/5 text-slate-400 h-12"
                        >
                            <ChevronLeft size={20} />
                        </Button>
                        <Button 
                            onClick={handleNext}
                            disabled={currentIndex === questions.length - 1}
                            variant="outline" 
                            className="bg-slate-950 border-white/5 text-slate-400 h-12"
                        >
                            <ChevronRight size={20} />
                        </Button>
                    </div>

                    {currentIndex === questions.length - 1 && (
                        <Button 
                            onClick={handleSubmit}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12"
                        >
                            Complete Session
                        </Button>
                    )}

                    <div className="p-4 bg-slate-900/30 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 mb-3">
                            <BookOpen size={14} className="text-slate-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Question Bank</span>
                        </div>
                        <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="grid grid-cols-5 gap-1.5">
                                {questions.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentIndex(i)}
                                        className={cn(
                                            "h-8 text-[10px] font-bold rounded-md border transition-all",
                                            currentIndex === i ? "bg-cyan-500 text-white border-cyan-400" :
                                            userAnswers[i] !== undefined ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                            "bg-slate-950/50 text-slate-600 border-white/5 hover:border-white/10"
                                        )}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
