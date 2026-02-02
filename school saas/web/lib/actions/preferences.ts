'use server'

import { createClient } from "@/lib/supabase/server"

// Type definition (aligns with Store)
export type UserPreferences = {
    theme: 'light' | 'dark' | 'system'
    language: string
    font_size: number
    hide_financial_figures: boolean
    notifications: {
        in_app: { security: boolean, academic: boolean, financial: boolean, emergency: boolean }
        email: { security: boolean, academic: boolean, financial: boolean, emergency: boolean }
        sms: { security: boolean, academic: boolean, financial: boolean, emergency: boolean }
    }
}

export async function getUserPreferences() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

    return data
}

export async function updateUserPreferences(preferences: Partial<UserPreferences>) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Not authenticated" }

    // Upsert logic
    const { error } = await supabase
        .from('user_preferences')
        .upsert({
            user_id: user.id,
            ...preferences,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

    if (error) {
        console.error("Failed to update preferences:", error)
        return { success: false, error: error.message }
    }

    return { success: true }
}
