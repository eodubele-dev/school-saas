import { BehaviorTabs } from "@/components/teacher/behavior/behavior-tabs"
import { createClient } from "@/lib/supabase/server"
import { getTeacherClasses } from "@/lib/actions/attendance"

async function getStudents() {
    const supabase = createClient()
    const { success, data: classes } = await getTeacherClasses()
    
    if (!success || !classes || classes.length === 0) return []
    
    const classIds = classes.map(c => c.id)

    const { data } = await supabase
        .from('students')
        .select('*')
        .in('class_id', classIds)
        .order('full_name')
        
    return data || []
}

export default async function BehaviorManagerPage() {
    const students = await getStudents()

    return (
        <div className="p-3 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto min-h-screen bg-slate-950">
            <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">Behavior & Awards Manager</h1>
                <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">Recognize excellence, track incidents, and process end-of-term evaluations.</p>
            </div>

            <BehaviorTabs students={students} />
        </div>
    )
}
