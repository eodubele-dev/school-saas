'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { sendSMS } from '@/lib/services/termii'

export interface AdmissionData {
    firstName: string
    lastName: string
    middleName?: string
    gender: string
    dob: string // ISO Date
    classId: string
    house?: string
    bloodGroup?: string
    genotype?: string
    passportUrl?: string
    parentPhone: string
    parentEmail?: string
    parentName?: string
    admissionNumber?: string
    parentId?: string
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

    // 1. Get Active Session
    const { data: session } = await supabase
        .from('academic_sessions')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .single()

    if (!session) return { success: false, error: 'No active academic session found. Please start a session first.' }

    // 2. Handle Parent (Use ID, Find by Phone, or Create)
    let parentId = data.parentId

    if (!parentId) {
        // Search for existing parent by phone
        const { data: existingParent } = await supabase
            .from('profiles')
            .select('id')
            .eq('tenant_id', tenantId)
            .eq('role', 'parent')
            .eq('phone', data.parentPhone)
            .single()

        if (existingParent) {
            parentId = existingParent.id
        } else {
            // Create new parent profile
            const { data: newParent, error: parentError } = await supabase
                .from('profiles')
                .insert({
                    tenant_id: tenantId,
                    role: 'parent',
                    full_name: data.parentName || `Parent of ${data.firstName}`,
                    phone: data.parentPhone,
                    email: data.parentEmail || null,
                })
                .select('id')
                .single()

            if (parentError) return { success: false, error: "Failed to create parent: " + parentError.message }
            parentId = newParent.id
        }
    }

    // 3. Create Student
    const admissionNumber = data.admissionNumber || `ADM/${new Date().getFullYear()}/${Math.floor(Math.random() * 10000)}`

    const { data: student, error: studentError } = await supabase
        .from('students')
        .insert({
            tenant_id: tenantId,
            first_name: data.firstName,
            last_name: data.lastName,
            middle_name: data.middleName,
            full_name: `${data.firstName} ${data.middleName ? data.middleName + ' ' : ''}${data.lastName}`,
            class_id: data.classId,
            house: data.house,
            admission_number: admissionNumber,
            status: 'active',
            parent_id: parentId,
            dob: data.dob,
            gender: data.gender,
            blood_group: data.bloodGroup,
            genotype: data.genotype,
            passport_url: data.passportUrl
        })
        .select()
        .single()

    if (studentError) return { success: false, error: studentError.message }

    // 4. Automated Billing (Generate Tuition Invoice)
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
            term: `${session.session} ${session.term}`,
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

    // 5. Send Welcome SMS
    const smsMessage = `Welcome to Blue-Horizon High! Your child ${data.firstName} is enrolled. Admission No: ${admissionNumber}. Portal Login: ${data.parentPhone}`
    await sendSMS(data.parentPhone, smsMessage)

    revalidatePath('/dashboard/admin/students')
    revalidatePath('/dashboard/admin/admissions') // Ensure wizard state might refresh if needed
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
        .eq('slug', subdomain)
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
    initialDeposit?: number
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
                slug: data.subdomain,
                type: 'school',
                subscription_tier: data.plan,
                is_active: true,
                sms_balance: data.initialDeposit || 0, // Recorded during onboarding for Pilot activation
                pilot_ends_at: data.plan === 'pilot'
                    ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
                    : null,
                settings: {
                    brand_color: data.brandColor,
                    levels: data.levels,
                    features: {
                        waec_integration: data.waecStats,
                        ai_enabled: data.plan === 'platinum' || data.plan === 'pilot' // Pilot gets AI to prove worth
                    }
                }
            })
            .select()
            .single()

        if (tenantError) throw new Error(tenantError.message)

        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                tenant_id: tenant.id,
                role: 'admin',
                full_name: user.user_metadata?.full_name || user.email,
                email: user.email
            })

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

        // --- PLATINUM HANDOFF ---
        // Send the Executive Welcome Email
        // Note: Using 'user' email which comes from auth.getUser()
        // We import the service dynamically or at top-level. 
        // For clean diff, I'll rely on the top-level import I'll ask you to ensure, 
        // or just import here if strictly needed, but let's assume I added import at top.
        // Actually, let's just use the function.

        try {
            // We do a fire-and-forget or await? Await is safer for "completion" feel.
            const { sendWelcomeEmail } = await import('@/lib/services/email')
            await sendWelcomeEmail(user.email || '', data.schoolName, data.subdomain)
        } catch (emailErr) {
            console.error("Failed to send welcome email (Non-fatal):", emailErr)
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
