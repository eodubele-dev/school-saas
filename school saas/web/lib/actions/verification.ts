'use server'

import { createClient } from '@supabase/supabase-js'
import { ResultData } from '@/types/results'

export async function getVerifiedResultData(studentId: string, term: string, session: string): Promise<ResultData | null> {
    // Isolated Service Role Client for Public Verification Only
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    try {
        // 1. Fetch Student Profile & Tenant ID
        const { data: student } = await supabaseAdmin
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
        const { data: tenant } = await supabaseAdmin
            .from('tenants')
            .select('name, address, motto, logo_url, theme_config')
            .eq('id', student.tenant_id)
            .single()

        // 1c. Fetch Exact Session ID
        const { data: sessionDoc } = await supabaseAdmin
            .from('academic_sessions')
            .select('id')
            .eq('tenant_id', student.tenant_id)
            .eq('session', session)
            .single()

        // 2. Fetch Grades
        const { data: grades } = await supabaseAdmin
            .from('student_grades')
            .select('*')
            .eq('student_id', studentId)
            .eq('term', term)
            .eq('session', session)

        if (!grades || grades.length === 0) return null

        // Fetch subject names for grades
        const subjectIds = grades?.map((g: any) => g.subject_id) || []
        const { data: subjects } = await supabaseAdmin
            .from('subjects')
            .select('id, name')
            .in('id', subjectIds)

        const subjectMap = new Map(subjects?.map((s: any) => [s.id, s.name]))

        // 3. Fetch Attendance
        const { data: attendance } = await supabaseAdmin
            .from('student_attendance')
            .select('status')
            .eq('student_id', studentId)

        const totalDays = 60
        const present = attendance?.filter((a: any) => a.status === 'present').length || 0
        const absent = attendance?.filter((a: any) => a.status === 'absent').length || 0

        // 4. Fetch Report Card (Remarks)
        const { data: reportCard } = await supabaseAdmin
            .from('term_results')
            .select('*')
            .eq('student_id', studentId)
            .eq('term', term)
            .eq('session_id', session)
            .single()

        // 5. Construct Data
        const formattedSubjects = grades?.map((g: any) => ({
            name: subjectMap.get(g.subject_id) || 'Unknown Subject',
            ca1: g.ca1,
            ca2: g.ca2,
            exam: g.exam,
            total: g.total,
            grade: g.grade,
            position: g.position?.toString() || '-',
            remarks: g.remarks || ''
        })) || []

        const totalScore = formattedSubjects.reduce((sum: number, s: any) => sum + s.total, 0)
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
                principal_signature_url: tenant?.theme_config?.settings?.principal_signature || '',
                theme: {
                    primary_color: tenant?.theme_config?.primary || '#2563eb',
                    secondary_color: tenant?.theme_config?.secondary || '#1e293b',
                    accent_color: tenant?.theme_config?.accent || '#0ea5e9'
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
                session_id: sessionDoc?.id || 'unknown',
                next_term_begins: 'TBD',
                date_issued: reportCard?.created_at ? new Date(reportCard.created_at).toLocaleDateString() : new Date().toLocaleDateString()
            }
        }

    } catch (error) {
        console.error("Verification Error:", error)
        return null
    }
}
