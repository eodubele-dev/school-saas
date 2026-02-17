'use server'

import { createClient } from '@/lib/supabase/server'
import { getStudentAttendanceHistory } from './student-attendance'
import { resolveStudentForUser } from './assignments'

export async function getStudentMetrics() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // 1. Get Tenant ID first
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: "Profile not found" }

    // 2. Resolve Student Profile
    const student = await resolveStudentForUser(supabase, user.id, profile.tenant_id)

    if (!student) return { success: false, error: "Student profile not found" }


    // 2. Calculate Real Metrics
    // Fetch all grades for this student's class to calculate rank
    // Note: This is an expensive query for a dashboard. In prod, use a materialized view.
    // For MVP, we fetch current session/term average.

    // 2a. Get current session/term (Fallback to one if not set)
    const { data: activeTerm } = await supabase.from('academic_terms').select('name, session').eq('is_active', true).maybeSingle()
    const termName = activeTerm?.name || 'First Term'
    const sessionName = activeTerm?.session || '2024/2025'

    // 2b. Get Student's Average
    const { data: myGrades } = await supabase
        .from('student_grades')
        .select('total_score')
        .eq('student_id', student.id)
        .eq('term', termName)
        .eq('session', sessionName)

    const myTotal = myGrades?.reduce((sum, g) => sum + (g.total_score || 0), 0) || 0
    const myCount = myGrades?.length || 1
    const myAverage = myGrades?.length ? (myTotal / myCount) : 0

    // 2c. Get Class Rank (Simplified)
    // We verify against other students in the same class
    // Optimized: Count how many students have a higher average? 
    // Doing true rank requires fetching all grades for the class. 
    // Optimization: Just fetch class size and mock rank for now to save read ops, OR if small class, fetch all.
    // Let's implement valid "Class Size" at least.

    const { count: totalStudents } = await supabase
        .from('students')
        .select('id', { count: 'exact', head: true })
        .eq('class_id', student.class_id)

    // 2d. Get Real Attendance Pct
    const { stats: attStats } = await getStudentAttendanceHistory()
    let attendancePct = 100
    if (attStats) {
        const totalDays = (attStats.present || 0) + (attStats.absent || 0) + (attStats.late || 0) + (attStats.excused || 0)
        const attended = (attStats.present || 0) + (attStats.late || 0)
        attendancePct = totalDays > 0 ? Math.round((attended / totalDays) * 100) : 100
    }

    // Metric Object
    const mockMetrics = {
        average: Math.round(myAverage * 10) / 10,
        rank: 0, // identifying rank requires complex aggregation, leave as 0 (UI can hide or show 'Pending') or implement in DB function
        totalStudents: totalStudents || 0,
        attendancePct
    }

    // 3. Billing Status (For Result Download Lock)
    const { data: billing } = await supabase
        .from('invoices')
        .select('*')
        .eq('student_id', student.id)
        .eq('status', 'paid')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    const feesPaid = !!billing // True if latest invoice is paid

    return {
        success: true,
        student,
        metrics: mockMetrics,
        feesPaid
    }
}

export async function getStudentSubjects() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // 1. Get Tenant ID first
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, subjects: [] }

    // 2. Resolve Student Class
    const student = await resolveStudentForUser(supabase, user.id, profile.tenant_id)

    if (!student || !student.class_id) return { success: false, subjects: [] }

    if (!student || !student.class_id) return { success: false, subjects: [] }

    // 2. Get Subjects for Class
    const { data: classSubjects } = await supabase
        .from('class_subjects')
        .select(`
            subject:subjects(id, name, code)
        `)
        .eq('class_id', student.class_id)

    if (!classSubjects || classSubjects.length === 0) return { success: true, subjects: [] }

    // 3. Get Current Term Grades (for CA)
    const { data: activeTerm } = await supabase.from('academic_terms').select('name, session').eq('is_active', true).maybeSingle()
    const termName = activeTerm?.name || 'First Term'
    const sessionName = activeTerm?.session || '2024/2025'

    const { data: grades } = await supabase
        .from('student_grades')
        .select('subject_id, ca1, ca2')
        .eq('student_id', student.id)
        .eq('term', termName)
        .eq('session', sessionName)

    // 4. Map & Format
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-500', 'bg-rose-500', 'bg-indigo-500']

    const subjects = classSubjects.map((item: any, index: number) => {
        const subject = item.subject
        const grade = grades?.find(g => g.subject_id === subject.id)
        const caScore = (grade?.ca1 || 0) + (grade?.ca2 || 0)

        // Mock target for now, usually 30 or 40 depending on policy
        const target = 40

        return {
            id: subject.id,
            name: subject.name,
            ca: caScore,
            target: target,
            color: colors[index % colors.length]
        }
    })

    return {
        success: true,
        subjects
    }
}

export async function getExamReadiness() {
    // Stub data for Chart
    return {
        success: true,
        history: [
            { date: 'Jan 10', score: 45 },
            { date: 'Jan 17', score: 52 },
            { date: 'Jan 24', score: 68 },
            { date: 'Jan 31', score: 75 },
        ]
    }
}
