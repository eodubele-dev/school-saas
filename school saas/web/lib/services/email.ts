
import { Resend } from 'resend';
import { WelcomePlatinumEmail } from '@/components/emails/welcome-platinum';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(
    to: string, 
    schoolName: string, 
    subdomain: string, 
    password?: string,
    studentDetails?: { name: string, email: string, password: string }
) {
    console.log(`[Email Service] Attempting to send Welcome Email to ${to}`);

    try {
        const emailHtml = WelcomePlatinumEmail({
            schoolName,
            subdomain,
            parentEmail: to,
            parentPassword: password,
            studentName: studentDetails?.name,
            studentEmail: studentDetails?.email,
            studentPassword: studentDetails?.password
        });

        // Since it's a test environment without a verified domain, use Resend's default test address
        // Note: Resend's test address 'onboarding@resend.dev' can only send TO the email address you signed up with.
        // Once you verify a domain, change this to 'noreply@yourdomain.com'
        const fromAddress = 'onboarding@resend.dev';

        const { data, error } = await resend.emails.send({
            from: `"${schoolName} (System)" <${fromAddress}>`,
            to: [to],
            subject: `Your ${schoolName} Command Center is Ready`,
            react: emailHtml
        });

        if (error) {
            console.error('[Email Service] Resend API Error:', error);
            return { success: false, error: error.message };
        }

        console.log(`[Email Service] Successfully sent email via Resend to ${to}. ID: ${data?.id}`);
        return { success: true, id: data?.id };
    } catch (error: any) {
        console.error('[Email Service] Failed to send email:', error);
        return { success: false, error: error?.message || "Unknown error" };
    }
}
