import { createClient } from "@/lib/supabase/server"
import { randomBytes } from "crypto"

/**
 * Generates a secure Magic Link for a student/parent.
 * 
 * @param tenantId The school's tenant ID
 * @param studentId The student to view results for
 * @param userEmail The email to log in as (must be valid parent/user)
 * @param redirectPath Where to go after login (e.g. /parent/results/xyz)
 * @returns { token, url }
 */
export async function generateMagicLink(
    tenantId: string,
    studentId: string,
    userEmail: string,
    redirectPath: string
) {
    const supabase = createClient()

    // 1. Generate a secure random token
    // We use hex encoding for URL safety
    const token = randomBytes(24).toString('hex')

    // 2. Set Expiration (e.g. 7 days for results, or 48 hours for strict security)
    // The prompt implies convenience, so 7 days is reasonable for result checking.
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // 3. Store in DB
    const { error } = await supabase.from('magic_links').insert({
        token,
        tenant_id: tenantId,
        student_id: studentId,
        user_email: userEmail,
        redirect_path: redirectPath,
        expires_at: expiresAt.toISOString(),
        used: false
    })

    if (error) {
        console.error("Failed to store magic link:", error)
        throw new Error("Could not generate magic link")
    }

    // 4. Construct URL
    // We need the BASE_URL. In prod, env var. In dev, localhost.
    // We'll assume relative or constructing from Headers in a real call, 
    // but here we return the full relative path for the emailer to prefix.
    const url = `/auth/magic-pay?token=${token}`

    return { token, url, expiresAt }
}
