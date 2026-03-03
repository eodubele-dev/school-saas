'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

// ADMIN ACTIONS

export async function getAdminSchoolEvents() {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

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
            .order('start_date', { ascending: true })

        if (error) throw error

        return { success: true, events: data as SchoolEvent[] }
    } catch (error) {
        console.error("Admin Calendar Error:", error)
        return { success: false, events: [] }
    }
}

export async function createSchoolEvent(eventData: Omit<SchoolEvent, 'id'>) {
    const supabase = createClient()
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Not authenticated")

        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', user.id)
            .single()

        if (!profile) throw new Error("No tenant profile found")

        const { error } = await supabase
            .from('school_events')
            .insert({ ...eventData, tenant_id: profile.tenant_id })

        if (error) throw error

        revalidatePath('/dashboard', 'layout')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function updateSchoolEvent(id: string, eventData: Partial<Omit<SchoolEvent, 'id'>>) {
    const supabase = createClient()
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Not authenticated")

        const { error } = await supabase
            .from('school_events')
            .update(eventData)
            .eq('id', id)

        if (error) throw error

        revalidatePath('/dashboard', 'layout')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export async function deleteSchoolEvent(id: string) {
    const supabase = createClient()
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Not authenticated")

        const { error } = await supabase
            .from('school_events')
            .delete()
            .eq('id', id)

        if (error) throw error

        revalidatePath('/dashboard', 'layout')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
