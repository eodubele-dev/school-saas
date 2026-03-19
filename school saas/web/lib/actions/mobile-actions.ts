'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { markStudentAttendance } from '@/lib/actions/attendance'

export interface Coords {
    lat: number
    lng: number
    accuracy: number
    timestamp: number
}

/**
 * Fetch assigned students for the Teacher Mobile View
 */
export async function getMobileStudents() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, students: [], classId: null }

    // 1. Get classes via DB Form & Allocations
    const [{ data: formClasses }, { data: allocClasses }] = await Promise.all([
        supabase.from('classes').select('id, name').eq('form_teacher_id', user.id),
        supabase.from('teacher_allocations').select('classes(id, name)').eq('teacher_id', user.id)
    ])

    const classMap = new Map<string, { id: string; name: string }>()
    if (formClasses) formClasses.forEach(c => classMap.set(c.id, { id: c.id, name: c.name }))
    if (allocClasses) allocClasses.forEach((a: any) => {
        const cls = Array.isArray(a.classes) ? a.classes[0] : a.classes
        if (cls && !classMap.has(cls.id)) classMap.set(cls.id, { id: cls.id, name: cls.name })
    })

    const classes = Array.from(classMap.values())
    if (classes.length === 0) return { success: true, students: [], classId: null }

    const classIds = classes.map(c => c.id)

    const { data: students } = await supabase
        .from('students')
        .select('id, full_name, photo_url, class_id')
        .in('class_id', classIds)
        .order('full_name')

    return { success: true, students: students || [], classId: classes[0].id }
}

/**
 * Zero-Latency Clock In
 */
export async function staffClockIn(coords: Coords) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    const tenantId = profile?.tenant_id

    // 1. Validate Geofence (Simple Haversine or Database PostGIS in future)
    // For MVP, we fetch settings and do simple JS calc
    const { data: settings } = await supabase
        .from('geofence_settings')
        .select('*')
        .eq('tenant_id', tenantId)
        .single()

    let isWithinRange = true // Default true if no settings
    let distance = 0

    if (settings) {
        distance = calculateDistance(coords.lat, coords.lng, settings.center_lat, settings.center_lng)
        isWithinRange = distance <= settings.radius_meters
    }

    // 2. Insert Attendance Record
    const today = new Date().toISOString().split('T')[0]

    // Check if already clocked in
    const { data: existing } = await supabase
        .from('staff_attendance')
        .select('id')
        .eq('staff_id', user.id)
        .eq('date', today)
        .single()

    if (existing) {
        return { success: false, error: 'Already clocked in for today' }
    }

    const { error } = await supabase
        .from('staff_attendance')
        .insert({
            tenant_id: tenantId,
            staff_id: user.id,
            date: today,
            status: isWithinRange ? 'present' : 'late', // Naive logic: if outside range, maybe flag it? Or just 'present' but unverified. Let's say 'present'.
            check_in_time: new Date().toLocaleTimeString(),
            clock_in_coords: coords,
            is_geofence_verified: isWithinRange
        })

    if (error) return { success: false, error: error.message }

    return { success: true, verified: isWithinRange, distance: Math.round(distance) }
}

/**
 * Offline Sync Batch
 */
export async function syncAttendanceBatch(records: any[]) {
    // Expects array of { student_id, status, date, class_id }
    // In a real app, optimize this to a single upsert or batch call.
    if (!records || records.length === 0) return { success: true }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()

    // Process Queue
    let synced = 0
    const todayDate = new Date().toISOString().split('T')[0]

    for (const record of records) {
        if (!record.studentId || !record.classId) continue;
        
        // Sync to authentic production database function
        const res = await markStudentAttendance(
            record.studentId,
            record.classId,
            todayDate, // Use today's date or exact recorded date if you mapped it
            record.status
        )

        if (res.success) synced++
    }

    return { success: true, count: synced }
}


// Helper: Haversine Formula for distance in meters
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
}
