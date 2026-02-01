'use server'

import { createClient } from '@/lib/supabase/server'

export interface TeacherClass {
    id: string
    name: string
    grade_level: string
    role: 'form_teacher' | 'subject_teacher'
    subject?: string
    student_count: number
}

export interface StudentRosterItem {
    id: string
    full_name: string
    admission_number: string
    status: string
    avatar_url?: string
    medical_info: { conditions?: string[], notes?: string }
    financial_status: string
    performance_trend?: 'up' | 'down' | 'stable'
}

/**
 * Fetch classes for the logged-in teacher
 */
export async function getTeacherClasses() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, data: [] }

    // 1. Fetch classes where user is Form Teacher
    const { data: formClasses } = await supabase
        .from('classes')
        .select('id, name, grade_level, students(count)')
        .eq('form_teacher_id', user.id)

    // 2. Fetch classes where user is Subject Teacher
    const { data: subjectAssignments } = await supabase
        .from('subject_assignments')
        .select('subject, classes(id, name, grade_level, students(count))')
        .eq('teacher_id', user.id)

    // Combine and Format
    const classesMap = new Map<string, TeacherClass>()

    if (formClasses) {
        formClasses.forEach((c: any) => {
            classesMap.set(c.id, {
                id: c.id,
                name: c.name,
                grade_level: c.grade_level,
                role: 'form_teacher',
                student_count: c.students?.[0]?.count || 0
            })
        })
    }

    if (subjectAssignments) {
        subjectAssignments.forEach((sa: any) => {
            const c = sa.classes
            if (c && !classesMap.has(c.id)) {
                classesMap.set(c.id, {
                    id: c.id,
                    name: c.name,
                    grade_level: c.grade_level,
                    role: 'subject_teacher',
                    subject: sa.subject,
                    student_count: c.students?.[0]?.count || 0
                })
            }
        })
    }

    // Mock Data if empty (for Demo/Development)
    if (classesMap.size === 0) {
        return {
            success: true, data: [
                { id: 'mock-1', name: 'JSS 1 Gold', grade_level: 'JSS 1', role: 'form_teacher', student_count: 32 },
                { id: 'mock-2', name: 'JSS 1 Silver', grade_level: 'JSS 1', role: 'subject_teacher', subject: 'Mathematics', student_count: 28 },
                { id: 'mock-3', name: 'JSS 2 Alpha', grade_level: 'JSS 2', role: 'subject_teacher', subject: 'Mathematics', student_count: 30 },
            ] as TeacherClass[]
        }
    }

    return { success: true, data: Array.from(classesMap.values()) }
}

/**
 * Get Student Roster for a specific class
 */
export async function getClassRoster(classId: string) {
    if (classId.startsWith('mock-')) {
        return { success: true, data: mockRoster(classId) }
    }

    const supabase = createClient()
    const { data: students } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .order('full_name')

    if (!students) return { success: false, data: [] }

    const roster: StudentRosterItem[] = students.map(s => ({
        id: s.id,
        full_name: s.full_name,
        admission_number: s.admission_number || 'N/A',
        status: s.status || 'active',
        avatar_url: s.avatar_url,
        medical_info: s.medical_info || {},
        financial_status: s.financial_status || 'paid',
        performance_trend: Math.random() > 0.5 ? 'up' : 'stable' // Mock trend for now
    }))

    return { success: true, data: roster }
}

function mockRoster(classId: string): StudentRosterItem[] {
    return Array.from({ length: 15 }).map((_, i) => ({
        id: `student-${i}`,
        full_name: `Student Name ${i + 1}`,
        admission_number: `ADM/${new Date().getFullYear()}/00${i + 1}`,
        status: 'active',
        medical_info: i === 2 ? { conditions: ['Asthmatic'] } : {},
        financial_status: i === 5 ? 'owing' : 'paid',
        performance_trend: i % 3 === 0 ? 'up' : 'stable'
    }))
}
