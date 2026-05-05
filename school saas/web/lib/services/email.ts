
// import { Resend } from 'resend';
import { WelcomePlatinumEmail } from '@/components/emails/welcome-platinum';
// import { render } from '@react-email/render';

// const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(
    to: string, 
    schoolName: string, 
    subdomain: string, 
    password?: string,
    studentDetails?: { name: string, email: string, password: string }
) {
    console.log(`[Email Service] Attempting to send Welcome Email to ${to}`);

    try {
        // SIMULATION FOR DEMO:
        console.log("---------------------------------------------------");
        console.log(`📧 EMAIL SENT: Welcome to the Future of ${schoolName}`);
        console.log(`To: ${to}`);
        console.log(`Subject: Your Command Center is Ready`);
        
        if (password) {
            console.log(`PARENT CREDENTIALS:`);
            console.log(`Email/Phone: ${to}`);
            console.log(`Password: ${password}`);
        }

        if (studentDetails) {
            console.log(`STUDENT CREDENTIALS (${studentDetails.name}):`);
            console.log(`Login ID: ${studentDetails.email}`);
            console.log(`Password: ${studentDetails.password}`);
        }
        console.log(`Link: https://${subdomain}.${process.env.NEXT_PUBLIC_COOKIE_DOMAIN || 'app.site'}`);
        console.log("---------------------------------------------------");

        return { success: true };
    } catch (error) {
        console.error('[Email Service] Failed to send email:', error);
        return { success: false, error };
    }
}
