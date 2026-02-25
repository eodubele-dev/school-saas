import { CommunicationDashboard } from "@/components/communication/communication-dashboard"
import { createClient } from "@/lib/supabase/server"

export default async function CommunicationPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let role = 'parent'
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role) {
            role = profile.role.toLowerCase().trim()
        }
    }

    return (
        <div className="p-6">
            <CommunicationDashboard initialRole={role} />
        </div>
    )
}
