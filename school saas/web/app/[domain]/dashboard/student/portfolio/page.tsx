import { getStudentProfileData } from "@/lib/actions/student-profile"
import { TrophyCase } from "@/components/student/profile/trophy-case"
import { AffectiveStars } from "@/components/student/profile/affective-stars"
import { CharacterRadar } from "@/components/student/profile/character-radar"
import { Sparkles, BrainCircuit } from "lucide-react"

export default async function StudentPortfolioPage() {
    const { student, achievements, behavior } = await getStudentProfileData()

    if (!student) return <div className="p-8 text-white">Loading Portfolio...</div>

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto min-h-screen bg-slate-950">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Sparkles className="h-8 w-8 text-amber-500" />
                    Growth Portfolio
                </h1>
                <p className="text-slate-400">Your documented journey of character, leadership, and excellence.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Badges & Identity */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Leadership & Innovation Badges */}
                    <TrophyCase achievements={achievements || []} />

                    {/* AI Remarks Section (Mocked for Platinum feel) */}
                    <div className="p-6 bg-slate-900 border border-white/5 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <BrainCircuit className="h-24 w-24 text-emerald-500" />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                            <BrainCircuit className="h-5 w-5 text-emerald-500" />
                            AI Character Analysis
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-emerald-950/30 border border-emerald-500/20 rounded-lg">
                                <p className="text-emerald-200 text-sm leading-relaxed italic">
                                    "Based on recent activities, {student.full_name} has shown exceptional growth in **Leadership** and **Punctuality**. The data suggests a strong potential for the Student Representative Council next term."
                                </p>
                                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-500 font-mono">
                                    <span>• Confidence: 94%</span>
                                    <span>• Source: Behavioral Logs</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Key Metrics */}
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-white/5 rounded-xl p-1">
                        <CharacterRadar behavior={behavior} />
                    </div>

                    <AffectiveStars behavior={behavior} />
                </div>
            </div>
        </div>
    )
}
