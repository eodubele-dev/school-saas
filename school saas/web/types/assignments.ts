export interface Assignment {
    id: string
    tenant_id: string
    class_id: string
    subject_id: string
    teacher_id: string
    title: string
    description: string | null
    due_date: string | null // ISO string
    points: number
    created_at: string
}

export interface AssignmentSubmission {
    id: string
    assignment_id: string
    student_id: string
    content: string | null
    grade: number | null
    feedback: string | null
    submitted_at: string
    graded_at: string | null
}
