"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getAdminCurriculumData() {
    const supabase = createClient()

    // Fetch all students to select from
    const { data: students, error: studentsError } = await supabase
        .from('students')
        .select(`
            id,
            admission_number,
            full_name,
            class_id,
            photo_url,
            classes:class_id(name)
        `)
        .order('full_name')

    if (studentsError) {
        console.error('Error fetching students:', studentsError)
        return { students: [], milestones: [] }
    }

    const { data: milestones, error: milestonesError } = await supabase
        .from('curriculum_milestones')
        .select(`
            *,
            student:students(full_name, admission_number)
        `)
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

    revalidatePath('/dashboard/admin/curriculum')
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

    revalidatePath('/dashboard/admin/curriculum')
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

    revalidatePath('/dashboard/admin/curriculum')
    revalidatePath('/dashboard/platinum')
    return { success: true }
}
