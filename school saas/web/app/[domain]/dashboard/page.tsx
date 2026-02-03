import { createClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { TeacherDashboard } from "@/components/dashboard/teacher-dashboard"
import { ParentDashboard } from "@/components/dashboard/parent-dashboard"
import { BursarDashboard } from "@/components/dashboard/bursar-dashboard"
import { getBursarStats } from "@/lib/actions/finance"
import { ExecutiveTour } from "@/components/onboarding/executive-tour"

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

    // 3. Use real auth role or redirect (Middleware should handle redirect, but safe fallback)
    if (!role) {
        // This case should be rare if middleware is working
        // Debugging info
        const supabase = createClient()
        const { data: { user: debugUser } } = await supabase.auth.getUser()

        return (
            <div className="flex h-screen items-center justify-center flex-col gap-4">
                <div className="text-center">
                    <h2 className="text-lg font-semibold">Access Denied</h2>
                    <p className="text-muted-foreground">You do not have a role assigned.</p>
                </div>
                <div className="p-4 bg-slate-100 rounded text-xs font-mono text-left max-w-lg text-slate-900 overflow-auto">
                    <p><strong>Debug Info:</strong></p>
                    <p>User ID: {debugUser?.id}</p>
                    <p>Email: {debugUser?.email}</p>
                    <p>Detected Role: {role || 'null'}</p>
                    <p>Params Domain: {domain}</p>
                    <p>Metadata: {JSON.stringify(debugUser?.user_metadata, null, 2)}</p>
                </div>
            </div>
        )
    }

    const currentRole = role

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white/50 hidden">Dashboard</h2>
                    <p className="text-muted-foreground hidden">Welcome to {domain}</p>
                </div>
                {/* PROD READY: Removed Dev Toggle */}
            </div>

            {currentRole === 'admin' && (
                <>
                    <ExecutiveTour enabled={true} />
                    <AdminDashboard />
                </>
            )}
            {currentRole === 'teacher' && <TeacherDashboard />}
            {currentRole === 'parent' && <ParentDashboard />}
            {currentRole === 'bursar' && <BursarDashboard stats={await getBursarStats()} />}

            {/* Fallback for unknown role */}
            {!['admin', 'teacher', 'parent'].includes(currentRole) && (
                <div className="p-4 border border-red-200 bg-red-50 text-red-600 rounded-md">
                    Unknown role: {currentRole}
                </div>
            )}
        </div>
    )
}
