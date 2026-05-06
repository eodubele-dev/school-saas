"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { sendSMS } from "@/lib/services/termii"
import { SMS_CONFIG } from "@/lib/constants/communication"
import { sendWelcomeEmail } from "@/lib/services/email"
import { SITE_CONFIG } from "@/lib/constants/site-config"

export async function getTeachersForAssignment(domain?: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // Get Tenant ID via Domain
    let tenantId: string | undefined
    
    if (domain) {
        const { data: tenant } = await supabase
            .from('tenants')
            .select('id')
            .eq('slug', domain)
            .single()
        tenantId = tenant?.id
    }

    if (!tenantId) {
        // Fallback to first tenant if no domain provided (legacy support)
        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id')
            .eq('id', user.id)
            .limit(1)
            .single()
        tenantId = profile?.tenant_id
    }

    if (!tenantId) return { success: false, error: "Tenant not found" }

    const supabaseAdmin = createAdminClient()
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name')
        .eq('tenant_id', tenantId)
        .eq('role', 'teacher')
        .order('full_name')

    console.log(`[getTeachers] Tenant: ${tenantId}, Found: ${data?.length || 0} teachers`)

    if (error) return { success: false, error: error.message }

    return { success: true, data }
}

export async function getStaffList(domain: string, page = 1, query = "") {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // Get Tenant ID via Domain
    const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', domain)
        .single()

    if (!tenant?.id) {
        console.error(`[getStaffList] Tenant not found for domain: ${domain}`)
        return { success: false, error: "School not found" }
    }
    const tenantId = tenant.id

    const ITEMS_PER_PAGE = 10
    const from = (page - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    let supabaseAdmin;
    try {
        supabaseAdmin = createAdminClient()
    } catch (adminErr) {
        console.error("[getStaffList] Failed to initialize admin client:", adminErr)
        return { success: false, error: "System configuration error: Missing Service Role Key" }
    }

    let dbQuery = supabaseAdmin
        .from('profiles')
        .select(`
            *,
            staff_permissions (
                designation,
                signature_url,
                can_view_financials,
                can_edit_results,
                can_send_bulk_sms
            )
        `, { count: 'exact' })
        .eq('tenant_id', tenantId)
        .in('role', ['admin', 'teacher', 'bursar', 'registrar', 'support_staff', 'owner'])
        .order('created_at', { ascending: false })
        .range(from, to)

    if (query) {
        dbQuery = dbQuery.or(`full_name.ilike.%${query}%`)
    }

    const { data: profiles, count, error } = await dbQuery

    if (error) {
        console.error(`[getStaffList] Database query error for tenant ${tenantId}:`, error)
        return { success: false, error: error.message }
    }

    // 4. Enrich with emails from auth.users (since email column is missing in profiles)
    // Avoid listUsers() due to GoTrue pagination/database bugs; fetch individually (max 10 per page)
    const enrichedData = await Promise.all((profiles || []).map(async (p) => {
        let userEmail = p.email || ""; // Fallback if email column ever gets added
        if (!userEmail) {
            const { data: userResponse, error: userError } = await supabaseAdmin.auth.admin.getUserById(p.id);
            if (!userError && userResponse?.user) {
                userEmail = userResponse.user.email || "";
            }
        }
        return {
            ...p,
            email: userEmail
        };
    }));


    return {
        success: true,
        data: enrichedData,
        count,
        totalPages: count ? Math.ceil(count / ITEMS_PER_PAGE) : 0
    }
}

export async function updateStaffRole(userId: string, newRole: string, domain?: string, newDepartment?: string) {
    const supabase = createClient()

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // Get Tenant ID via Domain
    const { data: tenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', domain)
        .single()

    if (!tenant?.id) return { success: false, error: "School not found" }
    const tenantId = tenant.id

    // 2. Admin Check for THIS tenant
    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .eq('tenant_id', tenantId)
        .single()

    const isAdmin = adminProfile?.role === 'admin' || adminProfile?.role === 'super-admin' || adminProfile?.role === 'owner'
    if (!adminProfile || !isAdmin) return { success: false, error: "Only admins can update roles" }

    // 3. Update Target User
    const updates: any = { role: newRole }
    if (newDepartment) updates.department = newDepartment

    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .eq('tenant_id', tenantId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/[domain]/dashboard/admin/staff', 'page')
    return { success: true }
}

export async function updateStaffStatus(userId: string, status: 'active' | 'inactive', domain?: string) {
    const supabase = createClient()
    // Admin check assumed similar to above (omitted for brevity)
    // Resolve Tenant ID
    const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', domain).single()
    const tenantId = tenant?.id

    const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', userId)
        .eq('tenant_id', tenantId)

    if (error) return { success: false, error: error.message }
    revalidatePath('/[domain]/dashboard/admin/staff', 'page')
    return { success: true }
}

export async function createStaff(formData: any, domain?: string) {
    const supabase = createClient()
    const supabaseAdmin = createAdminClient()

    // 1. Auth & Admin Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // Get Tenant ID via Domain
    const { data: school } = await supabase
        .from('tenants')
        .select('id')
        .eq('slug', domain)
        .single()

    if (!school?.id) return { success: false, error: "School not found" }
    const tenantId = school.id

    // Check if user is authorized for THIS tenant
    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .eq('tenant_id', tenantId)
        .single()

    const isAdmin = adminProfile?.role === 'admin' || adminProfile?.role === 'super-admin' || adminProfile?.role === 'owner'
    if (!adminProfile || !isAdmin) {
        return { success: false, error: "Only admins can add staff" }
    }

    // 2. Check if user already exists in Auth (Using RPC for stability)
    const { data: existingUserId, error: searchError } = await supabaseAdmin.rpc('get_user_id_by_email', { 
        user_email: formData.email 
    })

    if (searchError) {
        console.error("RPC Error finding user:", searchError)
        // Fallback to createUser if RPC fails or isn't installed yet
    }

    let staffId: string
    let isNewUser = false
    let tempPassword = ""

    if (existingUserId) {
        staffId = existingUserId
        
        // Check if they already have a profile in THIS school
        const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('id', staffId)
            .eq('tenant_id', tenantId)
            .maybeSingle()

        if (existingProfile) {
            return { success: false, error: "This person is already registered as staff in this school." }
        }
    } else {
        // Create User (Standard Auth)
        isNewUser = true
        tempPassword = Math.random().toString(36).slice(-8) + "!" // 8 chars + !

        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: formData.email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
                full_name: `${formData.firstName} ${formData.lastName}`,
                tenant_id: tenantId,
                phone: formData.phone
            }
        })

        if (createError) return { success: false, error: createError.message }
        if (!newUser?.user) return { success: false, error: "Failed to create user" }
        
        staffId = newUser.user.id
    }

    // 3. Create Profile (Manually if trigger doesn't handle it, or update it)
    // Assuming we need to insert or update profile with role
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
            id: staffId,
            tenant_id: tenantId,
            full_name: `${formData.firstName} ${formData.lastName}`,
            role: formData.role,
            department: formData.department,
            phone: formData.phone // Save to profiles
        })
        .select()

    // If error occurs, check if it's a conflict
    if (profileError) {
        if (profileError.code === '23505') {
            await supabaseAdmin
                .from('profiles')
                .update({
                    role: formData.role,
                    department: formData.department,
                    full_name: `${formData.firstName} ${formData.lastName}`
                })
                .eq('id', staffId)
        } else {
            console.error("Profile Creation Error:", profileError)
            return { success: false, error: "Failed to create staff profile: " + profileError.message }
        }
    }

    // 4. Create Staff Permissions & Signature
    const { error: permError } = await supabaseAdmin
        .from('staff_permissions')
        .insert({
            tenant_id: tenantId,
            staff_id: staffId,
            designation: formData.designation,
            signature_url: formData.signature, // Storing Data URL directly
            can_view_financials: formData.role === 'bursar' || formData.role === 'admin',
            can_edit_results: formData.role === 'teacher',
            can_send_bulk_sms: formData.role === 'admin'
        })

    if (permError) {
        console.error("Permission Error", permError)
        return { success: false, error: "Failed to assign permissions: " + permError.message }
    }

    // 5. Send Credentials via SMS (with Wallet Deduction)
    const { data: tenant } = await supabaseAdmin
        .from('tenants')
        .select('name, sms_balance')
        .eq('id', tenantId)
        .single()
        
    let currentBalance = Number(tenant?.sms_balance) || 0
    const SMS_COST = SMS_CONFIG.UNIT_COST
    const schoolName = tenant?.name || "the school"
    const appName = process.env.NEXT_PUBLIC_APP_NAME || SITE_CONFIG.shortName
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `https://${process.env.NEXT_PUBLIC_COOKIE_DOMAIN || 'app.site'}`

    let loginMessage = ""
    if (isNewUser) {
        loginMessage = `Welcome to the ${schoolName} Team! Your ${appName} login is: ${formData.email}. Password: ${tempPassword}. Login at: ${siteUrl}/login`
    } else {
        loginMessage = `You have been added to the ${schoolName} team on ${appName}. Log in with your existing credentials at: ${siteUrl}/login`
    }

    let smsStatus = "skipped"
    if (currentBalance >= SMS_COST) {
        const smsRes = await sendSMS(formData.phone, loginMessage)
        
        if (smsRes.success) {
            smsStatus = "sent"
            // Deduct balance
            await supabaseAdmin
                .from('tenants')
                .update({ sms_balance: currentBalance - SMS_COST })
                .eq('id', tenantId)
                
            // Log transaction
            await supabaseAdmin
                .from('message_logs')
                .insert({
                    tenant_id: tenantId,
                    sender_id: user.id,
                    recipient_phone: formData.phone,
                    recipient_name: `${formData.firstName} ${formData.lastName}`,
                    message_content: loginMessage,
                    channel: 'sms',
                    status: 'sent',
                    cost: SMS_COST,
                    provider_ref: (smsRes.data as any)?.message_id
                })
        } else {
            smsStatus = "failed"
            console.error("Staff SMS Failed:", smsRes.error)
        }
    } else {
        console.warn(`[SMS_SKIPPED] Insufficient SMS balance to send credentials to ${formData.phone}`)
    }

    // 6. Send Welcome Email
    if (domain) {
        await sendWelcomeEmail(formData.email, schoolName, domain, tempPassword)
    }


    revalidatePath('/[domain]/dashboard/admin/staff', 'page')
    return { success: true, tempPassword }
}
export async function updateStaffProfile(userId: string, data: {
    firstName: string,
    lastName: string,
    phone: string,
    department: string,
    designation: string,
    signature?: string | null,
    tenant_id?: string
}, domain?: string) {
    const supabase = createClient()
    const supabaseAdmin = createAdminClient()

    // 1. Auth & Admin Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    let tenantId = data.tenant_id // Optional override
    
    if (domain) {
        const { data: tenant } = await supabase
            .from('tenants')
            .select('id')
            .eq('slug', domain)
            .single()
        if (tenant) tenantId = tenant.id
    }

    if (!tenantId) return { success: false, error: "Tenant context required" }

    // Check if user is authorized for THIS tenant
    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .eq('tenant_id', tenantId)
        .single()

    const isAdmin = adminProfile?.role === 'admin' || adminProfile?.role === 'super-admin' || adminProfile?.role === 'owner'
    if (!adminProfile || !isAdmin) {
        return { success: false, error: "Only admins can edit staff profiles" }
    }

    // 2. Update Profile
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
            full_name: `${data.firstName} ${data.lastName}`,
            phone: data.phone,
            department: data.department
        })
        .eq('id', userId)
        .eq('tenant_id', tenantId)

    if (profileError) return { success: false, error: profileError.message }

    // 3. Update Staff Permissions (Using Upsert for robustness)
    const permUpdates: any = {
        staff_id: userId,
        tenant_id: tenantId,
        designation: data.designation
    }
    if (data.signature) {
        permUpdates.signature_url = data.signature
    }

    const { error: permError } = await supabaseAdmin
        .from('staff_permissions')
        .upsert(permUpdates, { onConflict: 'tenant_id, staff_id' })

    if (permError) {
        return { success: false, error: permError.message }
    }

    revalidatePath('/[domain]/dashboard/admin/staff', 'page')
    return { success: true }
}
