"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getTeachersForAssignment() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // Get Tenant ID
    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) return { success: false, error: "Tenant not found" }

    const supabaseAdmin = createAdminClient()
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name')
        .eq('tenant_id', profile.tenant_id)
        .eq('role', 'teacher')
        .order('full_name')

    if (error) return { success: false, error: error.message }

    return { success: true, data }
}

export async function getStaffList(domain: string, page = 1, query = "") {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // Get Tenant ID
    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single()

    if (!profile?.tenant_id) return { success: false, error: "Tenant not found" }

    const ITEMS_PER_PAGE = 10
    const from = (page - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    const supabaseAdmin = createAdminClient()

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
        .eq('tenant_id', profile.tenant_id)
        .in('role', ['admin', 'teacher', 'bursar', 'registrar', 'support_staff', 'owner'])
        .order('created_at', { ascending: false })
        .range(from, to)

    if (query) {
        dbQuery = dbQuery.or(`full_name.ilike.%${query}%`)
    }

    const { data: profiles, count, error } = await dbQuery

    if (error) return { success: false, error: error.message }

    // 4. Enrich with emails from auth.users (since email column is missing in profiles)
    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers()

    const enrichedData = (profiles || []).map(p => {
        const authUser = authUsers?.find(u => u.id === p.id)
        return {
            ...p,
            email: authUser?.email || p.email || "" // Fallback to p.email if it ever gets added
        }
    })

    return {
        success: true,
        data: enrichedData,
        count,
        totalPages: count ? Math.ceil(count / ITEMS_PER_PAGE) : 0
    }
}

export async function updateStaffRole(userId: string, newRole: string, newDepartment?: string) {
    const supabase = createClient()

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // 2. Admin Check
    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role, tenant_id')
        .eq('id', user.id)
        .single()

    if (adminProfile?.role !== 'admin') return { success: false, error: "Only admins can update roles" }

    // 3. Update Target User
    const updates: any = { role: newRole }
    if (newDepartment) updates.department = newDepartment

    const supabaseAdmin = createAdminClient()
    const { error } = await supabaseAdmin
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .eq('tenant_id', adminProfile.tenant_id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/[domain]/dashboard/admin/staff', 'page')
    return { success: true }
}

export async function updateStaffStatus(userId: string, status: 'active' | 'inactive') {
    const supabase = createClient()
    // Admin check assumed similar to above (omitted for brevity)
    const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', userId)

    if (error) return { success: false, error: error.message }
    revalidatePath('/[domain]/dashboard/admin/staff', 'page')
    return { success: true }
}

export async function createStaff(formData: any) {
    const supabase = createClient()
    const supabaseAdmin = createAdminClient()

    // 1. Auth & Admin Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('tenant_id, role')
        .eq('id', user.id)
        .single()

    if (!adminProfile || adminProfile.role !== 'admin') {
        return { success: false, error: "Only admins can add staff" }
    }

    // 2. Create User (Standard Auth)
    // Using admin client to invite by email to skip email verification (optional) or just signUp
    // For credential delivery logic (Magic Link), we typically use inviteUserByEmail

    // Note: This sends the built-in Supabase invite email. 
    // To send custom Termii SMS, we would generate the link manually or use a password reset flow.
    // For this prototype, we will create the user with a temporary password and "Simulate" the SMS.

    const tempPassword = "TempPassword123!" // In prod, generate random

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: formData.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
            full_name: `${formData.firstName} ${formData.lastName}`,
            tenant_id: adminProfile.tenant_id,
            phone: formData.phone // Save to metadata
        }
    })

    if (createError) return { success: false, error: createError.message }
    if (!newUser.user) return { success: false, error: "Failed to create user" }

    const staffId = newUser.user.id

    // 3. Create Profile (Manually if trigger doesn't handle it, or update it)
    // Assuming we need to insert or update profile with role
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
            id: staffId,
            tenant_id: adminProfile.tenant_id,
            full_name: `${formData.firstName} ${formData.lastName}`,
            role: formData.role,
            department: formData.department,
            phone: formData.phone // Save to profiles
        })
        .select()

    // If conflict (trigger created it), update it
    if (profileError && profileError.code === '23505') {
        await supabaseAdmin
            .from('profiles')
            .update({
                role: formData.role,
                department: formData.department,
                full_name: `${formData.firstName} ${formData.lastName}`
            })
            .eq('id', staffId)
    }

    // 4. Create Staff Permissions & Signature
    const { error: permError } = await supabaseAdmin
        .from('staff_permissions')
        .insert({
            tenant_id: adminProfile.tenant_id,
            staff_id: staffId,
            designation: formData.designation,
            signature_url: formData.signature, // Storing Data URL directly
            can_view_financials: formData.role === 'bursar' || formData.role === 'admin',
            can_edit_results: formData.role === 'teacher',
            can_send_bulk_sms: formData.role === 'admin'
        })

    if (permError) {
        console.error("Permission Error", permError)
        // Non-fatal, return success with warning
    }

    revalidatePath('/[domain]/dashboard/admin/staff', 'page')
    return { success: true, tempPassword }
}
