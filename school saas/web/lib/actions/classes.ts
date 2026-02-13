'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

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
    parent_name?: string
    parent_phone?: string
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
        .select(`
            subject,
            classes(
                id, 
                name, 
                grade_level, 
                students(count)
            )
        `)
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
                student_count: (c.students as any[])?.[0]?.count || 0
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
                    student_count: (c.students as any[])?.[0]?.count || 0
                })
            }
        })
    }

    return { success: true, data: Array.from(classesMap.values()) }
}

/**
 * Get Student Roster for a specific class
 */
export async function getClassRoster(classId: string) {
    const supabase = createClient()
    const { data: students } = await supabase
        .from('students')
        .select(`
            *,
            parent:profiles!parent_id(
                full_name,
                phone_number
            )
        `)
        .eq('class_id', classId)
        .order('full_name')

    if (!students) return { success: false, data: [] }

    const roster: StudentRosterItem[] = students.map(s => {
        const parent = (s as any).parent
        return {
            id: s.id,
            full_name: s.full_name,
            admission_number: s.admission_number || 'N/A',
            status: s.status || 'active',
            avatar_url: s.avatar_url,
            medical_info: s.medical_info || {},
            financial_status: s.financial_status || 'paid',
            performance_trend: 'stable',
            parent_name: parent?.full_name,
            parent_phone: parent?.phone_number
        }
    })

    return { success: true, data: roster }
}

export async function assignFormTeacher(classId: string, teacherId: string | null) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { success: false, error: "Admin access required" }

    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin
        .from('classes')
        .update({ form_teacher_id: teacherId })
        .eq('id', classId)
        .eq('tenant_id', profile.tenant_id)

    if (error) return { success: false, error: error.message }

    return { success: true }
}

export async function createClassLevel(data: { name: string, section: string }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { success: false, error: "Admin access required" }

    const supabaseAdmin = createAdminClient()
    const { data: newLevel, error } = await supabaseAdmin
        .from('class_levels')
        .insert({ ...data, tenant_id: profile.tenant_id })
        .select()
        .single()

    if (error) return { success: false, error: error.message }

    return { success: true, data: newLevel }
}

export async function deleteClassLevel(id: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { success: false, error: "Admin access required" }

    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin
        .from('class_levels')
        .delete()
        .eq('id', id)
        .eq('tenant_id', profile.tenant_id)

    if (error) return { success: false, error: error.message }

    return { success: true }
}

export async function createClass(data: { name: string, grade_level: string, class_level_id: string }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { success: false, error: "Admin access required" }

    const supabaseAdmin = createAdminClient()
    const { data: newClass, error } = await supabaseAdmin
        .from('classes')
        .insert({ ...data, tenant_id: profile.tenant_id })
        .select()
        .single()

    if (error) return { success: false, error: error.message }

    return { success: true, data: newClass }
}

export async function deleteClass(id: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return { success: false, error: "Admin access required" }

    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin
        .from('classes')
        .delete()
        .eq('id', id)
        .eq('tenant_id', profile.tenant_id)

    if (error) return { success: false, error: error.message }

    return { success: true }
}
