"use server"

import { createClient as createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

/**
 * Update the Kiosk Master PIN for a school.
 * Stored within the tenant settings JSONB.
 */
export async function updateKioskPin(tenantId: string, newPin: string) {
    if (!/^\d{4}$/.test(newPin)) {
        return { success: false, error: "PIN must be exactly 4 digits." }
    }

    const supabase = createServerClient()

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, tenant_id')
        .eq('id', user.id)
        .single()

    const isHighLevel = ['admin', 'owner', 'proprietor'].includes(profile?.role || '')
    if (!isHighLevel || profile?.tenant_id !== tenantId) {
        return { success: false, error: "Unauthorized: High-level access required." }
    }

    // 2. Fetch current tenant to merge theme_config
    const { data: tenant } = await supabase
        .from('tenants')
        .select('theme_config')
        .eq('id', tenantId)
        .single()

    const themeConfig = tenant?.theme_config || {}
    const currentSettings = (themeConfig as any).settings || {}
    
    const updatedThemeConfig = {
        ...themeConfig,
        settings: {
            ...currentSettings,
            kiosk_pin: newPin
        }
    }

    // 3. Update Tenant
    const { error } = await supabase
        .from('tenants')
        .update({ theme_config: updatedThemeConfig })
        .eq('id', tenantId)

    if (error) {
        console.error("[updateKioskPin] Error:", error)
        return { success: false, error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
}

/**
 * Get the current Kiosk PIN for a school.
 */
export async function getKioskPin(tenantId: string) {
    const supabase = createServerClient()

    const { data: tenant, error } = await supabase
        .from('tenants')
        .select('theme_config')
        .eq('id', tenantId)
        .single()

    if (error) return { success: false, error: error.message }
    
    const settings = (tenant?.theme_config as any)?.settings || {}

    // Default to '1234' if not set
    return { 
        success: true, 
        pin: settings.kiosk_pin || "1234" 
    }
}
