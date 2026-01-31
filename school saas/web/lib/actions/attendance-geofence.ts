'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface Coordinates {
    lat: number
    lng: number
}

// Haversine Formula for distance in meters
function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);  // deg2rad below
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d * 1000; // Distance in meters
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180)
}

export async function markAttendanceWithGeofence(
    classId: string,
    date: Date,
    currentCoords: Coordinates,
    students: { studentId: string; status: 'present' | 'absent' | 'late' }[]
) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    // 1. Fetch Tenant Geofence Settings
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: "Profile not found" }

    const { data: tenant } = await supabase.from('tenants').select('geofence_lat, geofence_lng, geofence_radius_meters').eq('id', profile.tenant_id).single()

    // 2. Validate Geofence
    let isWithinGeofence = false
    let distance = 0

    if (tenant?.geofence_lat && tenant?.geofence_lng) {
        distance = getDistanceFromLatLonInM(
            currentCoords.lat,
            currentCoords.lng,
            tenant.geofence_lat,
            tenant.geofence_lng
        )
        // Default radius 500m if not set
        const radius = tenant.geofence_radius_meters || 500
        isWithinGeofence = distance <= radius
    } else {
        // If no geofence set, assume true or warning? 
        // For MVP, marking as true but logging.
        isWithinGeofence = true
    }

    if (!isWithinGeofence) {
        return {
            success: false,
            error: `You are ${(distance / 1000).toFixed(2)}km away from the school premises. Please move closer to mark attendance.`
        }
    }

    // 3. Create Register
    const formattedDate = date.toISOString().split('T')[0]

    const { data: register, error: regError } = await supabase
        .from('attendance_registers')
        .insert({
            tenant_id: profile.tenant_id,
            class_id: classId,
            date: formattedDate,
            marked_by: user.id,
            marked_at_latitude: currentCoords.lat,
            marked_at_longitude: currentCoords.lng,
            is_within_geofence: isWithinGeofence
        })
        .select()
        .single()

    if (regError) {
        // Check for duplicate constraint (already marked for this day)
        if (regError.code === '23505') {
            return { success: false, error: "Attendance already marked for this class today." }
        }
        console.error("Register Error:", regError)
        return { success: false, error: "Failed to create register" }
    }

    // 4. Bulk Insert Student Records
    const records = students.map(s => ({
        register_id: register.id,
        student_id: s.studentId,
        status: s.status
    }))

    const { error: recordsError } = await supabase.from('student_attendance').insert(records)

    if (recordsError) {
        console.error("Records Error:", recordsError)
        return { success: false, error: "Failed to save student records" }
    }

    revalidatePath('/[domain]/attendance')
    return { success: true, message: `Attendance marked successfully. Distance: ${Math.round(distance)}m` }
}

export async function getClassStudents(date: Date, classGrade: string) {
    // Helper to fetch students for UI
    const supabase = createClient()
    // Simplified: fetching all students in the class
    // Real app: Ensure filtering by Tenant

    const { data: classes } = await supabase.from('classes').select('id').eq('name', classGrade).single()
    if (!classes) return []

    const { data: students } = await supabase
        .from('students')
        .select('id, full_name')
        .eq('class_id', classes.id)
        .order('full_name')

    return students || []
}
