'use server'

import { createClient } from '@/lib/supabase/server'

export async function getStudentProfileData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    // 1. Get Base Student Info
    // Assuming linked profile logic or user is a student:
    // For demo, we fetch the first student record associated with this user ID (if parent) or just the student ID if direct.
    // Let's assume we find the student record.
    const { data: student } = await supabase
        .from('students')
        .select(`
            *,
            class:classes(name),
            metadata:student_metadata(*)
        `)
        .limit(1)
        .single()

    if (!student) return { success: false, error: "Student not found" }

    // 2. Fetch Achievements
    const { data: achievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('student_id', student.id)
        .order('awarded_at', { ascending: false })

    // 3. Fetch Behavioral Report (Latest)
    const { data: behavior } = await supabase
        .from('behavioral_reports')
        .select('*')
        .eq('student_id', student.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    // 4. Fetch Incident Log
    const { data: incidents } = await supabase
        .from('incident_logs')
        .select('*')
        .eq('student_id', student.id)
        .order('occurred_at', { ascending: false })

    // Mock Data if empty (for demo experience)
    const mockedAchievements = achievements?.length ? achievements : [
        { id: '1', title: 'Punctuality King', icon_key: 'clock', category: 'behavior', awarded_at: '2025-01-15', comment: 'Always first to assembly!' },
        { id: '2', title: 'Math Wizard', icon_key: 'math', category: 'academic', awarded_at: '2024-12-10', comment: 'Scored 100% in Algebra.' },
        { id: '3', title: 'Cleanest Uniform', icon_key: 'sparkle', category: 'behavior', awarded_at: '2024-11-20', comment: 'Impeccable dressing.' },
    ]

    const mockedBehavior = behavior || {
        punctuality: 5,
        neatness: 4,
        politeness: 5,
        cooperation: 4,
        leadership: 3,
        attentiveness: 5
    }

    const mockedIncidents = incidents?.length ? incidents : [
        { id: '1', type: 'positive', title: 'Helped a junior student', occurred_at: '2025-01-20' },
        { id: '2', type: 'disciplinary', title: 'Late submission of assignment', occurred_at: '2025-01-10' },
        { id: '3', type: 'positive', title: 'Class Captain Recommendation', occurred_at: '2024-12-05' },
    ]

    return {
        success: true,
        student: {
            ...student,
            metadata: student.metadata || { admission_number: 'SCH/2023/001', house: 'Red House (Dragon)', clubs: ['Jet Club', 'Chess'] }
        },
        achievements: mockedAchievements,
        behavior: mockedBehavior,
        incidents: mockedIncidents
    }
}
