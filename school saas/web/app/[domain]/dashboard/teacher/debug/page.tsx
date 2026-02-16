import { createClient } from "@/lib/supabase/server"

export default async function TeacherDebugPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Not Logged In</div>

    // 1. Profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    // 2. Allocations
    const { data: allocations } = await supabase
        .from('teacher_allocations')
        .select('*, classes(*)')
        .eq('teacher_id', user.id)

    // 3. Subject Assignments
    const { data: subjectAssigns } = await supabase
        .from('subject_assignments')
        .select('*, classes(*)')
        .eq('teacher_id', user.id)

    // 4. Any Classes in Tenant?
    const { data: tenantClasses } = await supabase
        .from('classes')
        .select('*')
        .eq('tenant_id', profile?.tenant_id)
        .limit(5)

    return (
        <div className="p-8 text-white space-y-6 bg-slate-900 min-h-screen font-mono text-sm">
            <h1 className="text-xl font-bold text-amber-500">Teacher Allocation Debugger</h1>

            <section className="bg-black/50 p-4 rounded border border-white/10">
                <h2 className="text-lg font-bold mb-2">1. Auth User & Profile</h2>
                <pre>{JSON.stringify(user, null, 2)}</pre>
                <div className="mt-2 border-t border-white/10 pt-2">
                    <pre>{JSON.stringify(profile, null, 2)}</pre>
                </div>
            </section>

            <section className="bg-black/50 p-4 rounded border border-white/10">
                <h2 className="text-lg font-bold mb-2">2. Teacher Allocations (Form Teacher?)</h2>
                {allocations && allocations.length > 0 ? (
                    <pre className="text-green-400">{JSON.stringify(allocations, null, 2)}</pre>
                ) : (
                    <div className="text-red-400">No records in `teacher_allocations` for this user.</div>
                )}
            </section>

            <section className="bg-black/50 p-4 rounded border border-white/10">
                <h2 className="text-lg font-bold mb-2">3. Subject Assignments (Subject Teacher?)</h2>
                {subjectAssigns && subjectAssigns.length > 0 ? (
                    <pre className="text-green-400">{JSON.stringify(subjectAssigns, null, 2)}</pre>
                ) : (
                    <div className="text-red-400">No records in `subject_assignments` for this user.</div>
                )}
            </section>

            <section className="bg-black/50 p-4 rounded border border-white/10">
                <h2 className="text-lg font-bold mb-2">4. Tenant Classes Sample</h2>
                <pre>{JSON.stringify(tenantClasses, null, 2)}</pre>
            </section>

            <section className="bg-black/50 p-4 rounded border border-white/10">
                <h2 className="text-lg font-bold mb-2">5. Attendance Debug</h2>
                {/* Check if columns exist by trying a select */}
                <div className="space-y-2">
                    <AttendanceTester />
                </div>
            </section>
        </div>
    )
}

async function AttendanceTester() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Try fetching student_attendance with tenant_id (The suspect query)
    const { data: suspectQuery, error: suspectError } = await supabase
        .from('student_attendance')
        .select('id, status')
        // We temporarily comment out tenant_id to see if it even works without it first
        .limit(5)

    // 2. Try fetching WITH tenant_id filter
    // Note: If this errors, we know tenant_id is missing
    const { error: tenantIdError } = await supabase
        .from('student_attendance')
        .select('id')
        .eq('tenant_id', '00000000-0000-0000-0000-000000000000') // Dummy UUID
        .limit(1)

    // 3. Check Registers
    const { data: registers } = await supabase.from('attendance_registers').select('*').limit(3)

    return (
        <div className="text-xs font-mono">
            <div className="mb-2">
                <strong>Basic Select (No Filters):</strong>
                {suspectQuery ? <span className="text-green-400"> OK ({suspectQuery.length} items)</span> : <span className="text-red-400"> Failed: {suspectError?.message}</span>}
            </div>
            <div className="mb-2">
                <strong>Select with .eq('tenant_id', ...):</strong>
                {tenantIdError ? <span className="text-red-400"> Error: {tenantIdError.message} (Likely missing column)</span> : <span className="text-green-400"> OK (Column exists)</span>}
            </div>
            <div className="mb-2">
                <strong>Registers Check:</strong>
                <pre>{JSON.stringify(registers, null, 2)}</pre>
            </div>
        </div>
    )
}
