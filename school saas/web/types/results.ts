export interface ResultData {
    student: {
        id: string
        full_name: string
        admission_number: string
        passport_url: string | null
        class_name: string
        house: string | null
    }
    school_details: {
        name: string
        address: string
        motto: string
        logo_url: string
        principal_signature_url?: string
        theme?: {
            primary_color: string
            secondary_color: string
            accent_color: string
        }
    }
    attendance: {
        total_days: number
        present: number
        absent: number
    }
    academic: {
        subjects: {
            name: string
            ca1: number
            ca2: number
            exam: number
            total: number
            grade: string
            position: string
            remarks: string
        }[]
        average: number
        total_score: number
    }
    character: {
        affective_domain: Record<string, number> // e.g., { "Neatness": 5 }
        teacher_remark: string
        principal_remark: string
    }
    term_info: {
        term: string
        session: string
        next_term_begins: string
        date_issued: string
    }
}
