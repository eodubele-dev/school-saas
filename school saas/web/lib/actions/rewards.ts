'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getUnseenBadges() {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        // Resolve Student ID
        let { data: student } = await supabase.from('students').select('id').eq('user_id', user.id).maybeSingle()
        if (!student) {
            const { data: profile } = await supabase.from('profiles').select('email').eq('id', user.id).single()
            if (profile) {
                const { data: s } = await supabase.from('students').select('id').eq('email', profile.email).maybeSingle()
                if (s) student = s
            }
        }
        if (!student) {
            // Fallback for dev/demo if no link
            const { data: s } = await supabase.from('students').select('id').limit(1).single()
            if (s) student = s
        }

        if (!student) return { success: false, error: "Student not found" }

        // Fetch unseen badges
        // We use a try-catch on the query in case 'is_unseen' column doesn't exist yet
        try {
            const { data: badges, error } = await supabase
                .from('achievements')
                .select(`
                    *,
                    awarded_by_profile:awarded_by(full_name)
                `)
                .eq('student_id', student.id)
                .eq('is_unseen', true)
                .order('awarded_at', { ascending: false })

            if (error) {
                // If error is about missing column, return empty
                if (error.code === '42703') { // Undefined column
                    return { success: true, data: [] }
                }
                throw error
            }

            return {
                success: true,
                data: badges.map(b => ({
                    ...b,
                    awarded_by_name: b.awarded_by_profile?.full_name || 'School Admin'
                }))
            }

        } catch (queryError) {
            console.error("Error querying badges:", queryError)
            return { success: true, data: [] } // Fail safe to empty
        }

    } catch (error) {
        console.error("Error in getUnseenBadges:", error)
        return { success: false, error: "Failed to fetch badges" }
    }
}

export async function markBadgeAsSeen(badgeId: string) {
    const supabase = createClient()

    try {
        const { error } = await supabase
            .from('achievements')
            .update({ is_unseen: false })
            .eq('id', badgeId)

        if (error) throw error

        revalidatePath('/dashboard/student')
        return { success: true }
    } catch (error) {
        console.error("Error marking badge as seen:", error)
        return { success: false, error: "Failed to update badge" }
    }
}
