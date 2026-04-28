import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/login')
    }

    // Check for System Owner role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'super-admin') {
        redirect('/403')
    }

    return (
        <div className="bg-[#0A0A0B] min-h-screen">
            {children}
        </div>
    )
}
