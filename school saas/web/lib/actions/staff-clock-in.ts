'use server'

import { createClient } from '@/lib/supabase/server'
import { isWithinRadius } from '@/lib/utils/geolocation'
import { revalidatePath } from 'next/cache'
import { logActivity } from '@/lib/actions/audit'

interface ClockInResult {
    success: boolean
    verified?: boolean
    distance?: number
    error?: string
    auditLogId?: string
}

interface SchoolLocation {
    latitude: number
    longitude: number
    radius_meters: number
}

/**
 * Clock in staff with GPS verification
 */
export async function clockInStaff(
    latitude: number,
    longitude: number
): Promise<ClockInResult> {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'Not authenticated' }
        }

        // Get tenant ID
        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id, role')
            .eq('id', user.id)
            .single()

        if (!profile) {
            return { success: false, error: 'Profile not found' }
        }

        // Verify user is staff (teacher or admin)
        if (!['teacher', 'admin'].includes(profile.role)) {
            return { success: false, error: 'Only teachers and admins can clock in' }
        }

        // Get school location
        const schoolLocation = await getSchoolCoordinates(profile.tenant_id)
        if (!schoolLocation) {
            return { success: false, error: 'School location not configured' }
        }

        // Verify location
        const { verified, distance } = isWithinRadius(
            latitude,
            longitude,
            schoolLocation.latitude,
            schoolLocation.longitude,
            schoolLocation.radius_meters
        )

        if (!verified) {
            // Forensic Flagging of failed verification
            const { data: logEntry } = await logActivity(
                'Security',
                'FAILED_LOCATION_VERIFICATION',
                `Institutional breach blocked. Staff attempted clock-in from ${Math.round(distance)}m away.`,
                'profiles',
                user.id,
                null,
                { latitude, longitude, distance, radius: schoolLocation.radius_meters }
            )

            return {
                success: false,
                verified: false,
                distance,
                auditLogId: logEntry?.id,
                error: `You are ${Math.round(distance)}m away from school. You must be within ${schoolLocation.radius_meters}m to clock in.`
            }
        }

        // Record attendance
        const today = new Date().toISOString().split('T')[0]
        const now = new Date()
        const checkInTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`

        const { error } = await supabase
            .from('staff_attendance')
            .upsert({
                tenant_id: profile.tenant_id,
                staff_id: user.id,
                date: today,
                status: 'present',
                check_in_time: checkInTime,
                latitude,
                longitude,
                distance_meters: distance,
                location_verified: true
            }, {
                onConflict: 'staff_id,date'
            })

        if (error) {
            console.error('Error recording clock-in:', error)
            return { success: false, error: error.message }
        }


        // Forensic Recording in Audit Log
        const { data: logEntry } = await logActivity(
            'System',
            'CLOCK_IN',
            `Staff clocked in successfully. Distance: ${Math.round(distance)}m`,
            'profiles',
            user.id
        )

        revalidatePath('/clock-in')
        return { success: true, verified: true, distance, auditLogId: logEntry?.id }

    } catch (error) {
        console.error('Error in clockInStaff:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

/**
 * Clock out staff
 */
export async function clockOutStaff(): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'Not authenticated' }
        }

        const today = new Date().toISOString().split('T')[0]
        const now = new Date()
        const checkOutTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`

        const { error } = await supabase
            .from('staff_attendance')
            .update({ check_out_time: checkOutTime })
            .eq('staff_id', user.id)
            .eq('date', today)

        if (error) {
            console.error('Error recording clock-out:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/clock-in')
        return { success: true }

    } catch (error) {
        console.error('Error in clockOutStaff:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

/**
 * Get school coordinates for a tenant
 */
export async function getSchoolCoordinates(
    tenantId: string
): Promise<SchoolLocation | null> {
    const supabase = createClient()

    try {
        const { data, error } = await supabase
            .from('school_locations')
            .select('latitude, longitude, radius_meters')
            .eq('tenant_id', tenantId)
            .eq('is_primary', true)
            .single()

        if (error || !data) {
            console.error('School location not found:', error)
            return null
        }

        return {
            latitude: Number(data.latitude),
            longitude: Number(data.longitude),
            radius_meters: data.radius_meters
        }

    } catch (error) {
        console.error('Error fetching school coordinates:', error)
        return null
    }
}

/**
 * Get staff clock-in status for today
 */
export async function getClockInStatus(): Promise<{
    success: boolean
    data?: {
        clockedIn: boolean
        clockInTime: string | null
        clockOutTime: string | null
        distance: number | null
        verified: boolean
    }
    error?: string
}> {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'Not authenticated' }
        }

        const today = new Date().toISOString().split('T')[0]

        const { data, error } = await supabase
            .from('staff_attendance')
            .select('check_in_time, check_out_time, distance_meters, location_verified')
            .eq('staff_id', user.id)
            .eq('date', today)
            .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
            console.error('Error fetching clock-in status:', error)
            return { success: false, error: error.message }
        }

        if (!data) {
            return {
                success: true,
                data: {
                    clockedIn: false,
                    clockInTime: null,
                    clockOutTime: null,
                    distance: null,
                    verified: false
                }
            }
        }

        return {
            success: true,
            data: {
                clockedIn: true,
                clockInTime: data.check_in_time,
                clockOutTime: data.check_out_time,
                distance: data.distance_meters ? Number(data.distance_meters) : null,
                verified: data.location_verified || false
            }
        }

    } catch (error) {
        console.error('Error in getClockInStatus:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

/**
 * Get staff attendance history
 */
export async function getStaffAttendanceHistory(
    limit: number = 30
): Promise<{
    success: boolean
    data?: Array<{
        date: string
        status: string
        checkInTime: string | null
        checkOutTime: string | null
        distance: number | null
        verified: boolean
    }>
    error?: string
}> {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'Not authenticated' }
        }

        const { data, error } = await supabase
            .from('staff_attendance')
            .select('date, status, check_in_time, check_out_time, distance_meters, location_verified')
            .eq('staff_id', user.id)
            .order('date', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('Error fetching attendance history:', error)
            return { success: false, error: error.message }
        }

        const history = (data || []).map(record => ({
            date: record.date,
            status: record.status,
            checkInTime: record.check_in_time,
            checkOutTime: record.check_out_time,
            distance: record.distance_meters ? Number(record.distance_meters) : null,
            verified: record.location_verified || false
        }))

        return { success: true, data: history }

    } catch (error) {
        console.error('Error in getStaffAttendanceHistory:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}
