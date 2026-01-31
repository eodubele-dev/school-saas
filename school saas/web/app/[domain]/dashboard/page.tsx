import { createClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { TeacherDashboard } from "@/components/dashboard/teacher-dashboard"
import { ParentDashboard } from "@/components/dashboard/parent-dashboard"

export default async function DashboardPage({
    params,
    searchParams
}: {
    params: { domain: string }
    searchParams: { role?: string }
}) {
    const { domain } = params

    // 1. Try to get role from query param (for demo/testing purposes)
    let role = searchParams.role

    // 2. If not in query, try to fetch from real authenticated user
    if (!role) {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profile) {
                role = profile.role
            }
        }
    }

    // 3. Default to 'admin' if no role found (or redirect to login in real app)
    // For this setup demo, we default to admin to show the UI.
    const currentRole = role || 'admin'

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">Welcome to {domain}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground bg-slate-100 px-2 py-1 rounded">
                        Current View: <span className="font-bold uppercase">{currentRole}</span>
                    </span>
                    {/* Dev Helper to switch views */}
                    <div className="flex gap-1">
                        <a href="?role=admin" className="text-xs text-blue-500 hover:underline px-1">Admin</a>
                        <a href="?role=teacher" className="text-xs text-blue-500 hover:underline px-1">Teacher</a>
                        <a href="?role=parent" className="text-xs text-blue-500 hover:underline px-1">Parent</a>
                    </div>
                </div>
            </div>

            {currentRole === 'admin' && <AdminDashboard />}
            {currentRole === 'teacher' && <TeacherDashboard />}
            {currentRole === 'parent' && <ParentDashboard />}

            {/* Fallback for unknown role */}
            {!['admin', 'teacher', 'parent'].includes(currentRole) && (
                <div className="p-4 border border-red-200 bg-red-50 text-red-600 rounded-md">
                    Unknown role: {currentRole}
                </div>
            )}
        </div>
    )
}
