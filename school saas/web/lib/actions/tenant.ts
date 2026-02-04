"use server"

import { createClient as createServerClient } from "@/lib/supabase/server"
import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import fs from "fs"
import path from "path"

export async function uploadTenantLogo(formData: FormData) {
    const file = formData.get('file') as File
    const tenantId = formData.get('tenantId') as string

    if (!file || !tenantId) return { success: false, error: "Missing file or tenant ID" }

    // 1. Authorization
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // 2. Privilege Upload using Service Role
    const serviceRoleClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )

    const fileExt = file.name.split('.').pop()
    const filePath = `${tenantId}/logo-${Date.now()}.${fileExt}`

    console.log('[uploadTenantLogo] Attempting upload to:', filePath)

    const byteValue = await file.arrayBuffer()
    const { error: uploadError } = await serviceRoleClient.storage
        .from('school-assets')
        .upload(filePath, Buffer.from(byteValue), {
            contentType: file.type,
            upsert: true
        })

    if (uploadError) {
        console.error('[uploadTenantLogo] Upload Error:', uploadError)
        return { success: false, error: uploadError.message }
    }

    // 3. Get Public URL
    const { data: { publicUrl } } = serviceRoleClient.storage
        .from('school-assets')
        .getPublicUrl(filePath)

    return { success: true, url: publicUrl }
}

export async function updateTenantBranding(tenantId: string, data: {
    name?: string
    motto?: string
    address?: string
    theme_config?: Record<string, unknown>
    logo_base64?: string // Optional: for unexpected legacy handling, but we prefer directupload
    logo_path?: string
}) {
    const supabase = createServerClient()

    // 1. Authorization Check (Admin Only)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, tenant_id')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin' || profile?.tenant_id !== tenantId) {
        return { success: false, error: "Unauthorized access to tenant settings" }
    }

    // 2. Prepare Update Object
    const updates: Record<string, unknown> = {}
    if (data.name) updates.name = data.name
    if (data.motto) updates.motto = data.motto
    if (data.address) updates.address = data.address
    if (data.theme_config) updates.theme_config = data.theme_config
    if (data.logo_path) updates.logo_url = data.logo_path
    console.log('[updateTenantBranding] Attempting update for:', tenantId)
    console.log('[updateTenantBranding] Updates:', updates)

    // 3. Update Tenant (Try with Service Role to bypass RLS if standard fails)
    let { data: updateData, error } = await supabase
        .from('tenants')
        .update(updates)
        .eq('id', tenantId)
        .select()

    if (error || !updateData || updateData.length === 0) {
        console.warn("[updateTenantBranding] Standard update failed or matched 0 rows. Error:", error?.message, "Trying Service Role...")

        // Use Service Role Client to bypass RLS
        const serviceRoleClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: { persistSession: false }
            }
        )

        const { data: adminUpdateData, error: adminError } = await serviceRoleClient
            .from('tenants')
            .update(updates)
            .eq('id', tenantId)
            .select()

        if (adminError) {
            console.error("[updateTenantBranding] Admin Update Error:", adminError)
            return { success: false, error: `Database error: ${adminError.message}` }
        }

        updateData = adminUpdateData
    }

    const logPath = path.join(process.cwd(), 'branding-update.log')
    const successCount = updateData ? updateData.length : 0
    const logEntry = `[${new Date().toISOString()}] Update Result for ${tenantId}: success=${!!updateData}, rows=${successCount}, error=${error?.message || 'none'}\n`
    fs.appendFileSync(logPath, logEntry)

    // Force revalidation across all relevant paths
    revalidatePath('/', 'layout')
    revalidatePath('/[domain]', 'layout')
    revalidatePath('/[domain]/dashboard', 'layout')
    revalidatePath('/[domain]/dashboard/settings/branding', 'page')

    // Added explicit revalidation for the shared Sidebar/Layout area
    revalidatePath(`/${tenantId}`, 'layout')

    if (successCount === 0 && !error) {
        return { success: false, error: "No changes detected or record not found." }
    }

    return { success: true }
}

export async function getUploadSignature() {
    // Note: For simplicity in this iteration, we'll likely use client-side upload 
    // or a simple multipart form action. Since Supabase Storage works well with
    // standard client uploads + RLS, we can stick to client upload if policies allow.
    // Or we can return a signed URL here if needed.

    // For now, let's keep it simple: The client will upload, 
    // and we just trust the stored path if the user is authorized.
    return { success: true }
}
