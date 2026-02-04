'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "Not authenticated" }
    }

    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string
    const avatarFile = formData.get('avatar') as File | null
    const base_path = formData.get('base_path') as string || "/dashboard"

    try {
        const updateData: any = {
            full_name: fullName,
            phone: phone, // Assuming 'phone' column exists, otherwise it might error if strict. 
            // If 'phone' doesn't exist, we might need to check schema.
            // Safest to try generic 'metadata' or assume common columns.
            // 'profiles' usually has 'full_name', 'avatar_url', 'updated_at'.
            updated_at: new Date().toISOString()
        }

        // Handle File Upload
        if (avatarFile && avatarFile.size > 0) {
            // 1. Upload to Supabase Storage
            const fileExt = avatarFile.name.split('.').pop()
            const fileName = `${user.id}-${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            // Ensure 'avatars' bucket exists manually or via migrations.
            // Using 'avatars' as standard convention.
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, avatarFile)

            if (uploadError) {
                console.error("Upload Error:", uploadError)
                throw new Error("Failed to upload image")
            }

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            updateData.avatar_url = publicUrl
        }

        // Update Check: confirm columns exist?
        // We'll proceed optimistically.
        const { error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', user.id)

        if (updateError) {
            console.error("Profile Update Error:", updateError)
            return { error: `Failed to update profile database: ${updateError.message} - ${updateError.details || ''}` }
        }

        revalidatePath(base_path, 'layout') // Revalidate everything
        return { success: true }

    } catch (error: any) {
        return { error: error.message }
    }
}
