import { createClient } from "@/lib/supabase/server"
import { getAssignedClass } from "@/lib/actions/student-attendance"
async function ProfilesProbe() {
    const supabase = createClient()
    const { data: profiles, count } = await supabase.from('profiles').select('id, role, full_name, tenant_id', { count: 'exact' })

    return (
        <div>
            <div>Visible Profiles: {count}</div>
            <pre className="text-[10px] overflow-auto max-h-40">{JSON.stringify(profiles, null, 2)}</pre>
        </div>
    )
}

async function StudentAttendanceProbe() {
    const supabase = createClient()
    const { count: attendanceCount, error: attError } = await supabase.from('student_attendance').select('*', { count: 'exact', head: true })
    const { count: registerCount, error: regError } = await supabase.from('attendance_registers').select('*', { count: 'exact', head: true })
    const { data: sample } = await supabase.from('student_attendance').select('*').limit(1)

    return (
        <div>
            <div>Registers (Days Marked): {registerCount} {regError ? `(Error: ${regError.message})` : ''}</div>
            <div>Student Records: {attendanceCount} {attError ? `(Error: ${attError.message})` : ''}</div>
            {sample && sample.length > 0 && (
                <pre className="text-[10px] mt-2 bg-black/20 p-1 rounded overflow-auto">
                    Sample: {JSON.stringify(sample[0], null, 2)}
                </pre>
            )}
        </div>
    )
}

import { getStaffAttendanceStats } from "@/lib/actions/admin-attendance"

import { getStudentAttendanceAudit } from "@/lib/actions/parent-portal"
import { getAuditStudents } from "@/lib/actions/admin-attendance-audit"

async function AuditStudentsListProbe() {
    const students = await getAuditStudents()
    const targetId = '72ee8161-ccdf-4517-9d90-74fa8f8754cb'
    const found = students.find((s: any) => s.id === targetId)

    return (
        <div>
            <div>Total Accessible: {students.length}</div>
            <div>Target Student Found in List?: {found ? 'YES' : 'NO'}</div>
            <pre className="text-[10px] bg-black/20 p-1 rounded overflow-auto max-h-40">
                {JSON.stringify(students.slice(0, 3), null, 2)}
            </pre>
        </div>
    )
}

async function AuditLogProbe() {
    const supabase = createClient()
    // The ID found in the sample
    const targetId = '72ee8161-ccdf-4517-9d90-74fa8f8754cb'

    // 1. Who is this?
    const { data: student } = await supabase.from('students').select('full_name, class_id').eq('id', targetId).single()

    // 2. Try the action
    const auditRes = await getStudentAttendanceAudit(targetId)

    return (
        <div>
            <div>Target ID: {targetId}</div>
            <div>Name: {student?.full_name || 'Unknown'}</div>
            <div className="mt-2">Action Result:</div>
            <pre className="text-[10px] bg-black/20 p-1 rounded overflow-auto max-h-40">
                {JSON.stringify(auditRes, null, 2)}
            </pre>
        </div>
    )
}

export default async function DebugRegisterPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Not authenticated</div>

    // Fetch Profile for Tenant ID
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    const userTenantId = profile?.tenant_id || "UNKNOWN"

    // 1. Get Assigned Class Info
    const assignedClass = await getAssignedClass()

    // 2. Get All Classes & Counts
    const { data: allClasses } = await supabase.from('classes').select('id, name, grade_level, tenant_id')

    // 3. Get Student Counts per Class
    const classCounts: Record<string, number> = {}
    if (allClasses) {
        for (const cls of allClasses) {
            const { count } = await supabase
                .from('students')
                .select('*', { count: 'exact', head: true })
                .eq('class_id', cls.id)
            classCounts[cls.id] = count || 0
        }
    }

    // 4. Sample Students
    const { data: sampleStudents } = await supabase
        .from('students')
        .select('id, full_name, class_id, tenant_id')
        .limit(10)

    return (
        <div className="p-8 bg-black text-white font-mono text-xs whitespace-pre-wrap">
            <h1>Register Debug (Deep Dive)</h1>

            <section className="mb-8 border p-4">
                <h2 className="text-xl font-bold text-blue-400">1. Current User Context</h2>
                <div>ID: {user.id}</div>
                <div>Email: {user.email}</div>
                <div className="text-yellow-400 font-bold">User Tenant ID: {userTenantId} (From Profile)</div>
            </section>

            <section className="mb-8 border p-4">
                <h2 className="text-xl font-bold text-green-400">2. All Classes & Student Counts</h2>
                <table className="w-full text-left">
                    <thead>
                        <tr>
                            <th className="p-2 border">Name</th>
                            <th className="p-2 border">Class ID</th>
                            <th className="p-2 border">Tenant ID</th>
                            <th className="p-2 border">Student Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allClasses?.map(c => (
                            <tr key={c.id} className={assignedClass.data?.id === c.id ? "bg-blue-900" : ""}>
                                <td className="p-2 border">{c.name} {assignedClass.data?.id === c.id ? "(YOURS)" : ""}</td>
                                <td className="p-2 border text-gray-500 text-[10px]">{c.id}</td>
                                <td className={`p-2 border text-[10px] ${c.tenant_id !== userTenantId ? "text-red-500 font-bold" : "text-gray-500"}`}>{c.tenant_id}</td>
                                <td className="p-2 border font-bold text-yellow-400">{classCounts[c.id]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="mb-8 border p-4">
                <h2 className="text-xl font-bold text-pink-400">3. Sample Students (Check IDs & Tenants)</h2>
                <pre>{JSON.stringify(sampleStudents, null, 2)}</pre>
            </section>

            <section className="mb-8 border p-4">
                <h2 className="text-xl font-bold text-orange-400">4. Schema Check (student_attendance)</h2>
                {/* This section will fail if we can't run SQL, but we can try to select one row and see keys */}
                <SchemaProbe />
            </section>
        </div>
    )
}

async function SchemaProbe() {
    const supabase = createClient()
    // Try to get one row to see structure, or if empty, getting columns via error might work?
    // Actually, asking Supabase for columns via RPC is hard without setup.
    // Let's try to select 'register_id' and see if it errors.
    const { error: regIdError } = await supabase.from('student_attendance').select('register_id').limit(1)
    const { error: classIdError } = await supabase.from('student_attendance').select('class_id').limit(1)

    // 5. Admin Stats Check
    const stats = await getStaffAttendanceStats()

    // 6. Direct Staff Check
    const { count: staffCount } = await supabase.from('staff_attendance').select('*', { count: 'exact', head: true })

    return (
        <div className="space-y-4">
            <div>Has 'register_id'? {regIdError ? "NO (" + regIdError.message + ")" : "YES"}</div>
            <div>Has 'class_id'? {classIdError ? "NO (" + classIdError.message + ")" : "YES"}</div>

            <div className="border p-2 mt-4">
                <h3 className="font-bold text-cyan-300">Staff Attendance (Raw DB)</h3>
                <div>Total Records: {staffCount}</div>
            </div>

            <div className="border p-2 mt-4">
                <h3 className="font-bold text-green-300">Visible Profiles (RLS Check)</h3>
                <ProfilesProbe />
            </div>

            <div className="border p-2 mt-4">
                <h3 className="font-bold text-purple-300">Admin Stats Action Output</h3>
                <pre className="text-[10px] overflow-auto max-h-60">{JSON.stringify(stats, null, 2)}</pre>
            </div>
        </div>
    )
}


