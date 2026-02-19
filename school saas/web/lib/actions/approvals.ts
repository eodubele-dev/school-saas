'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface PendingItem {
    id: string
    type: 'lesson_plan' | 'gradebook' | 'attendance_dispute'
    title: string
    submitted_by: string
    submitted_at: string
    status: string
    details?: any // Extra data like content or subject/class
    student_id?: string
    lesson_type?: 'lesson_plan' | 'lesson_note'
}

/**
 * Fetch Pending Approvals
 * Cubes: Lesson Plans (pending), Gradebooks (is_locked=true but not yet officially "approved" if we add that layer, 
 * for now we just treat locked gradebooks as items to review)
 */
export async function getPendingApprovals() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, data: [] }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()

    // 1. Fetch Pending Lesson Plans
    const { data: plans } = await supabase
        .from('lesson_plans')
        .select(`
            id, title, created_at, approval_status, content, type, subject, week, term,
            teacher:profiles!teacher_id(full_name),
            class:classes!class_id(name)
        `)
        .eq('tenant_id', profile?.tenant_id)
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false })

    console.log("DEBUG: Admin Tenant:", profile?.tenant_id)
    console.log("DEBUG: Pending Plans Query Result:", plans?.length)
    if (plans) {
        console.log("DEBUG: Plan IDs:", plans.map((p: any) => p.id))
        console.log("DEBUG: Plan Types:", plans.map((p: any) => p.type))
    } else {
        console.log("DEBUG: Plans is null or undefined")
    }

    const pendingItems: PendingItem[] = []

    if (plans) {
        plans.forEach((p: any) => {
            // Handle teacher as object or array depending on client inference
            const teacherName = Array.isArray(p.teacher)
                ? p.teacher[0]?.full_name
                : p.teacher?.full_name

            pendingItems.push({
                id: p.id,
                type: 'lesson_plan',
                title: p.title,
                submitted_by: teacherName || 'Unknown Teacher',
                submitted_at: new Date(p.created_at).toISOString(),
                status: 'pending',
                lesson_type: p.type || 'lesson_plan',
                details: {
                    content: p.content,
                    subject: p.subject,
                    class_name: Array.isArray(p.class) ? p.class[0]?.name : p.class?.name,
                    week: p.week,
                    term: p.term
                }
            })
        })
    }

    // 2. Fetch Locked Gradebooks
    // We query student_grades for classes that are locked AND not approved
    const { data: lockedGrades } = await supabase
        .from('student_grades')
        .select('class_id, subject_id, term, session, total_score, ca1_score, exam_score, classes(name), subjects(name), approval_status')
        .eq('tenant_id', profile?.tenant_id)
        .eq('is_locked', true)
        .neq('approval_status', 'approved') // Only fetch pending or rejected (if re-locked)

    const processedGradebooks = new Set()
    if (lockedGrades) {
        // Group by class+subject+term+session to form a "gradebook" unit
        const groups: Record<string, any[]> = {}

        lockedGrades.forEach((g: any) => {
            const key = `${g.class_id}|${g.subject_id}|${g.term}|${g.session}`
            if (!groups[key]) groups[key] = []
            groups[key].push(g)
        })

        Object.entries(groups).forEach(([key, paramGrades]) => {
            if (processedGradebooks.has(key)) return
            processedGradebooks.add(key)

            const first = paramGrades[0]
            const totalStudents = paramGrades.length
            const passedStudents = paramGrades.filter(g => (g.total_score || 0) >= 50).length
            const totalScoreSum = paramGrades.reduce((sum, g) => sum + (g.total_score || 0), 0)

            // Calculate Stats
            const passRate = totalStudents > 0 ? Math.round((passedStudents / totalStudents) * 100) : 0
            const classAverage = totalStudents > 0 ? (totalScoreSum / totalStudents).toFixed(1) : "0.0"
            const missingCA1 = paramGrades.filter(g => g.ca1_score === null || g.ca1_score === undefined).length
            const missingExam = paramGrades.filter(g => g.exam_score === null || g.exam_score === undefined).length

            pendingItems.push({
                id: key, // Use pipe as separator to avoid UUID conflict
                type: 'gradebook',
                title: `${first.classes?.name} - ${first.subjects?.name}`,
                submitted_by: 'Teacher Submitting...', // In real app, we'd fetch the teacher assigned to this subject
                submitted_at: new Date().toISOString(),
                status: 'pending',
                details: {
                    class_id: first.class_id,
                    subject_id: first.subject_id,
                    term: first.term,
                    session: first.session,
                    stats: {
                        passRate,
                        classAverage,
                        missingCA1,
                        missingExam,
                        studentCount: totalStudents
                    }
                }
            })
        })
    }

    // 3. Fetch Pending Incident Logs
    const { data: incidents } = await supabase
        .from('incident_logs')
        .select(`
            id, title, description, type, created_at, student_id,
            student:students(full_name),
            teacher:profiles!recorded_by(full_name)
        `)
        .eq('tenant_id', profile?.tenant_id)
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: false })

    if (incidents) {
        incidents.forEach((inc: any) => {
            pendingItems.push({
                id: inc.id,
                type: 'incident_log' as any, // Adding a temporary cast or I should update the type
                title: `${inc.type.toUpperCase()}: ${inc.title}`,
                submitted_by: inc.teacher?.full_name || 'Unknown',
                submitted_at: inc.created_at,
                status: 'pending',
                student_id: inc.student_id,
                details: {
                    description: inc.description,
                    student_name: inc.student?.full_name,
                    type: inc.type
                }
            })
        })
    }

    // 4. Fetch Pending Attendance Disputes
    const { data: disputes } = await supabase
        .from('staff_attendance_disputes')
        .select(`
            id, reason, distance_detected, created_at,
            staff:profiles!staff_id(full_name)
        `)
        .eq('tenant_id', profile?.tenant_id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

    if (disputes) {
        disputes.forEach((d: any) => {
            pendingItems.push({
                id: d.id,
                type: 'attendance_dispute',
                title: `Attendance Dispute: ${Math.round(d.distance_detected)}m Failure`,
                submitted_by: d.staff?.full_name || 'Unknown Staff',
                submitted_at: d.created_at,
                status: 'pending',
                details: {
                    reason: d.reason,
                    distance: d.distance_detected,
                    id: d.id
                }
            })
        })
    }

    return { success: true, data: pendingItems }
}

/**
 * Approve Item
 */
export async function approveItem(domain: string, id: string, type: 'lesson_plan' | 'gradebook') {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()

    if (type === 'lesson_plan') {
        const { error } = await supabase
            .from('lesson_plans')
            .update({
                approval_status: 'approved',
                approved_by: user.id,
                approved_at: new Date().toISOString(),
                rejection_reason: null
            })
            .eq('id', id)

        if (error) return { success: false, error: error.message }
    } else if (type === 'gradebook') {
        // PERMIT: Update approval status for all grades in this "batch"
        const [classId, subjectId, term, session] = id.split('|')

        const { error } = await supabase
            .from('student_grades')
            .update({
                approval_status: 'approved',
                approved_by: user.id,
                approved_at: new Date().toISOString(),
                rejection_reason: null
            })
            .eq('class_id', classId)
            .eq('subject_id', subjectId)
            .eq('term', term)
            .eq('session', session)

        if (error) return { success: false, error: error.message }
    } else if (type === ('incident_log' as any)) {
        const { error } = await supabase
            .from('incident_logs')
            .update({ status: 'approved' })
            .eq('id', id)
        if (error) return { success: false, error: error.message }
    } else if (type === 'attendance_dispute') {
        // 1. Mark Dispute as Approved
        const { data: dispute, error: dError } = await supabase
            .from('staff_attendance_disputes')
            .update({
                status: 'approved',
                resolved_by: user.id,
                resolved_at: new Date().toISOString()
            })
            .eq('id', id)
            .select('*')
            .single()

        if (dError) return { success: false, error: dError.message }

        // 2. Perform Manual Override Clock-In
        const { error: aError } = await supabase
            .from('staff_attendance')
            .insert({
                tenant_id: profile?.tenant_id,
                staff_id: dispute.staff_id,
                date: new Date().toISOString().split('T')[0],
                check_in_time: new Date().toTimeString().split(' ')[0],
                check_in_verified: true,
                verification_method: 'manual_override',
                metadata: {
                    approved_by: user.id,
                    dispute_id: id,
                    original_distance: dispute.distance_detected
                }
            })

        if (aError) return { success: false, error: aError.message }
    }

    // Audit Log
    await supabase.from('audit_logs').insert({
        tenant_id: profile?.tenant_id,
        action: 'approve',
        entity_type: type,
        entity_id: id,
        performed_by: user.id,
        details: { previous_status: 'pending' }
    })

    revalidatePath('/dashboard/admin/approvals')
    revalidatePath(`/${domain}/dashboard/teacher/attendance`)
    revalidatePath('/dashboard/attendance')
    return { success: true }
}

/**
 * Reject Item
 */
export async function rejectItem(domain: string, id: string, type: 'lesson_plan' | 'gradebook', reason: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()

    if (type === 'lesson_plan') {
        const { error } = await supabase
            .from('lesson_plans')
            .update({
                approval_status: 'rejected',
                rejection_reason: reason,
                approved_by: null,
                approved_at: null
            })
            .eq('id', id)

        if (error) return { success: false, error: error.message }
    } else if (type === 'gradebook') {
        const [classId, subjectId, term, session] = id.split('|')

        const { error } = await supabase
            .from('student_grades')
            .update({
                approval_status: 'rejected',
                rejection_reason: reason,
                is_locked: false, // Unlock for teacher to fix
                approved_by: null,
                approved_at: null
            })
            .eq('class_id', classId)
            .eq('subject_id', subjectId)
            .eq('term', term)
            .eq('session', session)

        if (error) return { success: false, error: error.message }
    } else if (type === 'attendance_dispute') {
        const { error } = await supabase
            .from('staff_attendance_disputes')
            .update({
                status: 'declined',
                resolved_by: user.id,
                resolved_at: new Date().toISOString()
            })
            .eq('id', id)
        if (error) return { success: false, error: error.message }
    }

    // Audit Log
    await supabase.from('audit_logs').insert({
        tenant_id: profile?.tenant_id,
        action: 'reject',
        entity_type: type,
        entity_id: id,
        performed_by: user.id,
        details: { reason }
    })

    revalidatePath('/dashboard/admin/approvals')
    revalidatePath(`/${domain}/dashboard/teacher/attendance`)
    revalidatePath('/dashboard/attendance')
    return { success: true }
}

/**
 * Get Compliance Analytics Stats
 */
export async function getComplianceStats() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { submissionRate: 0, laggingStaff: 0, totalStaff: 0 }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()

    // 1. Get Total Unique Assignments (Class + Subject)
    const { data: assignments } = await supabase
        .from('subject_assignments')
        .select('class_id, subject')
        .eq('tenant_id', profile?.tenant_id)

    // 2. Get Locked Assignments
    const { data: lockedGrades } = await supabase
        .from('student_grades')
        .select('class_id, subject_id')
        .eq('tenant_id', profile?.tenant_id)
        .eq('is_locked', true)

    // 3. Get Total Staff (Teachers)
    const { data: teachers } = await supabase
        .from('profiles')
        .select('id')
        .eq('tenant_id', profile?.tenant_id)
        .eq('role', 'teacher')

    if (!assignments || assignments.length === 0) {
        return { submissionRate: 0, laggingStaff: 0, totalStaff: teachers?.length || 0 }
    }

    const totalAssignments = assignments.length

    // Create a set of unique locked (class_id + subject_id)
    const lockedSet = new Set()
    lockedGrades?.forEach((g: any) => {
        lockedSet.add(`${g.class_id}-${g.subject_id}`)
    })

    const submittedCount = Array.from(lockedSet).length
    const submissionRate = Math.round((submittedCount / totalAssignments) * 100)

    // Estimate lagging staff (this is an approximation based on unlocked assignments)
    const laggingStaff = Math.max(0, (teachers?.length || 0) - submittedCount)

    return {
        submissionRate,
        laggingStaff: Math.min(laggingStaff, teachers?.length || 0),
        totalStaff: teachers?.length || 0
    }
}
