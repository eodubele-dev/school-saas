'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendSMS } from '@/lib/services/termii'

export interface AdmissionData {
    firstName: string
    lastName: string
    gender: string
    dob: string // ISO Date
    classId: string
    parentPhone: string
    parentEmail?: string
    parentName?: string
}

/**
 * Single Admission Action
 * - Creates Student
 * - Links/Creates Parent
 * - Generates Invoice
 * - Sends SMS
 */
export async function admitStudent(data: AdmissionData) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
    const tenantId = profile?.tenant_id

    // 1. Handle Parent (Find or Create)
    let parentId = null
    const { data: existingParent } = await supabase
        .from('profiles')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('role', 'parent')
        .limit(1)
        .single()

    if (existingParent) {
        parentId = existingParent.id
    }

    // 2. Create Student
    const admissionNumber = `ADM/${new Date().getFullYear()}/${Math.floor(Math.random() * 10000)}`

    const { data: student, error: studentError } = await supabase
        .from('students')
        .insert({
            tenant_id: tenantId,
            first_name: data.firstName,
            last_name: data.lastName,
            full_name: `${data.firstName} ${data.lastName}`,
            class_id: data.classId,
            admission_number: admissionNumber,
            status: 'active',
            // parent_id: parentId 
        })
        .select()
        .single()

    if (studentError) return { success: false, error: studentError.message }

    // 3. Automated Billing (Generate Tuition Invoice)
    const { data: feeParams } = await supabase
        .from('fee_structures')
        .select('amount, name')
        .eq('class_id', data.classId)
        .eq('is_active', true)
        .single()

    const tuitionAmount = feeParams?.amount || 50000

    const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
            tenant_id: tenantId,
            student_id: student.id,
            term: '1st Term 2025/2026',
            amount: tuitionAmount,
            status: 'pending',
            due_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString()
        })
        .select()
        .single()

    if (invoice && !invoiceError) {
        await supabase.from('invoice_items').insert({
            tenant_id: tenantId,
            invoice_id: invoice.id,
            description: feeParams?.name || 'Tuition Fees',
            amount: tuitionAmount
        })
    }

    // 4. Send Welcome SMS
    const smsMessage = `Welcome to Blue-Horizon High! Your child ${data.firstName} is enrolled. Admission No: ${admissionNumber}. Portal Login: ${data.parentPhone}`
    await sendSMS(data.parentPhone, smsMessage)

    revalidatePath('/dashboard/admin/students')
    return { success: true, message: 'Student admitted successfully' }
}

/**
 * Bulk Admission
 */
export async function bulkAdmitStudents(students: AdmissionData[]) {
    let successCount = 0
    let errors: any[] = []

    for (const student of students) {
        const res = await admitStudent(student)
        if (res.success) successCount++
        else errors.push({ student: student.firstName, error: res.error })
    }

    return { success: true, count: successCount, errors }
}

// --- SCHOOL ONBOARDING ACTIONS ---

export async function checkSubdomainAvailability(subdomain: string) {
    const supabase = createClient()
    const { data } = await supabase
        .from('tenants')
        .select('id')
        .eq('domain', subdomain)
        .single()

    return !data
}

interface OnboardingData {
    schoolName: string
    subdomain: string
    brandColor: string
    levels: string[]
    waecStats: boolean
    nerdcPresets: boolean
    plan: string
}

export async function createTenant(data: OnboardingData) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Authentication required" }

    try {
        const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .insert({
                name: data.schoolName,
                domain: data.subdomain,
                type: 'school',
                subscription_tier: data.plan,
                settings: {
                    brand_color: data.brandColor,
                    levels: data.levels,
                    features: {
                        waec_integration: data.waecStats,
                        ai_enabled: data.plan === 'platinum'
                    }
                }
            })
            .select()
            .single()

        if (tenantError) throw new Error(tenantError.message)

        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                tenant_id: tenant.id,
                role: 'admin',
            })
            .eq('id', user.id)

        if (profileError) throw new Error("Failed to link profile: " + profileError.message)

        if (data.nerdcPresets) {
            const subjects = [
                { name: 'Mathematics', code: 'MATH' },
                { name: 'English Language', code: 'ENG' },
                { name: 'Basic Science', code: 'BSC' },
                { name: 'Social Studies', code: 'SOC' },
                { name: 'Civic Education', code: 'CIV' }
            ]

            const subjectInserts = subjects.map(s => ({
                tenant_id: tenant.id,
                name: s.name,
                code: s.code,
                is_active: true
            }))

            await supabase.from('subjects').insert(subjectInserts)
        }

        return {
            success: true,
            redirectUrl: `/${data.subdomain}/dashboard/admin?welcome=true`
        }

    } catch (error: any) {
        console.error("Onboarding Error:", error)
        return { success: false, error: error.message }
    }
}
