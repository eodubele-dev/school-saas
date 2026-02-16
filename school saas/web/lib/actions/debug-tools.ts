'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function linkStudentAccount() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Not logged in" }

    // 1. Get Profile Email
    const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single()

    if (!profile?.email) return { success: false, error: "Profile has no email address." }

    // 2. Find Student with matching Email
    const { data: existingStudent } = await supabase
        .from('students')
        .select('id, user_id, full_name')
        .eq('email', profile.email)
        .maybeSingle()

    if (!existingStudent) {
        return { success: false, error: `No student record found for email: ${profile.email}` }
    }

    if (existingStudent.user_id === user.id) {
        return { success: true, message: "Account is already correctly linked." }
    }

    if (existingStudent.user_id && existingStudent.user_id !== user.id) {
        return { success: false, error: "This student record is linked to a DIFFERENT user account. Contact Admin." }
    }

    // 3. Perform Link
    const { error: updateError } = await supabase
        .from('students')
        .update({ user_id: user.id })
        .eq('id', existingStudent.id)

    if (updateError) {
        return { success: false, error: updateError.message }
    }

    revalidatePath('/')
    return { success: true, message: `Successfully linked student: ${existingStudent.full_name}` }
}

export async function linkStudentByAdmissionNumber(formData: FormData) {
    const customAdmissionNumber = formData.get('admission_number') as string

    if (!customAdmissionNumber) return { success: false, error: "Admission Number is required" }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Not logged in" }

    // 1. Find Student by Admission Number
    const { data: student } = await supabase
        .from('students')
        .select('id, user_id, full_name, email')
        .eq('admission_number', customAdmissionNumber.trim())
        .maybeSingle()

    if (!student) {
        return { success: false, error: `No student found with Admission Number: ${customAdmissionNumber}` }
    }

    if (student.user_id && student.user_id !== user.id) {
        return { success: false, error: `Student ${student.full_name} is already linked to another account!` }
    }

    // 2. Link
    const { error } = await supabase
        .from('students')
        .update({ user_id: user.id })
        .eq('id', student.id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/')
    return { success: true, message: `Successfully linked to ${student.full_name}` }
}
