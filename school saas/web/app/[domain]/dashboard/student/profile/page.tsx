import { getStudentProfileData } from "@/lib/actions/student-profile"
import { TrophyCase } from "@/components/student/profile/trophy-case"
import { CharacterRadar } from "@/components/student/profile/character-radar"
import { IncidentLog } from "@/components/student/profile/incident-log"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

export default async function StudentProfilePage() {
    const { success, student, achievements, behavior, incidents } = await getStudentProfileData()

    if (!success || !student) {
        return <div className="p-8 text-white">Profile Loading... or Student Not Found</div>
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6 md:p-8 space-y-8 max-w-7xl mx-auto">

            {/* Header / Bio */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 bg-slate-900 border border-white/5 rounded-2xl">
                <div className="flex items-center gap-6">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[var(--school-accent)] to-blue-600 border-4 border-slate-950 shadow-2xl flex items-center justify-center text-3xl font-bold text-white">
                        {student.full_name?.substring(0, 2)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{student.full_name}</h1>
                        <div className="flex flex-wrap gap-3 mt-2">
                            <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs font-mono">{student.metadata?.admission_number}</span>
                            <span className="bg-red-900/40 text-red-200 border border-red-500/20 px-3 py-1 rounded-full text-xs">{student.metadata?.house}</span>
                            <span className="bg-blue-900/40 text-blue-200 border border-blue-500/20 px-3 py-1 rounded-full text-xs">{student.class?.name}</span>
                        </div>
                    </div>
                </div>

                <Button variant="outline" className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5">
                    <Printer className="h-4 w-4 mr-2" /> Print ID Card
                </Button>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Col 1: Trophy Case (Full Width on mobile, 2 cols on LG) */}
                <div className="lg:col-span-2 space-y-6">
                    <TrophyCase achievements={achievements || []} />
                    <div className="h-[400px]">
                        <IncidentLog incidents={incidents || []} />
                    </div>
                </div>

                {/* Col 2: Radar Chart & Bio Details */}
                <div className="flex flex-col gap-6">
                    <div className="h-[350px]">
                        <CharacterRadar behavior={behavior} />
                    </div>

                    {/* Club Meta */}
                    <div className="p-6 bg-slate-900 border border-white/5 rounded-xl">
                        <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Extra-Curricular</h3>
                        <div className="flex flex-wrap gap-2">
                            {student.metadata?.clubs?.map((club: string) => (
                                <span key={club} className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-3 py-1 rounded-md text-xs font-bold">
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
