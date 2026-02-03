'use server'

import { createClient } from '@/lib/supabase/server'
import { ResultData } from '@/types/results'

export async function getStudentResultData(studentId: string, term: string, session: string): Promise<ResultData | null> {
    const supabase = createClient()

    try {
        // 1. Fetch Student Profile
        const { data: student } = await supabase
            .from('students')
            .select(`
                id, full_name, admission_number, passport_url, house,
                classes (name)
            `)
            .eq('id', studentId)
            .single()

        if (!student) return null

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
        // For accurate calculation, we'd query the 'student_attendance' table for the term duration.
        // Simplified Logic: Count entries in student_attendance for this student in this term range.
        // Assuming we have term start/end dates. For now, mocking "Total Days" based on distinct dates in attendance.

        // Count present/absent
        const { data: attendance } = await supabase
            .from('student_attendance')
            .select('status')
            .eq('student_id', studentId)
        // .gte('date', term_start) .lte('date', term_end) // implementing date filters requires term dates

        const totalDays = 60 // Mock standard term days
        const present = attendance?.filter(a => a.status === 'present').length || 0
        const absent = attendance?.filter(a => a.status === 'absent').length || 0
        // Or calculated from table if we have full records

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
            position: g.position?.toString() || '-', // Mock calculation needed for real position
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
                class_name: student.classes?.name || 'Unknown Class',
                house: student.house
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
                next_term_begins: "05 Sept, 2026"
            }
        }

    } catch (error) {
        console.error("Error generating result:", error)
        return null
    }
}
