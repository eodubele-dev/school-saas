
import { Resend } from 'resend';
import { WelcomePlatinumEmail } from '@/components/emails/welcome-platinum';

// Client will be initialized inside the function to prevent top-level crashes

export async function sendWelcomeEmail(
    to: string, 
    schoolName: string, 
    subdomain: string, 
    password?: string,
    studentDetails?: { name: string, email: string, password: string }
) {
    console.log(`[Email Service] Attempting to send Welcome Email to ${to}`);

    try {
        if (!process.env.RESEND_API_KEY) {
            console.error('[Email Service] RESEND_API_KEY is missing in environment variables!');
            return { success: false, error: "System configuration error: Missing Email API Key" };
        }
        
        const resend = new Resend(process.env.RESEND_API_KEY);

        const emailHtml = WelcomePlatinumEmail({
            schoolName,
            subdomain,
            parentEmail: to,
            parentPassword: password,
            studentName: studentDetails?.name,
            studentEmail: studentDetails?.email,
            studentPassword: studentDetails?.password
        });

        // Using the verified production domain 'eduflow.ng'
        const fromAddress = 'noreply@eduflow.ng';

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
