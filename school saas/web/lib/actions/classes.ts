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
 * Fetch all classes (arms) for the current tenant
 */
export async function getClasses() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: "Profile not found" }

    const supabaseAdmin = createAdminClient()
    const { data, error } = await supabaseAdmin
        .from('classes')
        .select('*, class_levels(name)')
        .eq('tenant_id', profile.tenant_id)
        .order('name')

    console.log(`[getClasses] Tenant: ${profile.tenant_id}, Found: ${data?.length || 0} classes`)
    if (error) {
        console.error(`[getClasses] Error:`, error)
        return { success: false, error: error.message }
    }
    
    // Format the name to include the level (e.g. "JSS 1 Gold")
    const formattedData = (data || []).map((cls: any) => ({
        ...cls,
        name: cls.class_levels?.name ? `${cls.class_levels.name} ${cls.name}` : cls.name
    }))

    return { success: true, data: formattedData }
}

/**
 * Fetch all class levels for the current tenant
 */
export async function getClassLevels() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    if (!profile) return { success: false, error: "Profile not found" }

    const { data, error } = await supabase
        .from('class_levels')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('name')

    if (error) return { success: false, error: error.message }
    return { success: true, data }
}

/**
 * Fetch classes for the logged-in teacher
 */
export async function getTeacherClasses() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, data: [] }

    const supabaseAdmin = createAdminClient()

    // 1. Fetch classes where user is Form Teacher (via classes table)
    const { data: formClasses } = await supabaseAdmin
        .from('classes')
        .select('id, name, grade_level')
        .eq('form_teacher_id', user.id)

    // 2. Fetch classes via subject_assignments
    const { data: subjectAssignments } = await supabaseAdmin
        .from('subject_assignments')
        .select(`
            subject,
            classes(
                id, 
                name, 
                grade_level
            )
        `)
        .eq('teacher_id', user.id)

    // 3. Fetch classes via teacher_allocations (primary assignment table)
    const { data: allocations } = await supabaseAdmin
        .from('teacher_allocations')
        .select(`
            subject,
            is_form_teacher,
            classes(
                id,
                name,
                grade_level
            )
        `)
        .eq('teacher_id', user.id)

    // Combine and deduplicate by ID first
    const classesMap = new Map<string, TeacherClass>()

    if (formClasses) {
        for (const c of formClasses as any[]) {
            classesMap.set(c.id, {
                id: c.id,
                name: c.name,
                grade_level: c.grade_level,
                role: 'form_teacher',
                student_count: 0
            })
        }
    }

    if (subjectAssignments) {
        for (const sa of subjectAssignments as any[]) {
            const c = sa.classes
            if (c) {
                const existing = classesMap.get(c.id)
                classesMap.set(c.id, {
                    id: c.id,
                    name: c.name,
                    grade_level: c.grade_level,
                    role: existing?.role === 'form_teacher' ? 'form_teacher' : 'subject_teacher',
                    subject: sa.subject || existing?.subject,
                    student_count: 0
                })
            }
        }
    }

    if (allocations) {
        for (const alloc of allocations as any[]) {
            const c = alloc.classes
            if (c) {
                const existing = classesMap.get(c.id)
                classesMap.set(c.id, {
                    id: c.id,
                    name: c.name,
                    grade_level: c.grade_level,
                    role: (alloc.is_form_teacher || existing?.role === 'form_teacher') ? 'form_teacher' : 'subject_teacher',
                    subject: alloc.subject || existing?.subject,
                    student_count: 0
                })
            }
        }
    }

    // Fetch actual student counts
    const classIds = Array.from(classesMap.keys())
    if (classIds.length > 0) {
        const { data: studentCounts } = await supabaseAdmin
            .from('students')
            .select('class_id')
            .in('class_id', classIds)

        if (studentCounts) {
            const countMap = studentCounts.reduce((acc: Record<string, number>, s: any) => {
                acc[s.class_id] = (acc[s.class_id] || 0) + 1
                return acc
            }, {})
            classesMap.forEach((cls, id) => {
                cls.student_count = countMap[id] || 0
            })
        }
    }

    // --- SMART DEDUPLICATION BY NAME/GRADE ---
    // If a teacher has two classes with the same name (e.g. legacy/duplicate rows), 
    // keep the one with more students or the one where they are a form teacher.
    const uniqueByName = new Map<string, TeacherClass>()
    classesMap.forEach((cls) => {
        const grade = (cls.grade_level || '').toLowerCase()
        const name = (cls.name || '').toLowerCase()
        const key = `${grade}-${name}`
        const existing = uniqueByName.get(key)
        
        if (!existing) {
            uniqueByName.set(key, cls)
        } else {
            // Priority 1: Keep the one with actual students
            // Priority 2: Keep the one where they are a form teacher
            const existingScore = (existing.student_count > 0 ? 10 : 0) + (existing.role === 'form_teacher' ? 5 : 0)
            const currentScore = (cls.student_count > 0 ? 10 : 0) + (cls.role === 'form_teacher' ? 5 : 0)
            
            if (currentScore > existingScore) {
                uniqueByName.set(key, cls)
            }
        }
    })

    return { success: true, data: Array.from(uniqueByName.values()) }
}

/**
 * Get Student Roster for a specific class
 */
export async function getClassRoster(classId: string) {
    const supabaseAdmin = createAdminClient()

    // Step 1: Fetch students — NO risky joins, just raw student data
    const { data: students, error } = await supabaseAdmin
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .order('full_name')

    if (error) {
        console.error('[getClassRoster] Student fetch error:', error)
        return { success: false, data: [] }
    }

    if (!students || students.length === 0) {
        console.warn('[getClassRoster] No students found for class_id:', classId)
        return { success: true, data: [] }
    }

    // Step 2: Collect parent IDs and fetch profile data separately (safe, no FK dependency)
    const parentIds = students
        .map((s: any) => s.parent_id)
        .filter(Boolean) as string[]

    const parentMap: Record<string, { full_name: string; phone_number?: string }> = {}

    if (parentIds.length > 0) {
        const { data: parents } = await supabaseAdmin
            .from('profiles')
            .select('id, full_name, phone_number')
            .in('id', parentIds)

        if (parents) {
            for (const p of parents as any[]) {
                parentMap[p.id] = { full_name: p.full_name, phone_number: p.phone_number }
            }
        }
    }

    // Step 3: Map to roster format
    const roster: StudentRosterItem[] = (students as any[]).map(s => {
        const parent = s.parent_id ? parentMap[s.parent_id] : null
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

    console.log(`[getClassRoster] Loaded ${roster.length} students for class ${classId}`)
    return { success: true, data: roster }
}

export async function assignFormTeacher(classId: string, teacherId: string | null) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (profile?.role !== 'admin' && profile?.role !== 'super-admin' && profile?.role !== 'owner') return { success: false, error: "Admin access required" }

    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin
        .from('classes')
        .update({ form_teacher_id: teacherId })
        .eq('id', classId)
        .eq('tenant_id', profile.tenant_id)

    if (error) return { success: false, error: error.message }

    return { success: true }
}

export async function assignTeacherToSubject(data: {
    teacherId: string,
    classId: string,
    subject: string,
    isFormTeacher: boolean
}) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (profile?.role !== 'admin' && profile?.role !== 'super-admin' && profile?.role !== 'owner') return { success: false, error: "Admin access required" }

    const supabaseAdmin = createAdminClient()

    // 1. If form teacher, update classes table
    if (data.isFormTeacher) {
        const { error: formError } = await supabaseAdmin
            .from('classes')
            .update({ form_teacher_id: data.teacherId })
            .eq('id', data.classId)
            .eq('tenant_id', profile.tenant_id)

        if (formError) return { success: false, error: formError.message }
    }

    // 2. If subject provided, insert into both mapping tables for compatibility
    if (data.subject) {
        // Upsert into subject_assignments (Legacy/Alternative)
        const { error: subjectError } = await supabaseAdmin
            .from('subject_assignments')
            .upsert({
                tenant_id: profile.tenant_id,
                class_id: data.classId,
                teacher_id: data.teacherId,
                subject: data.subject
            }, {
                onConflict: 'class_id,teacher_id,subject'
            })

        if (subjectError) return { success: false, error: subjectError.message }

        // Upsert into teacher_allocations (Used by Assessment Hub)
        const { error: allocError } = await supabaseAdmin
            .from('teacher_allocations')
            .upsert({
                tenant_id: profile.tenant_id,
                class_id: data.classId,
                teacher_id: data.teacherId,
                subject: data.subject,
                is_form_teacher: data.isFormTeacher
            }, {
                onConflict: 'tenant_id,teacher_id,class_id,subject'
            })

        if (allocError) return { success: false, error: allocError.message }
    }

    revalidatePath('/dashboard/admin/staff')
    return { success: true }
}

export async function createClassLevel(data: { name: string, section: string }) {
    try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: "Unauthorized" }

        const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
        if (!profile) return { success: false, error: "Profile not found" }
        
        if (profile?.role !== 'admin' && profile?.role !== 'super-admin' && profile?.role !== 'owner') {
            return { success: false, error: "Admin access required" }
        }

        const supabaseAdmin = createAdminClient()
        const { data: newLevel, error } = await supabaseAdmin
            .from('class_levels')
            .insert({ ...data, tenant_id: profile.tenant_id })
            .select()
            .single()

        if (error) {
            console.error(`[createClassLevel] DB Error:`, error)
            return { success: false, error: error.message }
        }

        return { success: true, data: newLevel }
    } catch (err: any) {
        console.error(`[createClassLevel] Fatal Error:`, err)
        return { success: false, error: err.message || "Failed to create class level" }
    }
}

export async function deleteClassLevel(id: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (profile?.role !== 'admin' && profile?.role !== 'super-admin' && profile?.role !== 'owner') return { success: false, error: "Admin access required" }

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
    if (profile?.role !== 'admin' && profile?.role !== 'super-admin' && profile?.role !== 'owner') return { success: false, error: "Admin access required" }

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
    if (profile?.role !== 'admin' && profile?.role !== 'super-admin' && profile?.role !== 'owner') return { success: false, error: "Admin access required" }

    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin
        .from('classes')
        .delete()
        .eq('id', id)
        .eq('tenant_id', profile.tenant_id)

    if (error) return { success: false, error: error.message }

    return { success: true }
}

export async function updateClassLevel(id: string, data: { name: string, section: string }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (profile?.role !== 'admin' && profile?.role !== 'super-admin' && profile?.role !== 'owner') return { success: false, error: "Admin access required" }

    const supabaseAdmin = createAdminClient()
    const { data: updatedLevel, error } = await supabaseAdmin
        .from('class_levels')
        .update(data)
        .eq('id', id)
        .eq('tenant_id', profile.tenant_id)
        .select()
        .single()

    if (error) return { success: false, error: error.message }

    return { success: true, data: updatedLevel }
}

export async function updateClass(id: string, data: { name: string, grade_level: string, class_level_id: string }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (profile?.role !== 'admin' && profile?.role !== 'super-admin' && profile?.role !== 'owner') return { success: false, error: "Admin access required" }

    const supabaseAdmin = createAdminClient()
    const { data: updatedClass, error } = await supabaseAdmin
        .from('classes')
        .update(data)
        .eq('id', id)
        .eq('tenant_id', profile.tenant_id)
        .select()
        .single()

    if (error) return { success: false, error: error.message }

    return { success: true, data: updatedClass }
}
