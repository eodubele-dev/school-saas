"use client"

import { PracticeSelector } from "@/components/cbt/practice-selector"
import { PracticeCanvas } from "@/components/cbt/practice-canvas"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BrainCircuit, History, ArrowRight, Sparkles, Loader2 } from "lucide-react"
import { getRecentPracticeSessions, getDailyPracticeProgress } from "@/lib/actions/cbt-practice"
import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"

export default function StudentCBTPracticePage() {
    const [sessionData, setSessionData] = useState<any>(null)
    const [history, setHistory] = useState<any[]>([])
    const [progress, setProgress] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [histRes, progRes] = await Promise.all([
                getRecentPracticeSessions(5),
                getDailyPracticeProgress()
            ])

            if (histRes.success) setHistory(histRes.data || [])
            if (progRes.success) setProgress(progRes.data)
        } catch (error) {
            console.error("Failed to load CBT Practice data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleStartSession = (data: any) => {
        setSessionData(data)
    }

    if (sessionData) {
        return (
            <div className="max-w-6xl mx-auto py-8">
                <PracticeCanvas 
                    questions={sessionData.questions}
                    sessionId={sessionData.sessionId}
                    metadata={{
                        subject: sessionData.subject,
                        examType: sessionData.examType,
                        year: sessionData.year
                    }}
                    onExit={() => setSessionData(null)}
                />
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
            {/* Hero Section */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-slate-900 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border border-white/5 overflow-hidden">
                    <div className="flex-1 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-[10px] font-bold uppercase tracking-widest">
                            <BrainCircuit size={12} />
                            Master Your Exams
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-none">
                            Independent <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Practice Hub</span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-xl">
                            Select any subject from past JAMB, WAEC, or NECO papers and test your knowledge. Get instant AI-powered explanations for every answer.
                        </p>
                    </div>
                    <div className="w-full md:w-80 space-y-4">
                        <Card className="bg-slate-950/50 border-white/5 p-6 backdrop-blur-xl group-hover:border-cyan-500/30 transition-all duration-500">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Today's Accuracy</span>
                                <span className="text-cyan-400 font-black text-sm">{progress?.percentage || 0}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500 rounded-full transition-all duration-1000" style={{ width: `${progress?.percentage || 0}%` }}></div>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-4 text-center">
                                {progress?.sessionCount || 0} sessions completed today.
                            </p>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Main Selection Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <PracticeSelector onStart={handleStartSession} />
                </div>

                <div className="space-y-6">
                    <Card className="bg-slate-900/40 border-white/5 p-6 space-y-6">
                        <div className="flex items-center gap-2 text-slate-300">
                            <History size={18} className="text-cyan-500" />
                            <h3 className="text-sm font-bold uppercase tracking-widest">Recent Sessions</h3>
                        </div>
                        
                        <div className="space-y-3">
                            {loading ? (
                                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-700" size={20} /></div>
                            ) : history.length > 0 ? (
                                history.map((session) => (
                                    <div key={session.id} className="p-3 bg-slate-950/50 rounded-xl border border-white/5 flex items-center justify-between group hover:border-cyan-500/30 transition-all cursor-pointer">
                                        <div>
                                            <p className="text-xs font-bold text-white">{session.exam_type} {session.subject} {session.year}</p>
                                            <p className="text-[9px] text-slate-500 uppercase font-bold">
                                                {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })} • {session.score}/{session.total_questions}
                                            </p>
                                        </div>
                                        <ArrowRight size={14} className="text-slate-600 group-hover:text-cyan-400" />
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                                    No recent practice found
                                </div>
                            )}
                        </div>

                        <button className="w-full text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-cyan-400 transition-colors">
                            View All History →
                        </button>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-white/5 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 bg-purple-500/10 rounded-full blur-3xl"></div>
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-2 text-purple-400">
                                <Sparkles size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">AI Tutor Pro</span>
                            </div>
                            <h4 className="text-lg font-black text-white leading-tight">Master Complex Topics</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                {history.length > 0 
                                    ? `Based on your recent ${history[0].subject} session, keep practicing to improve your consistency.`
                                    : "Practice more sessions to unlock personalized AI study advice and topic focus."}
                            </p>
                            <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold uppercase tracking-widest h-9">
                                Smart Practice
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
