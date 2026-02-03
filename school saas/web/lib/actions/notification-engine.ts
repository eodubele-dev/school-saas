'use server'

import { createClient } from "@/lib/supabase/server"
import { generateMagicLink } from "@/lib/notifications/magic-link"
import { ChannelSimulator } from "@/lib/notifications/channels"

type NotificationType = 'result_published' | 'payment_reminder_1' | 'payment_reminder_2'

interface TriggerResultPayload {
    studentId: string
    term: string
    session: string
}

export async function triggerResultNotification({ studentId, term, session }: TriggerResultPayload) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser() // Authorized Actor (Admin)

    // 1. Fetch Student & Parent Context
    const { data: student } = await supabase
        .from('students')
        .select(`
            *,
            tenant:tenants(name, subaccount_code),
            class:classes(name)
        `)
        .eq('id', studentId)
        .single()

    if (!student) {
        console.error("Student not found for notification:", studentId)
        return { success: false, error: "Student not found" }
    }

    // 2. Fetch Billing (Balance)
    // We assume getStudentBilling or direct query.
    const { data: invoice } = await supabase
        .from('invoices')
        .select('balance, amount_due')
        .eq('student_id', studentId)
        .eq('term', term)
        .eq('session', session)
        .single()

    const balance = invoice?.balance || 50000 // Default if missing (demo)

    // 3. Resolve Parent Contact (Assuming email in student record for demo, or linked parent)
    const parentEmail = student.email || "parent@example.com"
    const parentPhone = student.phone || "08012345678" // Fallback number
    const parentName = "Guardian" // Could be fetched from parent table if linked

    // 4. Generate Magic Link
    // Target: /parent/results/[student_id]?pay_modal=true
    // We pass the absolute logic to the generator
    const redirectPath = `/parent/results/${student.id}?pay_modal=true`
    const { url: magicLinkPath } = await generateMagicLink(
        student.tenant_id,
        student.id,
        parentEmail,
        redirectPath
    )

    // Construct Full Link (For Demo: localhost:3000, In Prod: domain)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://school1.localhost:3000'
    const fullMagicLink = `${baseUrl}${magicLinkPath}`

    // 5. Send Communications (Parallel)
    const schoolName = student.tenant?.name || "School"

    // A. SMS
    const smsMessage = `Hello ${parentName}, ${student.first_name}'s ${term} results are available at ${schoolName}. View here: ${fullMagicLink}. Pls clear balance of N${balance.toLocaleString()} to unlock. [Official Campus Communication]`
    const smsPromise = ChannelSimulator.sms({
        to: parentPhone,
        message: smsMessage
    })

    // B. Email
    const emailHtml = `
        <div style="font-family: sans-serif; color: #333;">
            <h2 style="color: #2563eb;">${schoolName} Result Notification</h2>
            <p>Dear ${parentName},</p>
            <p>We are pleased to inform you that the official results for <strong>${student.first_name} ${student.last_name}</strong> for the <strong>${term}</strong> term have been released.</p>
            
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Class:</strong> ${student.class?.name}</p>
                <p style="margin: 5px 0 0;"><strong>Outstanding Balance:</strong> ₦${balance.toLocaleString()}</p>
            </div>

            <p>Please click the secure button below to view the results and clear any outstanding fees.</p>
            
            <a href="${fullMagicLink}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                View Results & Pay Now
            </a>

            <p style="font-size: 12px; color: #666; margin-top: 30px;">
                This link will auto-log you in securely. Do not share it.
            </p>
            
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="text-align: center; font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 1px;">
                Official Campus Communication • ${schoolName}
            </p>
        </div>
    `
    const emailPromise = ChannelSimulator.email({
        to: parentEmail,
        subject: `🎓 ${student.first_name}'s Report Card - Results Ready`,
        html: emailHtml
    })

    const [smsRes, emailRes] = await Promise.all([smsPromise, emailPromise])

    // 6. Log to DB
    // We log two entries? Or one consolidated? Splitting is better for Analytics.

    const logs = [
        {
            tenant_id: student.tenant_id,
            student_id: student.id,
            recipient_phone: parentPhone,
            channel: 'sms',
            type: 'result_published',
            status: smsRes.success ? 'sent' : 'failed',
            provider_id: smsRes.providerId,
            metadata: { message: smsMessage },
            created_at: new Date().toISOString()
        },
        {
            tenant_id: student.tenant_id,
            student_id: student.id,
            recipient_email: parentEmail,
            channel: 'email',
            type: 'result_published',
            status: emailRes.success ? 'sent' : 'failed',
            provider_id: emailRes.providerId,
            metadata: { subject: "Result Ready" },
            created_at: new Date().toISOString()
        }
    ]

    const { error: logError } = await supabase.from('notifications').insert(logs)

    if (logError) {
        console.error("Failed to log notifications", logError)
    }

    return { success: true, count: 2 }
}
