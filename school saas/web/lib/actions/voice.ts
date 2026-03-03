"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getPTAMeetings() {
    const supabase = createClient()

    const { data: meetings, error } = await supabase
        .from('pta_meetings')
        .select(`
            *,
            student:students(full_name, class:classes(name), passport_url)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching PTA meetings:', error)
        return []
    }

    if (!meetings || meetings.length === 0) return []

    // Fetch parent profiles manually
    const parentIds = Array.from(new Set(meetings.filter(m => m.parent_id).map(m => m.parent_id)))
    let profilesMap: Record<string, any> = {}

    if (parentIds.length > 0) {
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, role')
            .in('id', parentIds)

        if (profiles) {
            profilesMap = profiles.reduce((acc, profile) => {
                acc[profile.id] = profile
                return acc
            }, {} as Record<string, any>)
        }
    }

    return meetings.map(m => ({
        ...m,
        parent: profilesMap[m.parent_id] || { full_name: 'Unknown Parent' }
    }))
}

export async function getFeedbackSubmissions() {
    const supabase = createClient()

    const { data: feedbackData, error } = await supabase
        .from('feedback_submissions')
        .select(`*`)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching feedback:', error)
        return []
    }

    if (!feedbackData || feedbackData.length === 0) return []

    // Fetch user profiles manually
    const userIds = Array.from(new Set(feedbackData.filter(f => f.user_id).map(f => f.user_id)))
    let profilesMap: Record<string, any> = {}

    if (userIds.length > 0) {
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, role')
            .in('id', userIds)

        if (profiles) {
            profilesMap = profiles.reduce((acc, profile) => {
                acc[profile.id] = profile
                return acc
            }, {} as Record<string, any>)
        }
    }

    return feedbackData.map(f => ({
        ...f,
        user: f.user_id ? profilesMap[f.user_id] || { full_name: 'Unknown User' } : { full_name: 'Anonymous' }
    }))
}

export async function updatePTAMeetingStatus(meetingId: string, status: 'scheduled' | 'completed' | 'cancelled') {
    const supabase = createClient()

    const { error } = await supabase
        .from('pta_meetings')
        .update({ status })
        .eq('id', meetingId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/dashboard/admin/voice')
    return { success: true }
}
