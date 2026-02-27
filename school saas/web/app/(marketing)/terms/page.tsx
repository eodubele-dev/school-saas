import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsAndConditions() {
    return (
        <div className="min-h-screen bg-white text-slate-900 py-16 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 mb-8 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Link>

                <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>

                <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
                    <p className="text-sm italic">Last Updated: February 27, 2026</p>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-slate-900">1. Agreement to Terms</h2>
                        <p>
                            By accessing or using EduFlow, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to all of these terms, do not use our services.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-slate-900">2. Use of Service</h2>
                        <p>
                            EduFlow provides school management software services. You are responsible for ensuring that your use of the service complies with all applicable laws and regulations.
                        </p>
                        <p>
                            Account security is your responsibility. You must maintain the confidentiality of your credentials and notify us immediately of any unauthorized use of your account.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-slate-900">3. User Content</h2>
                        <p>
                            You retain ownership of any data or content you upload to the platform. By using our service, you grant us a license to host, store, and process your content solely for the purpose of providing the service to you.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-slate-900">4. Prohibited Activities</h2>
                        <p>
                            Users are prohibited from:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Using the service for any illegal or unauthorized purpose.</li>
                            <li>Attempting to hack, destabilize, or interfere with the service.</li>
                            <li>Uploading malicious code or content that infringes on third-party rights.</li>
                            <li>Reverse engineering any part of the platform.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-slate-900">5. Limitation of Liability</h2>
                        <p>
                            To the maximum extent permitted by law, EduCare Inc. shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use or inability to use the service.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-slate-900">6. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these Terms and Conditions at any time. We will notify users of significant changes, and continued use of the service constitutes acceptance of the new terms.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-slate-900">7. Governing Law</h2>
                        <p>
                            These terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.
                        </p>
                    </section>

                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mt-12">
                        <p className="text-sm text-amber-700">
                            <strong>Disclaimer:</strong> These Terms and Conditions are a boilerplate template generated for demonstration purposes. They should be reviewed and customized by legal counsel to ensure they meet your specific business and legal requirements.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
