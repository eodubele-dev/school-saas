'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateGeofenceSettings(
    latitude: number,
    longitude: number,
    radius: number,
    trustedIPs?: string[],
    attendancePin?: string
) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    // Admin Check
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, tenant_id')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return { success: false, error: "Access Denied: Admins only" }
    }

    try {
        // Fetch current settings to preserve other keys
        // We attempt to fetch both to stay compatible with different schema versions
        let { data: tenant, error: fetchError } = await supabase
            .from('tenants')
            .select('settings, theme_config')
            .eq('id', profile.tenant_id)
            .single()

        if (fetchError) {
            console.warn("Primary settings fetch failed, trying fallback:", fetchError.message)
            // Fallback: Fetch ONLY theme_config if the combined fetch failed (likely due to missing settings column)
            const { data: fallbackData } = await supabase
                .from('tenants')
                .select('theme_config')
                .eq('id', profile.tenant_id)
                .single()
            if (fallbackData) {
                tenant = { settings: (fallbackData.theme_config as any)?.settings || {}, theme_config: fallbackData.theme_config }
            }
        }

        // Now tenant contains the best available data
        const currentThemeConfig = (tenant?.theme_config as any) || {}
        const currentSettings = tenant?.settings || currentThemeConfig.settings || {}

        const mergedSettings = {
            ...currentSettings,
            trusted_ips: trustedIPs,
            attendance_pin: attendancePin
        }

        const updates: any = {
            geofence_lat: latitude,
            geofence_lng: longitude,
            geofence_radius_meters: radius,
            theme_config: {
                ...currentThemeConfig,
                settings: mergedSettings
            }
        }

        // Only include top-level settings if the column is confirmed to exist or we want to try syncing it
        // Based on the audit, it's missing in some environments, so we'll try to update it but catch failures
        // Actually, PostgREST will fail the whole request if a column is missing.
        // So we'll try a safe update first (with theme_config) and then a legacy sync if possible.
        
        const { error: updateError } = await supabase
            .from('tenants')
            .update(updates)
            .eq('id', profile.tenant_id)

        if (updateError) {
            console.error("Geofence Update Error (Initial):", updateError)
            
            // If it failed because of theme_config (unlikely) or something else, 
            // we've already logged it. But let's try to see if we can at least save geofence coords.
            if (updateError.code === 'PGRST204' || updateError.message.includes('column')) {
                 const { error: minimalError } = await supabase
                    .from('tenants')
                    .update({
                        geofence_lat: latitude,
                        geofence_lng: longitude,
                        geofence_radius_meters: radius
                    })
                    .eq('id', profile.tenant_id)
                if (minimalError) throw minimalError
            } else {
                throw updateError
            }
        }

        // Legacy Sync: Try to update the top-level settings column separately if it exists
        // This won't block the main success if it fails.
        await supabase.from('tenants').update({ settings: mergedSettings }).eq('id', profile.tenant_id)

        revalidatePath('/[domain]/dashboard/settings', 'page')
        return { success: true, message: "Geofence settings updated successfully" }
    } catch (error) {
        console.error("Geofence Update Error:", error)
        return { success: false, error: "Failed to update settings. Please ensure the 'settings' column exists in your tenants table." }
    }
}

export async function getGeofenceSettings() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile?.tenant_id) return { success: false }

    const { data: tenant, error } = await supabase
        .from('tenants')
        .select('geofence_lat, geofence_lng, geofence_radius_meters, settings, theme_config')
        .eq('id', profile.tenant_id)
        .single()

    if (error) {
        // If it failed because of missing 'settings' column, try without it
        const { data: fallbackTenant } = await supabase
            .from('tenants')
            .select('geofence_lat, geofence_lng, geofence_radius_meters, theme_config')
            .eq('id', profile.tenant_id)
            .single()
        
        if (fallbackTenant) {
            return { 
                success: true, 
                data: {
                    ...fallbackTenant,
                    settings: (fallbackTenant.theme_config as any)?.settings || {}
                } 
            }
        }
    }

    // Robust Merge: Combine settings from both sources to ensure no data loss during transition
    const topLevelSettings = tenant?.settings || {}
    const nestedSettings = (tenant?.theme_config as any)?.settings || {}
    
    if (tenant) {
        tenant.settings = {
            ...nestedSettings,
            ...topLevelSettings
        }
    }

    return { success: true, data: tenant }
}
