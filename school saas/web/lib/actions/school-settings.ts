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
        // Optimization: Fetch both sources in parallel or use a fallback approach
        // We only really need theme_config for merging. Top-level settings is a legacy sync target.
        let { data: tenant, error: fetchError } = await supabase
            .from('tenants')
            .select('theme_config, settings')
            .eq('id', profile.tenant_id)
            .single()

        // Safety Fallback: If the fetch failed (e.g. settings column missing),
        // we must fetch ONLY theme_config to avoid overwriting existing branding data.
        if (fetchError || !tenant) {
            const { data: fallbackTenant } = await supabase
                .from('tenants')
                .select('theme_config')
                .eq('id', profile.tenant_id)
                .single()
            
            if (fallbackTenant) {
                tenant = { theme_config: fallbackTenant.theme_config, settings: (fallbackTenant.theme_config as any)?.settings || {} }
            } else {
                throw new Error("Institutional profile not found")
            }
        }

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

        // Perform the primary update (Geofence + Theme Config)
        const { error: updateError } = await supabase
            .from('tenants')
            .update(updates)
            .eq('id', profile.tenant_id)

        if (updateError) {
            // Handle specific error where theme_config might be missing (rare) or RLS issues
            throw updateError
        }

        // Fire-and-forget legacy sync (don't await)
        // This keeps the response snappy while ensuring backward compatibility
        supabase.from('tenants')
            .update({ settings: mergedSettings })
            .eq('id', profile.tenant_id)
            .then(({ error }) => {
                if (error) console.warn("Legacy settings sync failed:", error.message)
            })

        // Non-blocking revalidation
        // We trigger it but don't await it to avoid blocking the UI response
        const revalidatePromise = Promise.resolve().then(() => revalidatePath('/[domain]/dashboard/settings', 'page'))

        return { 
            success: true, 
            message: "Geofence settings updated successfully",
            data: {
                geofence_lat: latitude,
                geofence_lng: longitude,
                geofence_radius_meters: radius,
                settings: mergedSettings
            }
        }
    } catch (error: any) {
        console.error("Geofence Update Error:", error)
        
        // Final fallback: if the whole update failed because of theme_config/settings mismatch,
        // try to at least save the coordinates
        try {
            await supabase.from('tenants').update({
                geofence_lat: latitude,
                geofence_lng: longitude,
                geofence_radius_meters: radius
            }).eq('id', profile.tenant_id)
            return { success: true, message: "Geofence saved (Settings sync skipped)" }
        } catch (inner) {
            return { success: false, error: "Failed to save settings. Check database connection." }
        }
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
