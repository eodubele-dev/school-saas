"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getCurriculumData() {
    const supabase = createClient()
    
    // 1. Identify User and Context
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { students: [], milestones: [] }

    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id, role')
        .eq('id', user.id)
        .single()
    
    if (!profile) return { students: [], milestones: [] }
    
    const tenantId = profile.tenant_id
    const isTeacher = profile.role === 'teacher'

    // 2. Prepare Student Query with Tenant Filter
    let studentQuery = supabase
        .from('students')
        .select(`
            id,
            admission_number,
            full_name,
            class_id,
            photo_url,
            classes:class_id(name)
        `)
        .eq('tenant_id', tenantId)

    // 3. Apply Teacher-Specific Class Filtering
    if (isTeacher) {
        // Reuse the standardized teacher class detection logic
        const { getTeacherClasses } = await import("./classes")
        const classesRes = await getTeacherClasses()
        
        if (!classesRes.success || !classesRes.data || classesRes.data.length === 0) {
            return { students: [], milestones: [] }
        }

        const classIds = classesRes.data.map(c => c.id)
        studentQuery = studentQuery.in('class_id', classIds)
    }

    const { data: students, error: studentsError } = await studentQuery.order('full_name')

    if (studentsError) {
        console.error('Error fetching students:', studentsError)
        return { students: [], milestones: [] }
    }

    // 4. Fetch Milestones only for the visible students
    const studentIds = (students || []).map(s => s.id)
    if (studentIds.length === 0) return { students: students || [], milestones: [] }

    const { data: milestones, error: milestonesError } = await supabase
        .from('curriculum_milestones')
        .select(`
            *,
            student:students(full_name, admission_number)
        `)
        .in('student_id', studentIds)
        .order('created_at', { ascending: false })

    if (milestonesError) {
        console.error('Error fetching milestones:', milestonesError)
    }

    return {
        students: students || [],
        milestones: milestones || []
    }
}

export async function addCurriculumMilestone(data: any) {
    const supabase = createClient()

    const { data: newRow, error } = await supabase
        .from('curriculum_milestones')
        .insert({
            student_id: data.student_id,
            subject: data.subject,
            grade_level: data.grade_level,
            topic: data.topic,
            week_range: data.week_range,
            status: data.status,
            progress_percent: data.progress_percent || 0
        })
        .select()
        .single()

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/teacher/curriculum')
    revalidatePath('/dashboard/platinum')
    return { success: true, data: newRow }
}

export async function updateCurriculumMilestone(id: string, data: any) {
    const supabase = createClient()

    const { data: updatedRow, error } = await supabase
        .from('curriculum_milestones')
        .update({
            subject: data.subject,
            grade_level: data.grade_level,
            topic: data.topic,
            week_range: data.week_range,
            status: data.status,
            progress_percent: data.progress_percent
        })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/teacher/curriculum')
    revalidatePath('/dashboard/platinum')
    return { success: true, data: updatedRow }
}

export async function deleteCurriculumMilestone(id: string) {
    const supabase = createClient()

    const { error } = await supabase
        .from('curriculum_milestones')
        .delete()
        .eq('id', id)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/teacher/curriculum')
    revalidatePath('/dashboard/platinum')
    return { success: true }
}
