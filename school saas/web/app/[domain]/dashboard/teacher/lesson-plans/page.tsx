
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
        <div className="h-[calc(100vh-80px)] flex bg-slate-950 animate-in fade-in duration-1000 overflow-hidden font-sans selection:bg-blue-500/30">
            {/* Left Sidebar: Archive (Minimalist Vertical List) */}
            <div className="w-80 flex flex-col border-r border-slate-800 bg-slate-900 relative z-20">
                <div className="p-6 pb-2">
                    <div className="flex items-center justify-between mb-6">
                        <div className="space-y-1">
                            <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Archive</h3>
                            <h4 className="text-sm font-bold text-slate-100 tracking-tight">Lesson History</h4>
                        </div>
                        <div className="h-6 px-2.5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                            <span className="text-[10px] font-mono text-slate-400">{String(recentPlans.length).padStart(2, '0')}</span>
                        </div>
                    </div>
                </div>

                <ScrollArea className="flex-1 px-4">
                    <div className="space-y-2 pb-6">
                        {recentPlans.map((plan: any) => {
                            const isActive = searchParams.id === plan.id
                            return (
                                <Link
                                    key={plan.id}
                                    href={`?id=${plan.id}`}
                                    className={`group flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${isActive
                                        ? 'bg-blue-900/20 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                        : 'bg-transparent border-transparent hover:bg-slate-800 hover:border-slate-700'
                                        }`}
                                >
                                    {/* Status Pip */}
                                    <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] transition-colors duration-300 ${isActive ? 'bg-blue-400 text-blue-400' : 'bg-slate-800 text-transparent group-hover:bg-slate-700'}`} />

                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-bold truncate transition-colors ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                            {plan.title || 'Untitled Lesson'}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[9px] font-mono uppercase ${isActive ? 'text-blue-500' : 'text-slate-600'}`}>
                                                {plan.subject?.slice(0, 3)}
                                            </span>
                                            <span className="text-[9px] text-slate-700">•</span>
                                            <span className="text-[9px] text-slate-600 font-mono">
                                                {new Date(plan.created_at || plan.date).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>

                                    {isActive && <div className="w-0.5 h-4 bg-blue-500 rounded-full" />}
                                </Link>
                            )
                        })}

                        {recentPlans.length === 0 && (
                            <div className="py-20 flex flex-col items-center justify-center opacity-30">
                                <FileText className="h-8 w-8 text-slate-700 mb-3" />
                                <p className="text-[10px] uppercase tracking-widest text-slate-600">No Archives</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-slate-800 bg-slate-900">
                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-600">
                        <span>SYNC: ONLINE</span>
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                            <span>v2.4.0</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Workspace (Bento Layout) */}
            <div className="flex-1 flex min-w-0 relative">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-[length:30px_30px] opacity-[0.02] pointer-events-none" />

                <div className="w-full h-full p-6 flex gap-6">
                    <LessonGenerator
                        initialPlan={selectedPlan}
                        teacherClasses={classes}
                    />
                </div>
            </div>
        </div>
    )
}
