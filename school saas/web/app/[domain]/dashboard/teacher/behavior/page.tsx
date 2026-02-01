import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AwardConsole } from "@/components/teacher/behavior/award-console"
import { AffectiveDomainGrid } from "@/components/teacher/behavior/affective-domain-grid"
import { IncidentForm } from "@/components/teacher/behavior/incident-form"
import { createClient } from "@/lib/supabase/server"

// Mock fetch for students - normally would filter by assigned class context
async function getStudents() {
    const supabase = createClient()
    const { data } = await supabase.from('students').select('*').limit(20)
    return data || []
}

export default async function BehaviorManagerPage() {
    const students = await getStudents()

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto min-h-screen bg-slate-950">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Behavior & Awards Manager</h1>
                <p className="text-slate-400">Recognize excellence and track student character development.</p>
            </div>

            <Tabs defaultValue="awards" className="space-y-6">
                <TabsList className="bg-slate-900 border border-white/10 p-1">
                    <TabsTrigger value="awards" className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-white text-slate-400">
                        Instant Recognition
                    </TabsTrigger>
                    <TabsTrigger value="ratings" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-slate-400">
                        Termly Ratings
                    </TabsTrigger>
                    <TabsTrigger value="incidents" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white text-slate-400">
                        Incident Log
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="awards" className="animate-in fade-in slide-in-from-left-4 duration-300">
                    <AwardConsole students={students} />
                </TabsContent>

                <TabsContent value="ratings" className="animate-in fade-in slide-in-from-left-4 duration-300">
                    <AffectiveDomainGrid students={students} />
                </TabsContent>

                <TabsContent value="incidents" className="animate-in fade-in slide-in-from-left-4 duration-300">
                    <IncidentForm students={students} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
