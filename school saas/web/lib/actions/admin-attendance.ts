'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Get Staff Attendance Statistics for Today or Specific Date with Pagination and Search
 */
export async function getStaffAttendanceStats(date?: string, page = 1, pageSize = 20, search = '') {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Not authenticated" }

        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
        if (!profile) return { success: false, error: "Profile not found" }

        const queryDate = date || new Date().toISOString().split('T')[0]

        // 1. Fetch ALL matching staff for global stats
        let staffQuery = supabase
            .from('profiles')
            .select('id, full_name, role, avatar_url')
            .in('role', ['teacher', 'admin', 'principal'])
            .eq('tenant_id', profile.tenant_id)
        
        const { data: allStaff, error: staffError } = await staffQuery
        if (staffError) throw staffError

        // 2. Fetch attendance for queryDate
        const { data: attendance, error: attError } = await supabase
            .from('staff_attendance')
            .select('*')
            .eq('tenant_id', profile.tenant_id)
            .eq('date', queryDate)

        if (attError) throw attError

        // 3. Global Stats Calculation (Whole School)
        const totalStaff = allStaff.length
        let globalPresent = 0
        let globalLate = 0
        const attendanceMap = new Map()

        attendance.forEach(record => {
            attendanceMap.set(record.staff_id, record)
            globalPresent++
            if (record.check_in_time) {
                const [hours, minutes] = record.check_in_time.split(':').map(Number)
                if (hours > 8 || (hours === 8 && minutes > 5)) {
                    globalLate++
                }
            }
        })

        // 4. Paginated & Filtered List for Table
        let filteredStaff = allStaff
        if (search) {
            const lowSearch = search.toLowerCase()
            filteredStaff = allStaff.filter(s => 
                (s.full_name || '').toLowerCase().includes(lowSearch)
            )
        }

        const totalFiltered = filteredStaff.length
        const from = (page - 1) * pageSize
        const to = from + pageSize
        const staffSlice = filteredStaff.slice(from, to)

        // Build list for the table using pre-fetched attendance
        const attendanceList = staffSlice.map(s => {
            const record = attendanceMap.get(s.id)
            let status = 'absent'
            let checkIn = null
            let checkOut = null
            let isLate = false

            if (record) {
                status = 'present'
                checkIn = record.check_in_time
                checkOut = record.check_out_time
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
                photo_url: s.avatar_url,
                status,
                checkInTime: checkIn,
                checkOutTime: checkOut,
                isLate
            }
        })

        return {
            success: true,
            data: {
                summary: { 
                    total: totalStaff, 
                    present: globalPresent, 
                    late: globalLate, 
                    absent: totalStaff - globalPresent 
                },
                list: attendanceList,
                pagination: {
                    page,
                    pageSize,
                    totalCount: totalFiltered,
                    totalPages: Math.ceil(totalFiltered / pageSize)
                }
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
                staff:profiles!staff_leave_requests_staff_id_fkey(full_name, avatar_url, role)
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
