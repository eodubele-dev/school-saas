import { createClient } from "@/lib/supabase/server"
import { AcademicWizard } from "@/components/setup/academic-wizard"
import { redirect } from "next/navigation"

export default async function AcademicSetupPage({ params }: { params: { domain: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect(`/${params.domain}/login`)

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return <div className="p-8 text-center text-red-500">Access Denied: Admin Rights Required.</div>
    }

    return (
        <div className="flex flex-col h-full bg-slate-950 p-6 space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-white tracking-tight">Academic Configuration</h1>
                <p className="text-slate-400">Configure classes, subjects, and grading standards for your school.</p>
            </div>

            <div className="flex-1 bg-slate-900/50 border border-white/5 rounded-2xl backdrop-blur-sm overflow-hidden">
                <AcademicWizard domain={params.domain} />
            </div>
        </div>
    )
}
