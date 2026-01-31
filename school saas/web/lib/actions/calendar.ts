'use server'

import { createClient } from '@/lib/supabase/server'

export interface SchoolEvent {
    id: string
    title: string
    description: string
    start_date: string
    end_date: string
    type: 'academic' | 'holiday' | 'sports' | 'exam'
    is_public: boolean
}

export async function getSchoolEvents() {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        // Get tenant ID from profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', user.id)
            .single()

        if (!profile) return []

        const { data, error } = await supabase
            .from('school_events')
            .select('*')
            .eq('tenant_id', profile.tenant_id)
            .eq('is_public', true)
            .order('start_date', { ascending: true })

        if (error) {
            console.error("Calendar Error:", error)
            return []
        }

        return data as SchoolEvent[]
    } catch {
        return []
    }
}
