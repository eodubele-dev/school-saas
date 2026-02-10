'use server'

import { createClient } from '@/lib/supabase/server'
import { ResultData } from '@/types/results'

export async function getStudentResultData(studentId: string, term: string, session: string, nextTermBegins: string = "TBD", dateIssued: string = new Date().toDateString()): Promise<ResultData | null> {
    const supabase = createClient()

    try {
        // 1. Fetch Student Profile & Tenant ID
        const { data: student } = await supabase
            .from('students')
            .select(`
                id, full_name, admission_number, passport_url, house, tenant_id,
                classes (name)
            `)
            .eq('id', studentId)
            .single()

        if (!student) return null

        // Fix for student.classes potentially being an array
        const className = Array.isArray(student.classes)
            ? student.classes[0]?.name
            : (student.classes as any)?.name || 'Unknown Class'

        // 1b. Fetch Tenant Details
        const { data: tenant } = await supabase
            .from('tenants')
            .select('name, address, motto, logo_url, theme_config')
            .eq('id', student.tenant_id)
            .single()

        // 2. Fetch Grades
        const { data: grades } = await supabase
            .from('student_grades')
            .select('*')
            .eq('student_id', studentId)
            .eq('term', term)
            .eq('session', session)

        // Fetch subject names for grades
        const subjectIds = grades?.map(g => g.subject_id) || []
        const { data: subjects } = await supabase
            .from('subjects')
            .select('id, name')
            .in('id', subjectIds)

        const subjectMap = new Map(subjects?.map(s => [s.id, s.name]))

        // 3. Fetch Attendance
        // Simplified Logic: Count entries in student_attendance for this student in this term range.
        const { data: attendance } = await supabase
            .from('student_attendance')
            .select('status')
            .eq('student_id', studentId)

        const totalDays = 60 // Should potentially be dynamic per term/tenant config
        const present = attendance?.filter(a => a.status === 'present').length || 0
        const absent = attendance?.filter(a => a.status === 'absent').length || 0

        // 4. Fetch Report Card (Remarks)
        const { data: reportCard } = await supabase
            .from('student_report_cards')
            .select('*')
            .eq('student_id', studentId)
            .eq('term', term)
            .eq('session', session)
            .single()

        // 5. Construct Data
        const formattedSubjects = grades?.map(g => ({
            name: subjectMap.get(g.subject_id) || 'Unknown Subject',
            ca1: g.ca1,
            ca2: g.ca2,
            exam: g.exam,
            total: g.total,
            grade: g.grade,
            position: g.position?.toString() || '-',
            remarks: g.remarks || ''
        })) || []

        const totalScore = formattedSubjects.reduce((sum, s) => sum + s.total, 0)
        const average = formattedSubjects.length > 0 ? totalScore / formattedSubjects.length : 0

        return {
            student: {
                id: student.id,
                full_name: student.full_name,
                admission_number: student.admission_number || 'N/A',
                passport_url: student.passport_url,
                class_name: className,
                house: student.house
            },
            school_details: {
                name: tenant?.name || 'School Name',
                address: tenant?.address || 'School Address',
                motto: tenant?.motto || 'Excellence',
                logo_url: tenant?.logo_url || '/logo.png',
                theme: {
                    primary_color: tenant?.theme_config?.primary || '#2563eb', // Blue-600 default
                    secondary_color: tenant?.theme_config?.secondary || '#1e293b', // Slate-800 default
                    accent_color: tenant?.theme_config?.accent || '#0ea5e9' // Sky-500 default
                }
            },
            attendance: {
                total_days: totalDays,
                present: present,
                absent: absent
            },
            academic: {
                subjects: formattedSubjects,
                average: parseFloat(average.toFixed(2)),
                total_score: totalScore
            },
            character: {
                affective_domain: reportCard?.affective_domain || {},
                teacher_remark: reportCard?.teacher_remark || "Excellent performance.",
                principal_remark: reportCard?.principal_remark || "Keep it up."
            },
            term_info: {
                term,
                session,
                next_term_begins: nextTermBegins,
                date_issued: dateIssued
            }
        }

    } catch (error) {
        console.error("Error generating result:", error)
        return null
    }
}

export async function checkStudentFeeStatus(studentId: string, term: string, session: string) {
    const supabase = createClient()

    // Check for any PENDING invoice for this student for the term
    const { data: invoice } = await supabase
        .from('invoices')
        .select('status')
        .eq('student_id', studentId)
        .eq('term', term) // e.g. "1st Term 2025/2026"
        .neq('status', 'paid')
        .maybeSingle()

    return {
        isCleared: !invoice,
        status: invoice?.status || 'paid'
    }
}
