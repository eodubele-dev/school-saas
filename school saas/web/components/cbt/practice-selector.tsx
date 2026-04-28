"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, GraduationCap, Calendar, Loader2, Sparkles, ArrowRight } from "lucide-react"
import { getPastQuestionSubjects, getPastQuestionMetadata, startPracticeSession } from "@/lib/actions/cbt-practice"
import { toast } from "sonner"

export function PracticeSelector({ onStart }: { onStart: (data: any) => void }) {
    const [loading, setLoading] = useState(true)
    const [starting, setStarting] = useState(false)
    const [subjects, setSubjects] = useState<string[]>([])
    const [metadata, setMetadata] = useState<{ examTypes: string[], years: number[], counts: Record<string, number> } | null>(null)

    const [selectedSubject, setSelectedSubject] = useState<string>("")
    const [selectedExamType, setSelectedExamType] = useState<string>("")
    const [selectedYear, setSelectedYear] = useState<string>("")

    useEffect(() => {
        loadSubjects()
    }, [])

    useEffect(() => {
        if (selectedSubject) {
            loadMetadata(selectedSubject)
        }
    }, [selectedSubject])

    const loadSubjects = async () => {
        try {
            const res = await getPastQuestionSubjects()
            if (res.success && res.data) {
                setSubjects(res.data)
            } else {
                toast.error("Failed to load subjects")
            }
        } catch (error) {
            console.error("Subject load error:", error)
            toast.error("Network error while loading subjects")
        } finally {
            setLoading(false)
        }
    }

    const loadMetadata = async (subject: string) => {
        try {
            const res = await getPastQuestionMetadata(subject)
            if (res.success && res.data) {
                setMetadata(res.data)
                setSelectedExamType("")
                setSelectedYear("")
            }
        } catch (error) {
            console.error("Metadata load error:", error)
        }
    }

    const handleStart = async () => {
        if (!selectedSubject || !selectedExamType || !selectedYear) {
            toast.error("Please complete all selections")
            return
        }

        try {
            setStarting(true)
            const res = await startPracticeSession({
                subject: selectedSubject,
                examType: selectedExamType,
                year: parseInt(selectedYear)
            })

            if (res.success && res.data) {
                onStart({
                    ...res.data,
                    subject: selectedSubject,
                    examType: selectedExamType,
                    year: selectedYear
                })
            } else {
                toast.error(res.error || "Failed to start session")
            }
        } catch (error) {
            console.error("Start session error:", error)
            toast.error("Network error: Failed to start session")
        } finally {
            setStarting(false)
        }
    }

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-cyan-500" /></div>

    return (
        <Card className="bg-slate-900/50 border-white/5 backdrop-blur-md p-8 overflow-hidden relative group">
            {/* Animated Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700"></div>
            
            <div className="relative z-10 space-y-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-cyan-400">
                        <Sparkles size={16} className="animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Self-Practice Engine</span>
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight">CBT Practice Hub</h2>
                    <p className="text-slate-400 text-sm max-w-md">
                        Master your exams by practicing with real past questions from JAMB, WAEC, and NECO.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Subject Selector */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Subject</label>
                        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                            <SelectTrigger className="bg-slate-950 border-white/10 text-white h-12">
                                <SelectValue placeholder="Select Subject" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                                {subjects.map(s => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Exam Type Selector */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Exam Body</label>
                        <Select 
                            value={selectedExamType} 
                            onValueChange={setSelectedExamType}
                            disabled={!selectedSubject}
                        >
                            <SelectTrigger className="bg-slate-950 border-white/10 text-white h-12">
                                <SelectValue placeholder="Select Type" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                                {metadata?.examTypes.map(t => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Year Selector */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Year</label>
                        <Select 
                            value={selectedYear} 
                            onValueChange={setSelectedYear}
                            disabled={!selectedExamType}
                        >
                            <SelectTrigger className="bg-slate-950 border-white/10 text-white h-12">
                                <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                                {metadata?.years.map(y => {
                                    const count = metadata.counts[`${selectedExamType}_${y}`] || 0
                                    return (
                                        <SelectItem key={y} value={y.toString()}>
                                            {y} {count > 0 && `(${count} Qs)`}
                                        </SelectItem>
                                    )
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button 
                    onClick={handleStart}
                    disabled={starting || !selectedYear}
                    className="w-full h-14 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all transform hover:scale-[1.01]"
                >
                    {starting ? (
                        <Loader2 className="animate-spin mr-2" />
                    ) : (
                        <>
                            Start Practice Session
                            <ArrowRight size={20} className="ml-2" />
                        </>
                    )}
                </Button>

                <div className="flex items-center justify-center gap-6 pt-4 text-slate-500 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter">
                        <BookOpen size={14} className="text-cyan-500/50" />
                        Unlimited Retakes
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter">
                        <Sparkles size={14} className="text-amber-500/50" />
                        AI Explanations
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter">
                        <GraduationCap size={14} className="text-emerald-500/50" />
                        Exam Ready
                    </div>
                </div>
            </div>
        </Card>
    )
}
