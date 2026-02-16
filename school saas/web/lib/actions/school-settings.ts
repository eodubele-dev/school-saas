'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateGeofenceSettings(
    latitude: number,
    longitude: number,
    radius: number
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
        const { error } = await supabase
            .from('tenants')
            .update({
                geofence_lat: latitude,
                geofence_lng: longitude,
                geofence_radius_meters: radius
            })
            .eq('id', profile.tenant_id)

        if (error) throw error

        revalidatePath('/[domain]/dashboard/settings', 'page')
        return { success: true, message: "Geofence settings updated successfully" }
    } catch (error) {
        console.error("Geofence Update Error:", error)
        return { success: false, error: "Failed to update settings" }
    }
}

export async function getGeofenceSettings() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile?.tenant_id) return { success: false }

    const { data: tenant } = await supabase
        .from('tenants')
        .select('geofence_lat, geofence_lng, geofence_radius_meters')
        .eq('id', profile.tenant_id)
        .single()

    return { success: true, data: tenant }
}
