'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isWithinRadius } from '@/lib/utils/geolocation'
import { revalidatePath } from 'next/cache'
import { logActivity } from '@/lib/actions/audit'

interface ClockInResult {
    success: boolean
    verified?: boolean
    distance?: number
    error?: string
    auditLogId?: string
    debug?: { expected: SchoolLocation; actual: { latitude: number; longitude: number } }
}

interface IpGeoResult {
    country: string | null
    city: string | null
    latitude: number | null
    longitude: number | null
}

/**
 * Resolve approximate geographic location from an IP address.
 * Uses ip-api.com (free tier, no API key, 45 req/min).
 * Returns null fields on failure — never throws.
 */
async function resolveIpGeolocation(ip: string): Promise<IpGeoResult> {
    const empty: IpGeoResult = { country: null, city: null, latitude: null, longitude: null }
    if (!ip || ip === 'unknown' || ip.startsWith('192.168') || ip.startsWith('10.') || ip === '127.0.0.1' || ip === '::1') {
        // Private / loopback IP — cannot geolocate, treat as neutral
        return empty
    }
    try {
        const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,lat,lon`, { cache: 'no-store' })
        if (!res.ok) return empty
        const json = await res.json()
        if (json.status !== 'success') return empty
        return { country: json.country, city: json.city, latitude: json.lat, longitude: json.lon }
    } catch {
        return empty
    }
}

interface SchoolLocation {
    latitude: number
    longitude: number
    radius_meters: number
    trusted_ips?: string[]
    attendance_pin?: string
}

/**
 * Clock in staff with GPS verification
 */
export async function clockInStaff(
    latitude: number,
    longitude: number,
    date?: string,
    pin?: string,
    tenantId?: string
): Promise<ClockInResult> {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'Not authenticated' }
        }

        // Get tenant ID (Filter by provided tenantId to support multi-school profiles)
        const profileQuery = supabase
            .from('profiles')
            .select('tenant_id, role')
            .eq('id', user.id)
        
        if (tenantId) {
            profileQuery.eq('tenant_id', tenantId)
        }

        const { data: profile } = await profileQuery.maybeSingle()

        if (!profile) {
            return { success: false, error: 'Staff profile not found for this school context.' }
        }

        // Verify user is institutional staff
        const staffRoles = ['teacher', 'admin', 'principal', 'owner', 'bursar', 'librarian', 'registrar', 'staff']
        if (!staffRoles.includes(profile.role)) {
            return { success: false, error: `Role '${profile.role}' is not authorized for institutional clock-in.` }
        }

        // Get school location & Trusted IPs
        const schoolLocation = await getSchoolCoordinates(profile.tenant_id)
        if (!schoolLocation) {
            return { success: false, error: 'School location not configured' }
        }

        // 1. Capture Forensic Metadata
        const { headers } = await import('next/headers')
        const headerList = headers()
        const ip = headerList.get('x-forwarded-for')?.split(',')[0] || 
                   headerList.get('x-real-ip') || 
                   'unknown'
        const userAgent = headerList.get('user-agent') || 'unknown'
        
        const isFromTrustedIP = schoolLocation.trusted_ips?.includes(ip)
        const storedPin = schoolLocation.attendance_pin
        const isFromPin = pin && storedPin && String(storedPin).trim() === String(pin).trim()

        let verificationMethod = 'gps'
        if (isFromTrustedIP) verificationMethod = 'trusted_ip'
        if (isFromPin) verificationMethod = 'pin'

        // 2. Verify Location ONLY if NOT on trusted network or using valid PIN
        let { verified, distance } = isWithinRadius(
            latitude,
            longitude,
            schoolLocation.latitude,
            schoolLocation.longitude,
            schoolLocation.radius_meters
        )

        if (isFromTrustedIP || isFromPin) {
            console.log(`[ClockIn] Bypass active. Method: ${verificationMethod}`)
            verified = true
            distance = 0 // On-site via Bypass
        }

        if (!verified) {
            // Forensic Flagging of failed verification
            const logResponse = await logActivity(
                'Security',
                'FAILED_LOCATION_VERIFICATION',
                `Institutional breach blocked. Staff attempted clock-in from ${Math.round(distance)}m away. IP: ${ip}`,
                'profiles',
                user.id,
                null,
                { latitude, longitude, distance, radius: schoolLocation.radius_meters, ip, userAgent, attempted_pin: pin }
            )

            const auditLogId = logResponse && 'data' in logResponse && logResponse.data ? logResponse.data.id : undefined

            return {
                success: false,
                verified: false,
                distance,
                auditLogId,
                error: pin ? "Incorrect Security Pin. Access Denied." : `You are ${Math.round(distance)}m away from school. You must be within ${schoolLocation.radius_meters}m to clock in.`,
                debug: {
                    expected: schoolLocation,
                    actual: { latitude, longitude }
                }
            }
        }

        // 3. Record attendance with Forensic Metadata
        //    SECURITY: Time is ALWAYS server-generated UTC (NOW()). Never trust client time.
        const today = date || new Date().toLocaleDateString('en-CA')
        const serverNow = new Date() // UTC timestamp — used as TIMESTAMPTZ
        // Retain legacy TIME column for backward compat with older queries
        const legacyCheckInTime = `${serverNow.getUTCHours().toString().padStart(2, '0')}:${serverNow.getUTCMinutes().toString().padStart(2, '0')}:${serverNow.getUTCSeconds().toString().padStart(2, '0')}`

        // 3a. IP Geolocation (non-blocking parallel lookup for spoofing detection)
        const ipGeo = await resolveIpGeolocation(ip)

        // 3b. Calculate spoofing risk: compare IP location to GPS claim
        let spoofingRisk = 'low'
        let ipGeoDistance: number | null = null
        if (ipGeo.latitude !== null && ipGeo.longitude !== null) {
            const { distance: geoDistance } = isWithinRadius(
                latitude, longitude,
                ipGeo.latitude, ipGeo.longitude,
                999999 // We just want the distance, not the boolean
            )
            ipGeoDistance = Math.round(geoDistance / 1000) // convert m to km
            if (ipGeoDistance > 50) spoofingRisk = 'high'
            else if (ipGeoDistance > 10) spoofingRisk = 'medium'
        }

        if (spoofingRisk !== 'low') {
            console.warn(`[ClockIn] Spoofing risk: ${spoofingRisk}. GPS says ${latitude},${longitude} but IP (${ip}) resolves to ${ipGeo.city}, ${ipGeo.country} (~${ipGeoDistance}km away).`)
        }

        const { error } = await supabase
            .from('staff_attendance')
            .upsert({
                tenant_id: profile.tenant_id,
                staff_id: user.id,
                date: today,
                status: 'present',
                check_in_time: legacyCheckInTime,   // Legacy TIME column (UTC)
                check_in_at: serverNow.toISOString(), // New TIMESTAMPTZ (authoritative)
                check_out_time: null,
                check_out_at: null,
                latitude,
                longitude,
                distance_meters: distance,
                location_verified: true,
                check_in_ip: ip,
                verification_method: verificationMethod,
                device_info: userAgent,
                ip_country: ipGeo.country,
                ip_city: ipGeo.city,
                ip_latitude: ipGeo.latitude,
                ip_longitude: ipGeo.longitude,
                ip_geo_distance_km: ipGeoDistance,
                spoofing_risk: spoofingRisk
            }, {
                onConflict: 'staff_id,date,tenant_id'
            })

        if (error) {
            console.error('Error recording clock-in:', error)
            return { success: false, error: error.message }
        }


        // 4. Auto-activate Class Register (if Form Teacher)
        let registerId = null;
        if (profile.role === 'teacher') {
            const { data: formClass } = await supabase
                .from('classes')
                .select('id')
                .eq('form_teacher_id', user.id)
                .maybeSingle()

            if (formClass) {
                // Create/Get Register
                const { data: register, error: regError } = await supabase
                    .from('attendance_registers')
                    .upsert({
                        tenant_id: profile.tenant_id,
                        class_id: formClass.id,
                        date: today,
                        marked_by: user.id,
                        marked_at_latitude: latitude,
                        marked_at_longitude: longitude,
                        is_within_geofence: true
                    }, {
                        onConflict: 'class_id, date'
                    })
                    .select('id')
                    .single()

                if (register) {
                    registerId = register.id
                } else if (regError) {
                    console.error("Auto-register creation failed:", regError)
                }
            }
        }

        // Forensic Recording in Audit Log (Non-blocking)
        logActivity(
            'System',
            'CLOCK_IN',
            `Staff clocked in successfully. Distance: ${Math.round(distance)}m. ${registerId ? 'Class Register Activated.' : ''}`,
            'profiles',
            user.id
        ).catch(err => console.error("Audit log failed:", err))

        // Force revalidation to clear Next.js caches
        revalidatePath('/dashboard/attendance')
        revalidatePath('/[domain]/dashboard/attendance', 'page')
        
        return { success: true, verified: true, distance }
    } catch (error: any) {
        console.error('Error in clockInStaff:', error.message || error)
        return { success: false, error: error.message || 'Verification system timeout' }
    }
}

/**
 * Clock out staff
 */
export async function clockOutStaff(
    latitude: number = 0,
    longitude: number = 0,
    date?: string,
    tenantId?: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return { success: false, error: 'Not authenticated' }
        }

        const today = date || new Date().toLocaleDateString('en-CA')
        const serverNow = new Date() // Server-generated UTC
        const legacyCheckOutTime = `${serverNow.getUTCHours().toString().padStart(2, '0')}:${serverNow.getUTCMinutes().toString().padStart(2, '0')}:${serverNow.getUTCSeconds().toString().padStart(2, '0')}`

        const { headers } = await import('next/headers')
        const headerList = headers()
        const ip = headerList.get('x-forwarded-for')?.split(',')[0] || 
                   headerList.get('x-real-ip') || 
                   'unknown'

        const query = supabase
            .from('staff_attendance')
            .update({ 
                check_out_time: legacyCheckOutTime,  // Legacy TIME column (UTC)
                check_out_at: serverNow.toISOString(), // New TIMESTAMPTZ (authoritative)
                check_out_ip: ip,
            })
            .eq('staff_id', user.id)
            .eq('date', today)
        
        if (tenantId) {
            query.eq('tenant_id', tenantId)
        }

        const { error } = await query

        if (error) {
            console.error('Error recording clock-out:', error)
            return { success: false, error: error.message }
        }

        // Forensic Recording in Audit Log (Non-blocking)
        logActivity(
            'System',
            'CLOCK_OUT',
            `Staff clocked out successfully. Identity confirmed.`,
            'profiles',
            user.id
        ).catch(err => console.error("Audit log failed:", err))

        revalidatePath('/dashboard/attendance')
        revalidatePath('/[domain]/dashboard/attendance', 'page')
        
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
        // Correctly fetch from tenants table to match Admin Settings
        const { data, error } = await supabase
            .from('tenants')
            .select('geofence_lat, geofence_lng, geofence_radius_meters, settings, theme_config')
            .eq('id', tenantId)
            .single()

        if (error || !data) {
            // Fallback for missing settings column
            const { data: fallbackData } = await supabase
                .from('tenants')
                .select('geofence_lat, geofence_lng, geofence_radius_meters, theme_config')
                .eq('id', tenantId)
                .single()
            
            if (!fallbackData || !fallbackData.geofence_lat || !fallbackData.geofence_lng) {
                console.error('School location not found in tenants config:', error)
                return null
            }

            return {
                latitude: Number(fallbackData.geofence_lat),
                longitude: Number(fallbackData.geofence_lng),
                radius_meters: fallbackData.geofence_radius_meters || 500,
                trusted_ips: (fallbackData.theme_config as any)?.settings?.trusted_ips || [],
                attendance_pin: (fallbackData.theme_config as any)?.settings?.attendance_pin || null
            }
        }

        return {
            latitude: Number(data.geofence_lat),
            longitude: Number(data.geofence_lng),
            radius_meters: data.geofence_radius_meters || 500,
            trusted_ips: (data.settings as any)?.trusted_ips || (data.theme_config as any)?.settings?.trusted_ips || [],
            attendance_pin: (data.settings as any)?.attendance_pin || (data.theme_config as any)?.settings?.attendance_pin || null
        }

    } catch (error) {
        console.error('Error fetching school coordinates:', error)
        return null
    }
}

/**
 * Get staff clock-in status for today
 */
export async function getClockInStatus(date?: string, tenantId?: string): Promise<{
    success: boolean
    data?: {
        clockedIn: boolean
        clockInTime: string | null      // Legacy UTC HH:MM:SS — use clockInAt for display
        clockOutTime: string | null
        clockInAt: string | null         // TIMESTAMPTZ ISO string — authoritative
        clockOutAt: string | null
        distance: number | null
        verified: boolean
        verificationMethod?: string
        spoofingRisk?: string
        ipLocation?: string | null       // "City, Country" for admin audit UI
    }
    error?: string
}> {
    const supabaseAdmin = createAdminClient()

    try {
        const { data: { user } } = await createClient().auth.getUser()
        if (!user) {
            return { success: false, error: 'Not authenticated' }
        }

        const today = date || new Date().toLocaleDateString('en-CA') // YYYY-MM-DD

        // SECURITY: tenantId is MANDATORY for multi-school support.
        // If missing, we return no record to prevent cross-tenant data leakage.
        if (!tenantId) {
            return {
                success: true,
                data: {
                    clockedIn: false,
                    clockInTime: null,
                    clockOutTime: null,
                    clockInAt: null,
                    clockOutAt: null,
                    distance: null,
                    verified: false
                }
            }
        }

        const query = supabaseAdmin
            .from('staff_attendance')
            .select('check_in_time, check_out_time, check_in_at, check_out_at, distance_meters, location_verified, verification_method, spoofing_risk, ip_city, ip_country')
            .eq('staff_id', user.id)
            .eq('date', today)
            .eq('tenant_id', tenantId)

        const { data, error } = await query.maybeSingle()

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
                    clockInAt: null,
                    clockOutAt: null,
                    distance: null,
                    verified: false
                }
            }
        }

        const ipLocation = data.ip_city && data.ip_country
            ? `${data.ip_city}, ${data.ip_country}`
            : null

        return {
            success: true,
            data: {
                clockedIn: !data.check_out_at && !data.check_out_time,
                clockInTime: data.check_in_time,
                clockOutTime: data.check_out_time,
                clockInAt: data.check_in_at || null,   // Authoritative TIMESTAMPTZ
                clockOutAt: data.check_out_at || null,
                distance: data.distance_meters ? Number(data.distance_meters) : null,
                verified: data.location_verified || false,
                verificationMethod: data.verification_method || 'gps',
                spoofingRisk: data.spoofing_risk || 'low',
                ipLocation
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
    limit: number = 30,
    tenantId?: string
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
    const supabaseAdmin = createAdminClient()

    try {
        const { data: { user } } = await createClient().auth.getUser()
        if (!user) {
            return { success: false, error: 'Not authenticated' }
        }

        const query = supabaseAdmin
            .from('staff_attendance')
            .select('date, status, check_in_time, check_out_time, distance_meters, location_verified')
            .eq('staff_id', user.id)
            .order('date', { ascending: false })
            .limit(limit)
        
        if (tenantId) {
            query.eq('tenant_id', tenantId)
        }

        const { data, error } = await query

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
