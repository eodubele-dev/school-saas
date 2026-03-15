'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProfileUpdateRequest(studentId: string, description: string) {
    const supabase = createClient()
    
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Not authenticated" }

        // 1. Get Profile (to get tenant_id)
        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', user.id)
            .single()

        if (!profile) return { success: false, error: "Profile not found" }

        // 2. Validate student belongs to parent
        const { data: student } = await supabase
            .from('students')
            .select('id')
            .eq('id', studentId)
            .eq('parent_id', user.id)
            .single()

        if (!student) return { success: false, error: "Student record not found or access denied" }

        // 3. Create Request
        const { error } = await supabase
            .from('profile_update_requests')
            .insert({
                tenant_id: profile.tenant_id,
                student_id: studentId,
                requested_by: user.id,
                description,
                status: 'pending'
            })

        if (error) {
            console.error('[ProfileRequest] Error:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/dashboard/profile', 'page')
        return { success: true }
    } catch (error: any) {
        console.error('[ProfileRequest] System Error:', error)
        return { success: false, error: "An unexpected error occurred" }
    }
}
