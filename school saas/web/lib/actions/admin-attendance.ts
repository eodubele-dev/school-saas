'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Get Staff Attendance Statistics for Today
 */
export async function getStaffAttendanceStats() {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Not authenticated" }

        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
        if (!profile) return { success: false, error: "Profile not found" }

        const today = new Date().toISOString().split('T')[0]

        // Fetch all staff (teachers/admins)
        // Schema check: profiles usually has full_name, not first/last in this project version
        const { data: staff, error: staffError } = await supabase
            .from('profiles')
            .select('id, full_name, role, avatar_url')
            .in('role', ['teacher', 'admin', 'principal'])
            .eq('tenant_id', profile.tenant_id)
        // .eq('status', 'active') // Status column not confirmed in schema

        if (staffError) throw staffError

        // Fetch today's attendance
        const { data: attendance, error: attError } = await supabase
            .from('staff_attendance')
            .select('*')
            .eq('tenant_id', profile.tenant_id)
            .eq('date', today)

        if (attError) throw attError

        // Calculate Stats
        const totalStaff = staff.length
        let present = 0
        let late = 0
        const presentIds = new Set()

        attendance.forEach(record => {
            presentIds.add(record.staff_id)
            present++

            // Late logic: after 8:05 AM
            if (record.check_in_time) {
                const [hours, minutes] = record.check_in_time.split(':').map(Number)
                if (hours > 8 || (hours === 8 && minutes > 5)) {
                    late++
                }
            }
        })

        const absent = totalStaff - present

        // Build list for the table
        const attendanceList = staff.map(s => {
            const record = attendance.find(r => r.staff_id === s.id)
            let status = 'absent'
            let checkIn = null
            let isLate = false

            if (record) {
                status = 'present'
                checkIn = record.check_in_time
                if (checkIn) {
                    const [h, m] = checkIn.split(':').map(Number)
                    if (h > 8 || (h === 8 && m > 5)) {
                        status = 'late'
                        isLate = true
                    }
                }
            }

            const names = (s.full_name || '').split(' ')
            const firstName = names[0] || 'Staff'
            const lastName = names.length > 1 ? names.slice(1).join(' ') : ''

            return {
                id: s.id,
                first_name: firstName,
                last_name: lastName,
                role: s.role,
                photo_url: s.avatar_url, // Mapped from avatar_url
                status,
                checkInTime: checkIn,
                isLate
            }
        })

        return {
            success: true,
            data: {
                summary: { total: totalStaff, present, late, absent },
                list: attendanceList
            }
        }

    } catch (error) {
        console.error("Error fetching staff stats:", error)
        return { success: false, error: error instanceof Error ? error.message : "Failed to load stats" }
    }
}

/**
 * Fetch Pending Leave Requests
 */
export async function getPendingLeaveRequests() {
    const supabase = createClient()

    try {
        const { data: requests, error } = await supabase
            .from('staff_leave_requests')
            .select(`
                *,
                staff:profiles(first_name, last_name, avatar_url, role)
            `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })

        if (error) throw error

        return { success: true, data: requests }

    } catch (error) {
        console.error("Error fetching leave requests:", error)
        return { success: false, error: "Failed to load requests" }
    }
}

/**
 * Approve or Reject Leave Request
 */
export async function updateLeaveRequestStatus(requestId: string, status: 'approved' | 'rejected', reason?: string) {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Not authenticated" }

        const { error } = await supabase
            .from('staff_leave_requests')
            .update({
                status: status,
                rejection_reason: reason,
                approved_by: user.id
            })
            .eq('id', requestId)

        if (error) throw error

        revalidatePath('/dashboard/admin/attendance')
        return { success: true }

    } catch (error) {
        console.error("Error updating leave request:", error)
        return { success: false, error: "Failed to update request" }
    }
}
