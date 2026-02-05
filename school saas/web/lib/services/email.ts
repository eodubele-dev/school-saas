
// import { Resend } from 'resend';
import { WelcomePlatinumEmail } from '@/components/emails/welcome-platinum';
// import { render } from '@react-email/render';

// const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(to: string, schoolName: string, subdomain: string) {
    console.log(`[Email Service] Attempting to send Welcome Email to ${to}`);

    try {
        // In a real environment with Resend installed:
        // const emailHtml = render(<WelcomePlatinumEmail schoolName={schoolName} subdomain={subdomain} userEmail={to} />);
        // await resend.emails.send({
        //     from: 'EduFlow Platinum <onboarding@eduflow.ng>',
        //     to,
        //     subject: `Welcome to the Future of ${schoolName} // Your Command Center is Ready`,
        //     html: emailHtml
        // });

        // SIMULATION FOR DEMO:
        console.log("---------------------------------------------------");
        console.log(`📧 EMAIL SENT: Welcome to the Future of ${schoolName}`);
        console.log(`To: ${to}`);
        console.log(`Subject: Your Command Center is Ready`);
        console.log(`Link: https://${subdomain}.eduflow.ng`);
        console.log("---------------------------------------------------");

        return { success: true };
    } catch (error) {
        console.error('[Email Service] Failed to send email:', error);
        return { success: false, error };
    }
}
