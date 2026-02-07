
import { LessonGenerator } from "@/components/academic/lesson-generator"
import { getLessonPlans } from "@/lib/actions/lesson-plan"
import { getTeacherClasses } from "@/lib/actions/classes"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Clock } from "lucide-react"
import Link from "next/link"

export default async function LessonPlansPage({ searchParams }: { searchParams: { id?: string } }) {
    const res = await getLessonPlans()
    const classesRes = await getTeacherClasses()
    const recentPlans = res.data || []
    const classes = classesRes.data || []

    const selectedPlan = searchParams.id ? recentPlans.find((p: any) => p.id === searchParams.id) : null

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row animate-in fade-in duration-1000 bg-slate-950">
            {/* Left Sidebar: Recent Plans - Glass Obsidian Aesthetic */}
            <div className="w-full md:w-80 border-r border-white/5 bg-slate-900/40 backdrop-blur-3xl p-6 hidden md:flex flex-col shadow-[20px_0_50px_rgba(0,0,0,0.3)] z-10">
                <div className="mb-8 flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Archive</h3>
                        <h4 className="text-sm font-bold text-white tracking-tight">Lesson History</h4>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-tighter shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                        {String(recentPlans.length).padStart(2, '0')}
                    </div>
                </div>

                <ScrollArea className="flex-1 -mx-4 px-4 overflow-hidden">
                    <div className="space-y-2 pb-8">
                        {recentPlans.map((plan: any) => {
                            const isActive = searchParams.id === plan.id
                            return (
                                <Link
                                    key={plan.id}
                                    href={`?id=${plan.id}`}
                                    className={`w-full group relative p-4 rounded-2xl transition-all duration-500 border block overflow-hidden ${isActive
                                            ? 'bg-blue-600/10 border-blue-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.3)]'
                                            : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10 hover:translate-x-1'
                                        }`}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                                    )}

                                    <p className={`text-sm font-bold truncate transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                        {plan.title}
                                    </p>
                                    <div className="flex items-center gap-3 text-[10px] mt-2 font-bold uppercase tracking-wider">
                                        <div className={`flex items-center gap-1.5 ${isActive ? 'text-blue-400' : 'text-slate-600'}`}>
                                            <Clock className="h-3 w-3" />
                                            <span>{new Date(plan.created_at || plan.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                        </div>
                                        <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-blue-500' : 'bg-slate-800'}`} />
                                        <span className={`${isActive ? 'text-blue-300' : 'text-slate-500 opacity-60'}`}>{plan.subject}</span>
                                    </div>
                                </Link>
                            )
                        })}
                        {recentPlans.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-40 grayscale group hover:grayscale-0 transition-all duration-1000">
                                <FileText className="h-12 w-12 text-slate-600 mb-4 group-hover:scale-110 transition-transform" />
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-loose">No generated<br />plans yet.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Visual Anchor Footer */}
                <div className="mt-auto pt-6 border-t border-white/5 opacity-20">
                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-[0.4em] text-slate-500">
                        <span>EduFlow Engine</span>
                        <span>v2.0.4</span>
                    </div>
                </div>
            </div>

            {/* Main Area: Generator - Cinematic Grid Backdrop */}
            <div className="flex-1 p-6 md:p-12 overflow-y-auto bg-[url('/grid-pattern.svg')] bg-[length:60px_60px] bg-fixed relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-transparent to-blue-500/5 pointer-events-none" />

                <div className="max-w-7xl mx-auto h-full flex flex-col relative z-10">
                    <div className="flex items-center gap-4 mb-12 group">
                        <div className="bg-blue-600/10 p-3 rounded-2xl border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)] group-hover:scale-110 transition-transform duration-500">
                            <span className="bg-blue-500 w-2 h-8 rounded-full block shadow-[0_0_15px_rgba(59,130,246,0.6)] animate-pulse"></span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                                Lesson <span className="text-blue-500">Architect</span>
                            </h1>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.5em] mt-1 ml-1 opacity-70">
                                Autonomous NERDC Curriculum Core
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0">
                        <LessonGenerator
                            initialPlan={selectedPlan}
                            teacherClasses={classes}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
