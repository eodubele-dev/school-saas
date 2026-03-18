'use server'

import { createClient } from '@/lib/supabase/server'
import { ResultData } from '@/types/results'

export async function getStudentResultData(studentId: string, term: string, session: string, nextTermBegins: string = "TBD", dateIssued: string = new Date().toDateString()): Promise<ResultData | null> {
    const supabase = createClient()

    try {
        // 1. Fetch Student Profile & Tenant ID
        const { data: student } = await supabase
            .from('students')
            .select(`
                id, full_name, admission_number, passport_url, house, tenant_id,
                classes (name)
            `)
            .eq('id', studentId)
            .single()

        if (!student) return null

        // Fix for student.classes potentially being an array
        const className = Array.isArray(student.classes)
            ? student.classes[0]?.name
            : (student.classes as any)?.name || 'Unknown Class'

        // 1b. Fetch Tenant Details
        const { data: tenant } = await supabase
            .from('tenants')
            .select('name, address, motto, logo_url, theme_config')
            .eq('id', student.tenant_id)
            .single()

        // 1c. Fetch Exact Session ID
        const { data: sessionDoc } = await supabase
            .from('academic_sessions')
            .select('id')
            .eq('tenant_id', student.tenant_id)
            .eq('session', session)
            .single()

        // 2. Fetch Grades
        const { data: grades } = await supabase
            .from('student_grades')
            .select('*')
            .eq('student_id', studentId)
            .eq('term', term)
            .eq('session', session)

        // Fetch subject names for grades
        const subjectIds = grades?.map(g => g.subject_id) || []
        const { data: subjects } = await supabase
            .from('subjects')
            .select('id, name')
            .in('id', subjectIds)

        const subjectMap = new Map(subjects?.map(s => [s.id, s.name]))

        // 3. Fetch Attendance
        // Simplified Logic: Count entries in student_attendance for this student in this term range.
        const { data: attendance } = await supabase
            .from('student_attendance')
            .select('status')
            .eq('student_id', studentId)

        const totalDays = 60 // Should potentially be dynamic per term/tenant config
        const present = attendance?.filter(a => a.status === 'present').length || 0
        const absent = attendance?.filter(a => a.status === 'absent').length || 0

        // 4. Fetch Report Card (Remarks) from new term_results schema
        const { data: reportCard } = await supabase
            .from('term_results')
            .select('*')
            .eq('student_id', studentId)
            .eq('term', term)
            .eq('session_id', session)
            .single()

        // 5. Construct Data
        const formattedSubjects = grades?.map(g => ({
            name: subjectMap.get(g.subject_id) || 'Unknown Subject',
            ca1: g.ca1,
            ca2: g.ca2,
            exam: g.exam,
            total: g.total,
            grade: g.grade,
            position: g.position?.toString() || '-',
            remarks: g.remarks || ''
        })) || []

        const totalScore = formattedSubjects.reduce((sum, s) => sum + s.total, 0)
        const average = formattedSubjects.length > 0 ? totalScore / formattedSubjects.length : 0

        return {
            student: {
                id: student.id,
                full_name: student.full_name,
                admission_number: student.admission_number || 'N/A',
                passport_url: student.passport_url,
                class_name: className,
                house: student.house
            },
            school_details: {
                name: tenant?.name || 'School Name',
                address: tenant?.address || 'School Address',
                motto: tenant?.motto || 'Excellence',
                logo_url: tenant?.logo_url || '/logo.png',
                principal_signature_url: tenant?.theme_config?.settings?.principal_signature || '',
                theme: {
                    primary_color: tenant?.theme_config?.primary || '#2563eb', // Blue-600 default
                    secondary_color: tenant?.theme_config?.secondary || '#1e293b', // Slate-800 default
                    accent_color: tenant?.theme_config?.accent || '#0ea5e9' // Sky-500 default
                }
            },
            attendance: {
                total_days: totalDays,
                present: present,
                absent: absent
            },
            academic: {
                subjects: formattedSubjects,
                average: parseFloat(average.toFixed(2)),
                total_score: totalScore
            },
            character: {
                affective_domain: reportCard?.affective_domain || {},
                teacher_remark: reportCard?.teacher_remark || "Excellent performance.",
                principal_remark: reportCard?.principal_remark || "Keep it up."
            },
            term_info: {
                term,
                session,
                session_id: sessionDoc?.id || 'unknown',
                next_term_begins: nextTermBegins,
                date_issued: dateIssued
            }
        }

    } catch (error) {
        console.error("Error generating result:", error)
        return null
    }
}

export async function getBulkClassResults(
    studentIds: string[],
    term: string,
    session: string,
    nextTermBegins: string = "TBD",
    dateIssued: string = new Date().toDateString()
): Promise<ResultData[]> {
    try {
        // We run getStudentResultData in parallel for all students in the class
        // This is safe because Next.js/Supabase will pipeline the requests
        const results = await Promise.all(
            studentIds.map(id => getStudentResultData(id, term, session, nextTermBegins, dateIssued))
        )

        // Filter out nulls (students without results/errors)
        return results.filter((result): result is ResultData => result !== null)
    } catch (error) {
        console.error("Error in bulk result generation:", error)
        return []
    }
}

export async function checkStudentFeeStatus(studentId: string, term: string, session: string) {
    const supabase = createClient()

    // Check for any PENDING invoice for this student for the term
    const { data: invoice } = await supabase
        .from('invoices')
        .select('status')
        .eq('student_id', studentId)
        .eq('term', term) // e.g. "1st Term 2025/2026"
        .neq('status', 'paid')
        .maybeSingle()

    return {
        isCleared: !invoice,
        status: invoice?.status || 'paid'
    }
}

export async function getClassesForSelection() {
    const supabase = createClient()
    const { data } = await supabase
        .from('classes')
        .select('id, name')
        .order('name')
    return data || []
}

export async function getStudentsForSelection(classId?: string) {
    const supabase = createClient()
    let query = supabase
        .from('students')
        .select('id, full_name, admission_number, class_id, classes(name)')
        .order('full_name')

    if (classId) {
        query = query.eq('class_id', classId)
    }

    const { data } = await query
    return data || []
}

// ------ NEW RESULT MANAGEMENT API ACTIONS ------

export type ResultStatus = 'draft' | 'submitted_for_review' | 'approved_by_principal' | 'published'

export type AffectiveDomain = {
  [key: string]: number
}

import { model } from '@/lib/gemini'

export async function generateOverallSummaryAI(studentName: string, affectiveDomain: AffectiveDomain) {
    try {
        // Calculate average to get a sense of general behavior
        const ratings = Object.values(affectiveDomain)
        const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 3
        
        // Extract strengths (< 4) and weaknesses (>= 4)
        const strengths = Object.entries(affectiveDomain).filter(([_, val]) => val >= 4).map(([k]) => k)
        const areasToImprove = Object.entries(affectiveDomain).filter(([_, val]) => val <= 2).map(([k]) => k)

        const prompt = `
            Act as an experienced Form Teacher in a prestigious school.
            Generate a holistic, constructive end-of-term overall summary remark for ${studentName}.
            
            Context (Scores out of 5):
            - Average Behavioral Score: ${avg.toFixed(1)}/5
            - Strengths (>4): ${strengths.length > 0 ? strengths.join(', ') : 'General good behavior'}
            - Areas to Improve (<2): ${areasToImprove.length > 0 ? areasToImprove.join(', ') : 'None specifically'}
            
            Rules:
            1. Use British English.
            2. High average (>4) should be highly commendatory about their character and social skills.
            3. Average scores (~3) should encourage improvement or consistency.
            4. If there are specific 'Areas to Improve', gently mention them as goals for next term.
            5. Keep the remark to exactly 1 concise sentence (maximum 15 words). No slang.
            6. Focus on behavior, character, and overall disposition, NOT specific academic subjects.
        `

        const result = await model.generateContent(prompt)
        const response = await result.response
        const remark = response.text().trim()

        return { success: true, remark }
    } catch (error) {
        console.error("AI Remark Error:", error)
        return { success: false, error: "Failed to generate AI remark" }
    }
}

export type TermResult = {
  id: string
  tenant_id: string
  student_id: string
  class_id: string
  term: string
  session_id: string
  affective_domain: AffectiveDomain
  teacher_remark: string | null
  principal_remark: string | null
  status: ResultStatus
  created_at: string
  updated_at: string
}
export async function getTermResult(studentId: string, classId: string, term: string, session: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('term_results')
    .select('affective_domain, teacher_remark, status')
    .eq('student_id', studentId)
    .eq('class_id', classId)
    .eq('term', term)
    .eq('session_id', session)
    .maybeSingle()
    
  return data
}

export async function upsertStudentResult(
  studentId: string,
  classId: string,
  term: string,
  session: string,
  affectiveDomain: AffectiveDomain,
  teacherRemark: string,
  status: ResultStatus = 'draft'
) {
  const supabase = createClient()

  // Verify auth & profile
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return { success: false, error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', userData.user.id)
    .single()

  if (!profile?.tenant_id) return { success: false, error: 'No tenant found' }

  const { data, error } = await supabase
    .from('term_results')
    .upsert({
      tenant_id: profile.tenant_id,
      student_id: studentId,
      class_id: classId,
      term: term,
      session_id: session,
      affective_domain: affectiveDomain,
      teacher_remark: teacherRemark,
      status: status,
      updated_at: new Date().toISOString()
    }, { onConflict: 'tenant_id, student_id, term, session_id' })
    .select()
    .single()

  if (error) {
    console.error("Error upserting result:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function updatePrincipalRemark(
  resultId: string,
  principalRemark: string,
  publish: boolean = false
) {
  const supabase = createClient()
  
  const statusToUpdate = publish ? 'published' : 'approved_by_principal'

  const { data, error } = await supabase
    .from('term_results')
    .update({ 
      principal_remark: principalRemark,
      status: statusToUpdate,
      updated_at: new Date().toISOString()
    })
    .eq('id', resultId)
    .select()
    .single()

  if (error) {
    console.error("Error updating principal remark:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function publishResult(resultId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('term_results')
    .update({ 
      status: 'published',
      updated_at: new Date().toISOString()
    })
    .eq('id', resultId)
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

export async function getStudentsResults(classId: string, term: string, session: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('term_results')
    .select(`
      *,
      students:student_id (
        id,
        first_name,
        last_name,
        admission_number
      )
    `)
    .eq('class_id', classId)
    .eq('term', term)
    .eq('session_id', session)

  if (error) {
    console.error("Error fetching results:", error)
    return { success: false, error: error.message, data: [] }
  }

  return { success: true, data }
}

export async function getClassesPendingApproval() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('term_results')
    .select(`
      *,
      students:student_id ( id, first_name, last_name, admission_number ),
      classes:class_id ( id, name )
    `)
    .eq('status', 'submitted_for_review')

  if (error) {
    console.error("Error fetching pending results:", error)
    return { success: false, error: error.message, data: [] }
  }

  return { success: true, data }
}

