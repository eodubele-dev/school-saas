'use server'

import { createClient } from '@/lib/supabase/server'

export async function getStudentMetrics() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // 1. Get Student Profile & Class
    const { data: student } = await supabase
        .from('students')
        .select('id, class_id, full_name, admission_number')
        // In a real app, we link auth.uid() -> profiles -> students logic
        // For MVP demo, assuming the 'user' is a student or we link via email?
        // Let's assume there's a way to find the student_id for the current auth user.
        // Stub: Fetching *any* student for demo if not strictly linked, or use the one matching auth.
        // real: .eq('parent_id', ...) or if student login exists.
        .limit(1)
        .single()

    if (!student) return { success: false, error: "Student profile not found" }

    // 2. Calculate Rank & Average (Mocked Logic for complex SQL Window Functions)
    // In Prod: 
    // SELECT avg(score), rank() over (order by avg(score) desc) ...

    const mockMetrics = {
        average: 78.5,
        rank: 4,
        totalStudents: 32,
        attendancePct: 94
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
    // Stub data for Subjects
    return {
        success: true,
        subjects: [
            { id: '1', name: 'Mathematics', ca: 24, target: 30, color: 'bg-blue-500' },
            { id: '2', name: 'English Language', ca: 28, target: 30, color: 'bg-green-500' },
            { id: '3', name: 'Basic Science', ca: 18, target: 30, color: 'bg-orange-500' },
            { id: '4', name: 'Computer Studies', ca: 22, target: 30, color: 'bg-purple-500' },
        ]
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
