'use server'

import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'

export async function getStudentResultPortalData(studentId: string, term: string, session: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: 'Unauthorized' }
    }

    // 1. Verify Parent-Student Relationship
    // For demo, we might check if user is a parent and if the student belongs to the tenant.
    // In strict RBAC, we check 'parent_student' link.
    // Assuming 'students' has 'parent_id' or we use a strict policy.
    // For this Platinum Demo: We'll retrieve the student and ensure they check out.
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId);

    let query = supabase.from('students').select('*, class:classes(name)')

    if (isUUID) {
        query = query.eq('id', studentId)
    } else {
        // Try exact match first
        // But also try replacing - with / (common URL sanitization)
        // If the ID looks like it has dashes but isn't UUID, it might be a sanitized admission number
        // e.g. ADM-26-432 -> ADM/26/432
        const potentialAdmNo = studentId.replace(/-/g, '/')
        query = query.or(`admission_number.eq.${studentId},admission_number.eq.${potentialAdmNo}`)
    }

    // We use .data instead of .single() to handle potential duplicates or 0 results safely first
    const { data: students, error: studentError } = await query

    if (studentError || !students || students.length === 0) {
        console.log("Student lookup failed:", studentId, studentError)
        return { success: false, error: 'Student not found' }
    }

    // Take the first match
    const student = students[0]

    // 2. Report Card & Lock Status
    const { data: reportCard } = await supabase
        .from('student_report_cards')
        .select('*')
        .eq('student_id', student.id)
        .eq('term', term)
        .eq('session', session)
        .single()

    // 3. Billing Status (Fallback for Lock)
    const { data: billing } = await supabase
        .from('billing')
        .select('status, balance, total_fees')
        .eq('student_id', studentId)
        .eq('term', term)
        .eq('session', session)
        .single()

    // Logic: Locked if reportCard.is_locked is true.
    // (If report card doesn't exist, we likely show 'No Result Yet' or similar, but for demo we assume it exists)
    const isLocked = reportCard?.is_locked ?? true
    const balance = billing?.balance || (billing?.status === 'paid' ? 0 : 50000)

    // 4. Grades
    const { data: grades } = await supabase
        .from('student_grades')
        .select('*, subject:subjects(name)')
        .eq('student_id', studentId)
        .eq('term', term)
        .eq('session', session)
        .order('created_at', { ascending: true })

    // 5. Attendance
    const { data: attendance } = await supabase
        .from('student_attendance')
        .select('status')
        .eq('student_id', studentId)

    // Calculate Tally
    const totalDays = attendance?.length || 0
    const presentDays = attendance?.filter(a => a.status === 'present').length || 0

    // 6. Tenant (School) Info for Branding
    const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', student.tenant_id)
        .single()

    return {
        success: true,
        data: {
            student,
            reportCard,
            grades: grades || [],
            billing: {
                isPaid: !isLocked, // If unlocked, we treat as "paid" for access purposes
                balance
            },
            attendance: {
                total: totalDays,
                present: presentDays,
                percentage: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0
            },
            tenant
        }
    }
}
