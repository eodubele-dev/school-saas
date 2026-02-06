"use client"

import { useState } from "react"
import { Search, Sparkles, Database, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateAIQuestions, searchExamBank } from "@/lib/actions/cbt-builder"
import { toast } from "sonner"

import { BankQuestion } from "@/lib/actions/cbt-builder"

interface SourceSelectorProps {
    onAddQuestions: (questions: BankQuestion[]) => void
}

export function SourceSelector({ onAddQuestions }: SourceSelectorProps) {
    const [source, setSource] = useState<'manual' | 'ai' | 'bank'>('manual')
    const [loading, setLoading] = useState(false)

    // AI State
    const [aiTopic, setAiTopic] = useState("")
    const [aiCount, setAiCount] = useState("5")

    // Bank State
    const [bankType, setBankType] = useState("JAMB")
    const [bankYear, setBankYear] = useState("2024")
    const [bankSubject, setBankSubject] = useState("Mathematics")
    const [bankTopic, setBankTopic] = useState("")

    const handleGenerateAI = async () => {
        if (!aiTopic) return toast.error("Please enter a topic")
        setLoading(true)
        try {
            const qs = await generateAIQuestions({
                subject: "Mixed",
                topic: aiTopic,
                count: parseInt(aiCount),
                difficulty: "Medium"
            })

            if (qs.length === 0) {
                toast.error("AI returned 0 questions. This can happen if the topic is too obscure or the model is busy.", {
                    description: "Please try a different topic or try again in a moment."
                })
                return
            }

            onAddQuestions(qs)
            toast.success(`Generated ${qs.length} questions`)
        } catch (error) {
            console.error('Gemini Error:', error)
            toast.error("Failed to generate questions. Please check your internet connection or try again later.")
        } finally {
            setLoading(false)
        }
    }

    const handleSearchBank = async () => {
        setLoading(true)
        try {
            const qs = await searchExamBank({
                subject: bankSubject,
                examType: bankType,
                year: bankYear,
                topic: bankTopic
            })

            if (!qs || qs.length === 0) {
                toast.info("No questions found matching your filters")
                return
            }

            onAddQuestions(qs)
            toast.success(`Found ${qs.length} questions`)
        } catch (e) {
            console.error('Bank Search Error:', e)
            toast.error("Bank search failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 h-full flex flex-col gap-6">
            <div className="flex gap-2 bg-slate-950/50 p-1.5 rounded-xl border border-white/5">
                {[
                    { id: 'manual', icon: Plus, label: 'Manual' },
                    { id: 'ai', icon: Sparkles, label: 'AI Gen' },
                    { id: 'bank', icon: Database, label: 'Exam Bank' }
                ].map((s) => (
                    <button
                        key={s.id}
                        onClick={() => setSource(s.id as 'manual' | 'ai' | 'bank')}
                        className={`flex-1 min-w-[70px] flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg text-xs font-bold transition-all ${source === s.id
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                            }`}
                    >
                        <s.icon className={`h-3.5 w-3.5 ${source === s.id ? 'animate-pulse' : ''}`} />
                        <span className="whitespace-nowrap">{s.label}</span>
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                {source === 'manual' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 border-dashed flex flex-col items-center justify-center text-center gap-3 py-12">
                            <Plus className="h-8 w-8 text-slate-400" />
                            <p className="text-sm text-slate-400">Add questions manually one by one on the right canvas.</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onAddQuestions([{
                                    question_text: "New Question",
                                    options: ["", "", "", ""],
                                    correct_option: 0,
                                    explanation: ""
                                }])}
                                className="border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                            >
                                Add Empty Slot
                            </Button>
                        </div>
                    </div>
                )}

                {source === 'ai' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Concept / Topic</Label>
                            <Input
                                placeholder="e.g. Photosynthesis, Algebra"
                                className="bg-slate-950/50 border-white/10"
                                value={aiTopic}
                                onChange={(e) => setAiTopic(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Question Count</Label>
                            <Select value={aiCount} onValueChange={setAiCount}>
                                <SelectTrigger className="bg-slate-950/50 border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                    <SelectItem value="5">5 Questions</SelectItem>
                                    <SelectItem value="10">10 Questions</SelectItem>
                                    <SelectItem value="20">20 Questions</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white gap-2 font-bold py-6 group"
                            onClick={handleGenerateAI}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 group-hover:scale-125 transition-transform" />}
                            Generate with Gemini
                        </Button>
                    </div>
                )}

                {source === 'bank' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Exam Type</Label>
                                <Select value={bankType} onValueChange={setBankType}>
                                    <SelectTrigger className="bg-slate-950/50 border-white/10 text-xs h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-white/10 text-white">
                                        <SelectItem value="JAMB">JAMB</SelectItem>
                                        <SelectItem value="WAEC">WAEC</SelectItem>
                                        <SelectItem value="NECO">NECO</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Year</Label>
                                <Select value={bankYear} onValueChange={setBankYear}>
                                    <SelectTrigger className="bg-slate-950/50 border-white/10 text-xs h-9">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-white/10 text-white max-h-[200px]">
                                        {Array.from({ length: 15 }, (_, i) => 2024 - i).map(y => (
                                            <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Subject</Label>
                            <Input
                                value={bankSubject}
                                onChange={(e) => setBankSubject(e.target.value)}
                                className="bg-slate-950/50 border-white/10 h-9"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Topic (Optional)</Label>
                            <Input
                                value={bankTopic}
                                onChange={(e) => setBankTopic(e.target.value)}
                                className="bg-slate-950/50 border-white/10 h-9"
                                placeholder="e.g. Calculus"
                            />
                        </div>
                        <Button
                            variant="secondary"
                            className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/20 gap-2 font-bold py-6"
                            onClick={handleSearchBank}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            Search Exam Bank
                        </Button>
                    </div>
                )}
            </div>

            <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] text-slate-600 leading-tight uppercase tracking-tighter italic">
                    All generated or pulled questions can be edited individually before publishing.
                </p>
            </div>
        </div>
    )
}
