"use client"

import { useState } from "react"
import { Trash2, GripVertical, Sparkles, MessageCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { getAIExplanation, BankQuestion } from "@/lib/actions/cbt-builder"
import { toast } from "sonner"

interface QuizCanvasProps {
    questions: BankQuestion[]
    onRemove: (id: string) => void
    onUpdate: (id: string, updates: Partial<BankQuestion>) => void
    onReorder: (questions: BankQuestion[]) => void
}

export function QuizCanvas({ questions, onRemove, onUpdate, onReorder }: QuizCanvasProps) {
    if (questions.length === 0) {
        return (
            <div className="h-full border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-center p-12 bg-slate-900/40">
                <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <MessageCircle className="h-8 w-8 text-slate-700" />
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-2">Your Assessment is Empty</h3>
                <p className="text-slate-500 max-w-xs text-sm">
                    Select a source from the left sidebar to start building your quiz. You can add questions manually, generate them with AI, or pull from the exam bank.
                </p>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
            {questions.map((q, index) => (
                <QuestionCard
                    key={q.id}
                    question={q}
                    index={index}
                    onRemove={onRemove}
                    onUpdate={onUpdate}
                />
            ))}
        </div>
    )
}

function QuestionCard({ question, index, onRemove, onUpdate }: {
    question: BankQuestion,
    index: number,
    onRemove: (id: string) => void,
    onUpdate: (id: string, updates: Partial<BankQuestion>) => void
}) {
    const [explaining, setExplaining] = useState(false)

    const handleExplain = async () => {
        setExplaining(true)
        try {
            const explanation = await getAIExplanation(
                question.question_text,
                question.options[question.correct_option]
            )
            onUpdate(question.id, { explanation })
            toast.success("AI Explanation Generated")
        } catch {
            toast.error("Explanation failed")
        } finally {
            setExplaining(false)
        }
    }

    const updateOption = (optIndex: number, val: string) => {
        const newOpts = [...question.options]
        newOpts[optIndex] = val
        onUpdate(question.id, { options: newOpts })
    }

    return (
        <div className="group bg-slate-900/60 border border-white/5 rounded-2xl p-6 transition-all hover:bg-slate-900/80 hover:border-blue-500/20 relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-blue-600 rounded-l-2xl transition-all" />

            <div className="flex items-start gap-4">
                <div className="pt-1 cursor-grab active:cursor-grabbing text-slate-700">
                    <GripVertical className="h-5 w-5" />
                </div>

                <div className="flex-1 space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2 py-1 rounded">
                            Question {index + 1}
                        </span>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                className="w-16 h-8 bg-slate-950/50 border-white/10 text-center text-xs"
                                value={question.points}
                                onChange={(e) => onUpdate(question.id, { points: parseInt(e.target.value) })}
                            />
                            <span className="text-[10px] text-slate-600 uppercase font-bold pr-2 border-r border-white/5">Marks</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-600 hover:text-red-500 hover:bg-red-500/10"
                                onClick={() => onRemove(question.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Question Text</Label>
                        <Textarea
                            value={question.question_text}
                            onChange={(e) => onUpdate(question.id, { question_text: e.target.value })}
                            className="bg-transparent border-white/10 text-white font-medium resize-none min-h-[80px]"
                            placeholder="Enter your question here..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['A', 'B', 'C', 'D'].map((label, i) => (
                            <div key={i} className="space-y-2 relative group-opt">
                                <Label className="text-[10px] uppercase font-bold text-slate-600">Option {label}</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={question.options[i]}
                                        onChange={(e) => updateOption(i, e.target.value)}
                                        className={`bg-slate-950/30 border-white/5 text-sm transition-all focus:border-blue-500/50 ${question.correct_option === i ? 'ring-2 ring-emerald-500/50 border-emerald-500/50 bg-emerald-500/5' : ''
                                            }`}
                                    />
                                    <button
                                        onClick={() => onUpdate(question.id, { correct_option: i })}
                                        className={`px-3 rounded-lg border transition-all ${question.correct_option === i
                                            ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                            : 'bg-white/5 border-white/10 text-slate-600 hover:text-slate-400'
                                            }`}
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Explanation / Breakdown</Label>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-[10px] gap-1.5 bg-purple-600/10 border-purple-500/20 text-purple-400 hover:bg-purple-600/20"
                                onClick={handleExplain}
                                disabled={explaining}
                            >
                                {explaining ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                AI EXPLAIN
                            </Button>
                        </div>
                        <Textarea
                            value={question.explanation || ""}
                            onChange={(e) => onUpdate(question.id, { explanation: e.target.value })}
                            className="bg-transparent border-white/5 text-xs text-slate-400 font-serif italic min-h-[60px]"
                            placeholder="Provide a breakdown for students..."
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
