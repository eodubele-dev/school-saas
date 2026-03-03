import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { VoiceDashboard } from "@/components/admin/voice/voice-dashboard"
import { getPTAMeetings, getFeedbackSubmissions } from "@/lib/actions/voice"

export default async function AdminVoicePage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    const { data: roleData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!roleData || (roleData.role !== 'admin' && roleData.role !== 'owner')) {
        redirect('/dashboard')
    }

    const [ptaMeetings, feedbackSubmissions] = await Promise.all([
        getPTAMeetings(),
        getFeedbackSubmissions()
    ])

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-emerald-500/5 pointer-events-none -z-10 rounded-3xl" />
            <div className="flex justify-between items-center">
                <div className="space-y-1 relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-xl z-0" />
                    <h1 className="text-4xl font-black tracking-tight relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                        Voice & Feedback
                    </h1>
                    <p className="text-slate-400 text-lg relative z-10 font-medium">Manage PTA scheduling requests and monitor parent feedback.</p>
                </div>
            </div>

            <div className="relative z-10">
                <VoiceDashboard
                    ptaMeetings={ptaMeetings}
                    feedbackSubmissions={feedbackSubmissions}
                />
            </div>
        </div>
    )
}
