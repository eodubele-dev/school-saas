
import { LessonGenerator } from "@/components/academic/lesson-generator"
import { getLessonPlans } from "@/lib/actions/lesson-plan"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Clock } from "lucide-react"

export default async function LessonPlansPage() {
    const res = await getLessonPlans()
    const recentPlans = res.data || []

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row animate-in fade-in duration-700">
            {/* Left Sidebar: Recent Plans */}
            <div className="w-full md:w-72 border-r border-white/5 bg-slate-900/50 p-6 hidden md:flex flex-col shadow-[inset_-10px_0_20px_-10px_rgba(0,0,0,0.5)]">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">History</h3>
                    <div className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold">
                        {recentPlans.length}
                    </div>
                </div>

                <ScrollArea className="flex-1 -mx-4 px-4">
                    <div className="space-y-1">
                        {recentPlans.map((plan: any) => (
                            <button key={plan.id} className="w-full text-left p-3 rounded-lg hover:bg-white/5 group transition-all border border-transparent hover:border-white/5">
                                <p className="text-sm font-medium text-slate-300 truncate group-hover:text-[var(--school-accent)] transition-colors">
                                    {plan.title}
                                </p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1.5">
                                    <Clock className="h-3 w-3" />
                                    <span>{new Date(plan.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                                    <span>{plan.subject}</span>
                                </div>
                            </button>
                        ))}
                        {recentPlans.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                                <FileText className="h-8 w-8 text-slate-600 mb-2" />
                                <p className="text-xs text-slate-500">No generated plans yet.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Area: Generator */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-[url('/grid-pattern.svg')] bg-fixed bg-center">
                <div className="max-w-[1600px] mx-auto h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-[var(--school-accent)]/10 p-2 rounded-lg border border-[var(--school-accent)]/20">
                            <span className="bg-[var(--school-accent)] w-1.5 h-6 rounded-full block shadow-[0_0_10px_var(--school-accent)]"></span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">AI Lesson Architect</h1>
                            <p className="text-slate-400 text-xs mt-0.5">Automated NERDC Curriculum Planner</p>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0">
                        <LessonGenerator />
                    </div>
                </div>
            </div>
        </div>
    )
}
