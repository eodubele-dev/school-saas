import { createClient } from "@/lib/supabase/server"

export default async function DebugCBTPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Not Logged In</div>

    // 1. Check Profile
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    // 2. Check Student Link via User ID
    const { data: studentByUser } = await supabase.from('students').select('*').eq('user_id', user.id).maybeSingle()

    // 3. Check Student Link via Email
    let studentByEmail = null
    if (profile?.email) {
        const { data: s } = await supabase.from('students').select('*').eq('email', profile.email).maybeSingle()
        studentByEmail = s
    }

    // 4. Check Class Info if we found a student
    const student = studentByUser || studentByEmail
    let classInfo = null
    if (student?.class_id) {
        const { data: cls } = await supabase.from('classes').select('*').eq('id', student.class_id).single()
        classInfo = cls
    }

    return (
        <div className="p-8 text-white space-y-6 bg-slate-900 min-h-screen font-mono text-sm">
            <h1 className="text-xl font-bold text-red-500">CBT Debugger</h1>

            <section className="bg-black/50 p-4 rounded border border-white/10">
                <h2 className="text-lg font-bold mb-2">1. Auth User</h2>
                <pre>{JSON.stringify(user, null, 2)}</pre>
            </section>

            <section className="bg-black/50 p-4 rounded border border-white/10">
                <h2 className="text-lg font-bold mb-2">2. Profile Table</h2>
                <pre>{JSON.stringify(profile, null, 2)}</pre>
            </section>

            <section className="bg-black/50 p-4 rounded border border-white/10">
                <h2 className="text-lg font-bold mb-2">3. Student (via user_id)</h2>
                {studentByUser ? (
                    <pre className="text-green-400">{JSON.stringify(studentByUser, null, 2)}</pre>
                ) : (
                    <div className="text-red-400">No student record found with user_id = {user.id}</div>
                )}
            </section>

            <section className="bg-black/50 p-4 rounded border border-white/10">
                <h2 className="text-lg font-bold mb-2">4. Student (via email)</h2>
                {studentByEmail ? (
                    <pre className="text-green-400">{JSON.stringify(studentByEmail, null, 2)}</pre>
                ) : (
                    <div className="text-red-400">No student record found with email = {profile?.email || user.email}</div>
                )}
            </section>

            <section className="bg-black/50 p-4 rounded border border-white/10">
                <h2 className="text-lg font-bold mb-2">5. Class Enrollment</h2>
                {classInfo ? (
                    <pre className="text-green-400">{JSON.stringify(classInfo, null, 2)}</pre>
                ) : (
                    <div className="text-red-400">Class link broken. Class ID: {student?.class_id || 'NULL'}</div>
                )}
            </section>

            <section className="bg-blue-900/20 p-6 rounded-xl border border-blue-500/30">
                <h2 className="text-xl font-bold text-blue-400 mb-4">Self Healing Tools</h2>

                {(!studentByUser && studentByEmail) && (
                    <div className="space-y-4">
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded text-sm">
                            <strong>Issue Detected:</strong> Your email matches a student record, but your account is not linked.
                        </div>
                        <form action={async () => {
                            "use server"
                            const { linkStudentAccount } = await import("@/lib/actions/debug-tools")
                            await linkStudentAccount()
                        }}>
                            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-lg shadow-blue-500/20 transition-all">
                                Link My Account Now
                            </button>
                        </form>
                    </div>
                )}

                {studentByUser && !classInfo && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded text-sm">
                        <strong>Critical Issue:</strong> Your student record exists but is not assigned to a class. Please contact your school administrator to assign you to a class.
                    </div>
                )}

                {studentByUser && classInfo && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-sm flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        System Health Status: <strong>OPTIMAL</strong>
                    </div>
                )}

                {/* Manual Fallback */}
                <div className="mt-8 pt-8 border-t border-white/10">
                    <h3 className="text-sm font-bold text-slate-400 mb-2">Manual Link (Fallback)</h3>
                    <p className="text-xs text-slate-500 mb-4">If your email doesn't match, enter your Admission Number directly.</p>

                    <form action={async (formData) => {
                        "use server"
                        const { linkStudentByAdmissionNumber } = await import("@/lib/actions/debug-tools")
                        await linkStudentByAdmissionNumber(formData)
                    }} className="flex gap-2">
                        <input
                            name="admission_number"
                            type="text"
                            placeholder="e.g. 2024/001"
                            className="bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                            required
                        />
                        <button type="submit" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded transition-all">
                            Force Link
                        </button>
                    </form>
                </div>
            </section>
        </div>
    )
}
