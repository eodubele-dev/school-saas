'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    const fullNameValue = formData.get('fullName')
    const phoneValue = formData.get('phone')
    const avatarFile = formData.get('avatar') as File | null
    const base_path = formData.get('base_path') as string || "/dashboard"

    const fullName = typeof fullNameValue === 'string' ? fullNameValue.trim() : ""
    const phone = typeof phoneValue === 'string' ? phoneValue.trim() : ""

    if (!fullName) {
        return { error: "Full name is required" }
    }

    console.log(`[updateProfile] Attempting update for user ${user.id}. New Name: "${fullName}"`)

    try {
        // 1. Sync to Auth Metadata FIRST
        const { error: authError } = await supabase.auth.updateUser({
            data: { full_name: fullName }
        })

        if (authError) {
            console.error("[updateProfile] Auth Metadata Sync Error:", authError)
            // We continue anyway as profiles table is the primary source for the UI
        } else {
            console.log("[updateProfile] Auth Metadata synced successfully")
        }

        const updateData: any = {
            full_name: fullName,
            phone: phone,
            updated_at: new Date().toISOString()
        }

        // 2. Handle File Upload
        if (avatarFile && avatarFile.size > 0) {
            console.log(`[updateProfile] Processing avatar upload for ${user.id}`)
            const fileExt = avatarFile.name.split('.').pop()
            const fileName = `${user.id}-${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, avatarFile)

            if (uploadError) {
                console.error("[updateProfile] Storage Upload Error:", uploadError)
                throw new Error("Failed to upload image to storage")
            }

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            updateData.avatar_url = publicUrl
        }

        // 3. Update Database Profile
        const { data, error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', user.id)
            .select()

        if (updateError) {
            console.error("[updateProfile] Database Update Error:", updateError)
            return { error: `Database error: ${updateError.message}` }
        }

        if (!data || data.length === 0) {
            console.error(`[updateProfile] No rows updated for user ${user.id}. Possible RLS or ID mismatch.`)
            return { error: "Failed to update profile: Record not found or permission denied." }
        }

        console.log(`[updateProfile] Successfully updated profiles table. Rows affected: ${data.length}`)

        // 4. Clear Caches
        revalidatePath('/', 'layout')
        revalidatePath(base_path, 'page')

        return { success: true }

    } catch (error: any) {
        return { error: error.message }
    }
}
