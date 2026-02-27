import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-white text-slate-900 py-16 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 mb-8 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Link>

                <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

                <div className="prose prose-slate max-w-none space-y-6 text-slate-600">
                    <p className="text-sm italic">Last Updated: February 27, 2026</p>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-slate-900">1. Introduction</h2>
                        <p>
                            Welcome to EduFlow ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our school management software-as-a-service (SaaS) platform.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-slate-900">2. Information We Collect</h2>
                        <p>
                            We collect personal information that you provide to us, such as name, email address, contact information, and school-related data. We also collect information automatically when you visit our platform, including IP addresses, browser types, and usage patterns.
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>School Data:</strong> Student records, attendance, grades, and administrative information provided by school administrators.</li>
                            <li><strong>User Data:</strong> Login credentials, profile information, and communication preferences.</li>
                            <li><strong>Payment Data:</strong> Payment information processed through our secure third-party payment processors.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-slate-900">3. How We Use Your Information</h2>
                        <p>
                            We use the information we collect to provide, maintain, and improve our services, including:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>To facilitate the management of school operations.</li>
                            <li>To process transactions and send related information.</li>
                            <li>To send administrative messages, updates, and security alerts.</li>
                            <li>To respond to your comments, questions, and support requests.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-slate-900">4. Data Security</h2>
                        <p>
                            We implement forensic-grade security measures to protect the confidentiality and integrity of your data. However, please be aware that no security system is impenetrable, and we cannot guarantee the absolute security of your information.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-slate-900">5. Your Privacy Rights</h2>
                        <p>
                            Depending on your location, you may have certain rights regarding your personal information, such as the right to access, correct, or delete your data. Please contact us to exercise these rights.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-slate-900">6. Contact Us</h2>
                        <p>
                            If you have any questions or concerns about this Privacy Policy, please contact us at:
                        </p>
                        <p>
                            EduCare Inc.<br />
                            12A Ligali Ayorinde St,<br />
                            Victoria Island, Lagos.<br />
                            Email: privacy@educare.ng
                        </p>
                    </section>

                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mt-12">
                        <p className="text-sm text-amber-700">
                            <strong>Disclaimer:</strong> This Privacy Policy is a boilerplate template generated for demonstration purposes. It should be reviewed and customized by legal counsel to ensure compliance with applicable laws (e.g., NDPR in Nigeria).
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
