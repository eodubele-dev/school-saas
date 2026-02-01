import { AffectiveStars } from "@/components/student/profile/affective-stars"
import { CharacterRadar } from "@/components/student/profile/character-radar"
import { IncidentLog } from "@/components/student/profile/incident-log"
import { Button } from "@/components/ui/button"
import { Printer, Shield, Tent, Swords } from "lucide-react"

export default async function StudentProfilePage() {
    const { success, student, achievements, behavior, incidents } = await getStudentProfileData()

    if (!success || !student) {
        return <div className="p-8 text-white">Profile Loading... or Student Not Found</div>
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-8 space-y-8 max-w-7xl mx-auto">

            {/* Header / Bio */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 bg-slate-900 border border-white/5 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--school-accent)]/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="flex items-center gap-6 relative z-10">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[var(--school-accent)] to-blue-600 border-4 border-slate-950 shadow-2xl flex items-center justify-center text-3xl font-bold text-white">
                        {student.full_name?.substring(0, 2)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{student.full_name}</h1>
                        <p className="text-slate-400 text-sm mb-3">Admission No: {student.metadata?.admission_number}</p>

                        <div className="flex flex-wrap gap-2">
                            <span className="flex items-center gap-1.5 bg-red-900/30 text-red-200 border border-red-500/20 px-3 py-1 rounded-full text-xs font-bold">
                                <Shield className="h-3 w-3" /> {student.metadata?.house || "No House"}
                            </span>
                            <span className="flex items-center gap-1.5 bg-blue-900/30 text-blue-200 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold">
                                <Tent className="h-3 w-3" /> {student.class?.name || "No Class"}
                            </span>
                        </div>
                    </div>
                </div>

                <Button variant="outline" className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5 z-10">
                    <Printer className="h-4 w-4 mr-2" /> Print ID Card
                </Button>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Col 1: Trophy Case & Timeline (Left 2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    <TrophyCase achievements={achievements || []} />

                    <div className="p-6 bg-slate-900 border border-white/5 rounded-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white font-bold text-lg">Key Milestones & Remarks</h3>
                        </div>
                        <IncidentLog incidents={incidents || []} />
                    </div>
                </div>

                {/* Col 2: Character & Portfolio Details (Right 1/3) */}
                <div className="flex flex-col gap-6">
                    {/* Stars Display (Primary) */}
                    <AffectiveStars behavior={behavior} />

                    {/* Radar (Secondary/Visual) */}
                    <div className="h-[300px] opacity-75 grayscale hover:grayscale-0 transition-all">
                        <CharacterRadar behavior={behavior} />
                    </div>

                    {/* Clubs / Portfolio */}
                    <div className="p-6 bg-slate-900 border border-white/5 rounded-xl">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Swords className="h-4 w-4 text-purple-400" />
                            Active Clubs
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {student.metadata?.clubs?.map((club: string) => (
                                <span key={club} className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-3 py-1.5 rounded-lg text-xs font-bold">
                                    {club}
                                </span>
                            )) || <span className="text-slate-500 text-xs">No active clubs</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
