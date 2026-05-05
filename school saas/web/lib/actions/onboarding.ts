'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { sendSMS } from '@/lib/services/termii'
import { SMS_CONFIG } from '@/lib/constants/communication'
import { sendWelcomeEmail } from '@/lib/services/email'

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

    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    const tenantId = profile?.tenant_id

    if (!profile || !['admin', 'bursar', 'teacher', 'super-admin', 'owner'].includes(profile.role)) {
        return { success: false, error: 'Permission denied: Insufficient privileges.' }
    }

    const adminClient = createAdminClient()

    // --- 0.5. CAPACITY CHECK ---
    const { data: tenantInfo } = await adminClient
        .from('tenants')
        .select('subscription_tier')
        .eq('id', tenantId)
        .single()

    const currentTier = tenantInfo?.subscription_tier || 'starter'
    
    // Check current student count
    const { count: studentCount } = await adminClient
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId)

    const limit = currentTier === 'pilot' ? 100 
                : currentTier === 'starter' ? 300 
                : Infinity

    if ((studentCount || 0) >= limit) {
        return { 
            success: false, 
            error: `CAPACITY_REACHED: Your current ${currentTier.toUpperCase()} plan is limited to ${limit} students. Please upgrade to admit more students.` 
        }
    }

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
    let isNewParent = false
    let parentPassword = 'password123' // Fallback for existing or error

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
            // Create root Auth User to satisfy `profiles_id_fkey` constraint
            isNewParent = true
            parentPassword = Math.random().toString(36).slice(-8) + "!"
            const dummyEmail = data.parentEmail || `parent_${data.parentPhone.replace(/\D/g, '')}@eduflow.ng`;

            const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
                email: dummyEmail,
                password: parentPassword,
                email_confirm: true,
                user_metadata: {
                    full_name: data.parentName || `Parent of ${data.firstName}`,
                    phone: data.parentPhone,
                    role: 'parent',
                    tenant_id: tenantId
                }
            });

            if (authError && authError.message !== 'User already registered') {
                return { success: false, error: "Failed to provision parent account: " + authError.message }
            }

            // If user already exists in auth, find their ID
            let authId = authData?.user?.id;
            if (!authId) {
                const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
                const existingUser = users.find(u => u.email === dummyEmail);
                authId = existingUser?.id;
            }

            if (!authId) {
                return { success: false, error: "Critical Error: Could not resolve parent identity." }
            }

            // Create new parent profile for this school
            const { data: newParent, error: parentError } = await adminClient
                .from('profiles')
                .insert({
                    id: authId,
                    tenant_id: tenantId,
                    role: 'parent',
                    full_name: data.parentName || `Parent of ${data.firstName}`,
                    phone: data.parentPhone,
                    email: data.parentEmail || null,
                })
                .select('id')
                .single()

            if (parentError) {
                // Ignore duplicate key errors if the user somehow already existed in profiles but not found above
                if (parentError.code !== '23505') {
                    return { success: false, error: "Failed to link parent profile: " + parentError.message }
                }
            }
            parentId = newParent?.id || authId
        }
    }

    // 3. Create Student
    const admissionNumber = data.admissionNumber || `ADM/${new Date().getFullYear()}/${Math.floor(Math.random() * 10000)}`

    const { data: student, error: studentError } = await adminClient
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

    const tuitionAmount = feeParams?.amount || 0

    // Only generate invoice if a fee structure was found
    if (feeParams) {
        const { data: invoice, error: invoiceError } = await adminClient
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
            await adminClient.from('invoice_items').insert({
                tenant_id: tenantId,
                invoice_id: invoice.id,
                description: feeParams?.name || 'Academic Fees',
                amount: tuitionAmount
            })
        }
    }

    // Standard student email based on admission number: student_[adm_no]@eduflow.ng
    const studentAuthEmail = `student_${admissionNumber.replace(/\//g, '_').toLowerCase()}@eduflow.ng`;
    const studentPassword = Math.random().toString(36).slice(-8) + "!";

    await adminClient.auth.admin.createUser({
        email: studentAuthEmail,
        password: studentPassword,
        email_confirm: true,
        user_metadata: {
            full_name: student.full_name,
            role: 'student',
            tenant_id: tenantId,
            admission_number: admissionNumber
        }
    });

    // 6. Send Welcome SMS to Parent (with Wallet Deduction)
    const { data: tenant } = await adminClient
        .from('tenants')
        .select('name, sms_balance, slug')
        .eq('id', tenantId)
        .single()

    const schoolName = tenant?.name || 'the school'
    const currentBalance = Number(tenant?.sms_balance) || 0
    const SMS_COST = SMS_CONFIG.UNIT_COST

    let smsMessage = ''
    if (isNewParent) {
        smsMessage = `Welcome to ${schoolName}! Child: ${data.firstName} (${admissionNumber}). Parent Portal: Log in with your Phone Number (${data.parentPhone}). Password: ${parentPassword}. Link: eduflow.ng/login`
    } else {
        smsMessage = `Hello from ${schoolName}! Your child ${data.firstName} (${admissionNumber}) has been successfully registered. Access the parent portal at eduflow.ng/login`
    }

    if (currentBalance >= SMS_COST) {
        const smsRes = await sendSMS(data.parentPhone, smsMessage)
        if (smsRes.success) {
            // Deduct balance
            await adminClient
                .from('tenants')
                .update({ sms_balance: currentBalance - SMS_COST })
                .eq('id', tenantId)

            // Log transaction
            await adminClient
                .from('message_logs')
                .insert({
                    tenant_id: tenantId,
                    sender_id: user.id,
                    recipient_phone: data.parentPhone,
                    recipient_name: data.parentName || 'Parent',
                    message_content: smsMessage,
                    channel: 'sms',
                    status: 'sent',
                    cost: SMS_COST,
                    provider_ref: (smsRes.data as any)?.message_id
                })
        }
    }

    // 7. Send Welcome Email to Parent
    if (data.parentEmail && tenant?.slug) {
        await sendWelcomeEmail(data.parentEmail, schoolName, tenant.slug, isNewParent ? parentPassword : undefined)
    }


    revalidatePath('/dashboard/admin/students')
    revalidatePath('/dashboard/admin/admissions') // Ensure wizard state might refresh if needed
    return { success: true, message: 'Student admitted and accounts provisioned' }
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
    logoUrl?: string
    transactionReference?: string
}

export async function createTenant(data: OnboardingData) {
    console.log('[createTenant] UNIFIED_PROVISIONING_SEQUENCE_START for:', data.subdomain)
    
    try {
        // --- 0. PRE-FLIGHT CHECKS ---
        console.log('[createTenant] Step 0: Pre-flight Checks...')
        
        const supabase = createClient()
        const adminClient = createAdminClient()
        
        // Ensure Env Vars are present (Critical for Service Role tasks)
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error("CRITICAL_CONFIG_ERROR: NEXT_PUBLIC_SUPABASE_URL is missing.")
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("CRITICAL_CONFIG_ERROR: SUPABASE_SERVICE_ROLE_KEY is missing.")

        const { data: authUser, error: authError } = await supabase.auth.getUser()
        if (authError || !authUser.user) {
            console.error('[createTenant] Auth check failed:', authError)
            throw new Error("AUTHENTICATION_REQUIRED: Please log in to complete setup.")
        }
        const user = authUser.user

        // --- 0.5. PAYMENT VERIFICATION (If not a free trial/pilot with 0 upfront) ---
        // Note: Even Pilot requires 10k deposit now based on StepPlan
        if (data.plan !== 'free') {
            console.log('[createTenant] Step 0.5: Verifying Payment...', data.transactionReference)
            
            if (!data.transactionReference) {
                throw new Error("PAYMENT_REQUIRED: A valid transaction reference is required for this plan.")
            }

            const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
            const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${data.transactionReference}`, {
                headers: { Authorization: `Bearer ${SECRET_KEY}` }
            })
            
            const verifyData = await verifyRes.json()
            
            if (!verifyRes.ok || !verifyData.status || verifyData.data.status !== 'success') {
                throw new Error("PAYMENT_VERIFICATION_FAILED: The provided transaction could not be verified.")
            }

            // Optional: Verify amount (Paystack amount is in kobo)
            const paidAmount = verifyData.data.amount / 100
            const expectedAmount = data.plan === 'pilot' ? 10000 
                                : data.plan === 'starter' ? 20000
                                : data.plan === 'professional' ? 50000
                                : data.plan === 'platinum' ? 150000
                                : 0
            
            if (paidAmount < expectedAmount) {
                throw new Error(`INSUFFICIENT_PAYMENT: Expected ₦${expectedAmount}, but received ₦${paidAmount}.`)
            }

            console.log('[createTenant] Payment Verified Successfully.')
        }

        // --- 1. CORE PROVISIONING ---
        console.log('[createTenant] Step 1: Creating Tenant Record...')
        // Calculate SMS Units (₦5.00 per unit)
        const unitsToCredit = Math.floor((data.initialDeposit || 0) / 5.00)
        
        const { data: tenant, error: tenantError } = await adminClient
            .from('tenants')
            .insert({
                name: data.schoolName,
                slug: data.subdomain,
                logo_url: data.logoUrl,
                subscription_tier: data.plan,
                is_active: true,
                sms_balance: unitsToCredit,
                pilot_ends_at: data.plan === 'pilot'
                    ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
                    : null,
                theme_config: {
                    primary: data.brandColor || '#00F5FF',
                    accent: data.brandColor || '#0ea5e9',
                    type: 'school',
                    levels: data.levels,
                    features: {
                        waec_integration: data.waecStats,
                        ai_enabled: data.plan === 'platinum'
                    }
                }
            })
            .select()
            .single()

        if (tenantError) {
            console.error('[createTenant] Step 1 Failure:', tenantError)
            throw new Error("TENANT_CREATION_FAILED: " + tenantError.message)
        }

        console.log('[createTenant] Step 2: Linking Admin Profile...', user.id, '->', tenant.id)
        const { error: profileError } = await adminClient
            .from('profiles')
            .upsert({
                id: user.id,
                tenant_id: tenant.id,
                role: 'admin',
                full_name: user.user_metadata?.full_name || user.email,
                email: user.email
            })

        if (profileError) {
            console.error('[createTenant] Step 2 Failure:', profileError)
            throw new Error("PROFILE_LINKING_FAILED: " + profileError.message)
        }
        
        console.log('[createTenant] Step 3: Injecting Subjects...', data.nerdcPresets)
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

            const { error: subjectsError } = await adminClient.from('subjects').insert(subjectInserts)
            if (subjectsError) console.error("[createTenant] Subjects insertion warning:", subjectsError.message)
        }

        console.log('[createTenant] Step 4: Finalizing Activation...')
        // We handle the email sending as a non-blocking background task if possible, 
        // to ensure the tenant creation response is returned immediately.
        try {
            const { sendWelcomeEmail } = await import('@/lib/services/email')
            // Fire and forget (or await if you want to ensure delivery before success)
            await sendWelcomeEmail(user.email || '', data.schoolName, data.subdomain)
        } catch (emailErr) {
            console.error("[createTenant] Welcome email failure (non-fatal):", emailErr)
        }

        console.log('[createTenant] PROVISIONING_COMPLETE. Returning SUCCESS.')
        return {
            success: true,
            redirectUrl: `/${data.subdomain}/dashboard?welcome=true`
        }

    } catch (error: any) {
        console.error("Onboarding Error:", error)
        return { 
            success: false, 
            error: error.message || "An internal server error occurred during provisioning." 
        }
    }
}
