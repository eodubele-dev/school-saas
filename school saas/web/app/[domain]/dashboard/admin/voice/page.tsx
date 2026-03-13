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
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Voice & Feedback
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">Manage PTA scheduling requests and monitor parent feedback.</p>
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
