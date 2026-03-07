"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createJSClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

export interface SnapshotData {
    studentId: string
    sessionId: string
    term: string
    documentType: 'result_sheet' | 'admission_letter'
}

/**
 * Initiates the client-side snapshot generation by granting a
 * secure, time-bound pre-signed URL to upload the PDF blob natively 
 * straight into the Supabase Storage bucket, bypassing 4.5MB Vercel edge limits.
 */
export async function createUploadUrl(data: SnapshotData, fileSize: number) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    // Enforce Admin / Teacher check
    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()
    if (!profile || !['admin', 'teacher'].includes(profile.role)) {
        return { success: false, error: "Insufficient permissions to freeze documents." }
    }

    // Target Path: tenantId/result_sheet/sessionId/snapshot_studentId_term_timestamp.pdf
    const safeTerm = data.term.replace(/[^a-zA-Z0-9_-]/g, '_')
    const filename = `snapshot_${data.studentId}_${safeTerm}_${Date.now()}.pdf`
    const filePath = `${profile.tenant_id}/${data.documentType}/${data.sessionId}/${filename}`

    const adminClient = createJSClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )

    // Generate Pre-Signed Upload URL valid for 60 seconds
    const { data: uploadData, error } = await adminClient
        .storage
        .from('official-documents')
        .createSignedUploadUrl(filePath)

    if (error || !uploadData) {
        console.error("Presigned URL Error:", error)
        return { success: false, error: "Storage ticket generation failed: " + error?.message }
    }

    return {
        success: true,
        uploadUrl: uploadData.signedUrl,
        filePath: filePath,
        token: uploadData.token
    }
}

/**
 * Finalizes the snapshot process by extracting the cloud URL from the successful
 * client-side bucket upload and inserting the link into the SQL database tracking table.
 */
export async function registerSnapshot(data: SnapshotData, filePath: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }
    const { data: profile } = await supabase.from('profiles').select('tenant_id, role').eq('id', user.id).single()

    if (!profile || !['admin', 'teacher'].includes(profile.role)) {
        return { success: false, error: "Access Denied" }
    }

    const adminClient = createJSClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )

    // Get strictly secure public URL string
    const { data: urlData } = adminClient
        .storage
        .from('official-documents')
        .getPublicUrl(filePath)

    if (!urlData?.publicUrl) return { success: false, error: "Failed to resolve public URL" }

    // Upsert the Tracking Record. If one already existed for this term/student, it's overwritten by the newer PDF link.
    const { data: record, error } = await adminClient
        .from('academic_snapshots')
        .upsert({
            tenant_id: profile.tenant_id,
            student_id: data.studentId,
            academic_session_id: data.sessionId,
            term: data.term,
            document_type: data.documentType,
            file_url: urlData.publicUrl,
            created_by: user.id
        }, {
            onConflict: 'student_id, academic_session_id, term, document_type'
        })
        .select()
        .single()

    if (error) {
        console.error("Snapshot Database Registration Failed:", error)
        return { success: false, error: error.message }
    }

    // Force Next.js router to drop cache so Parent Dashboards correctly update to the "Download Official PDF" states
    revalidatePath('/dashboard/admin/results', 'layout')
    revalidatePath('/dashboard/student/academic')
    revalidatePath('/dashboard/parent/academic')

    return { success: true, snapshot: record }
}

/**
 * Quickly checks if an official snapshot exists for a given term,
 * allowing the UI to render a simple "Download Cached Results" button instead of
 * recalculating raw database JSON data trees.
 */
export async function verifyExistingSnapshot(studentId: string, sessionId: string, term: string, documentType: string = 'result_sheet') {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, exists: false }

    // Uses standard RLS constraint
    const { data, error } = await supabase
        .from('academic_snapshots')
        .select('file_url, created_at')
        .eq('student_id', studentId)
        .eq('academic_session_id', sessionId)
        .eq('term', term)
        .eq('document_type', documentType)
        .single()

    if (error || !data) {
        return { success: true, exists: false }
    }

    return { success: true, exists: true, snapshot: data }
}
