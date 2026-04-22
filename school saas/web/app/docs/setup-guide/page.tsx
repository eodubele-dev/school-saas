import Link from "next/link"
import { LayoutDashboard, ChevronRight, Hash, ShieldCheck, CheckCircle2, UserPlus, FileText, Settings, Settings2 } from "lucide-react"
import { Callout } from "@/components/docs/callout"
import { CodeBlock } from "@/components/docs/code-block"
import { cn } from "@/lib/utils"

export default function SetupGuideDoc() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="mb-12 border-b border-white/5 pb-12">
                <div className="flex items-center gap-2 text-[10px] font-mono text-blue-400 tracking-[0.2em] uppercase mb-4">
                    <Hash className="w-3 h-3" />
                    Module: Core_Infrastructure
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight">
                    Post-Onboarding Setup
                </h1>
                <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
                    A comprehensive, step-by-step guide to configuring your institution after completing the initial onboarding wizard.
                </p>
            </div>

            <div className="prose prose-invert prose-slate max-w-none text-slate-300">
                <p className="text-lg leading-relaxed">
                    Congratulations on activating your EduFlow tenant! To ensure a smooth transition for your staff, students, and parents, please follow this standardized deployment sequence. Skipping steps may result in permission errors or misaligned academic records.
                </p>

                <Callout type="warning" title="CRITICAL REQUIREMENT">
                    You must be logged in as an <strong>Administrator</strong> or <strong>Owner</strong> to perform these setup actions.
                </Callout>

                <h2 id="step-1" className="text-2xl font-bold text-white mt-16 mb-6">Step 1: Academic Configuration</h2>
                <p>
                    Before you can add students or classes, you must define the academic framework of your institution.
                </p>
                <div className="space-y-4 not-prose my-6">
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0">1</div>
                        <div>
                            <h4 className="text-white font-bold mb-1">Create an Academic Session</h4>
                            <p className="text-sm text-slate-400">Navigate to <strong>Academic Setup</strong> &gt; <strong>Sessions</strong>. Create your current academic year (e.g., "2026/2027") and set it as <em>Active</em>.</p>
                        </div>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0">2</div>
                        <div>
                            <h4 className="text-white font-bold mb-1">Define the Grading Scale</h4>
                            <p className="text-sm text-slate-400">Go to <strong>Academic Setup</strong> &gt; <strong>Grading</strong>. Set your score ranges (e.g., A = 75-100, B = 65-74) and ensure they align with your curriculum standards.</p>
                        </div>
                    </div>
                </div>

                <h2 id="step-2" className="text-2xl font-bold text-white mt-16 mb-6">Step 2: Infrastructure & Classes</h2>
                <p>
                    Build the physical and digital hierarchy of your institution.
                </p>
                <div className="space-y-4 not-prose my-6">
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0">1</div>
                        <div>
                            <h4 className="text-white font-bold mb-1">Add Class Grades</h4>
                            <p className="text-sm text-slate-400">Navigate to <strong>Academic Setup</strong> &gt; <strong>Classes</strong>. Add your standard grade levels (e.g., "JSS 1", "SSS 3").</p>
                        </div>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold shrink-0">2</div>
                        <div>
                            <h4 className="text-white font-bold mb-1">Create Arms / Sections (Optional)</h4>
                            <p className="text-sm text-slate-400">If your classes are split (e.g., JSS 1A, JSS 1B), create the arms within the specific class configuration.</p>
                        </div>
                    </div>
                </div>

                <Callout type="tip" title="BEST PRACTICE">
                    Assign Form Teachers to their respective classes immediately after creation. This grants them the necessary permissions to manage attendance and behavioral records.
                </Callout>

                <h2 id="step-3" className="text-2xl font-bold text-white mt-16 mb-6">Step 3: People Management</h2>
                <p>
                    Populate your tenant with your staff and student body.
                </p>
                <div className="grid md:grid-cols-2 gap-6 my-8 not-prose">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-transparent border border-emerald-500/10 hover:border-emerald-500/30 transition-all">
                        <UserPlus className="w-6 h-6 text-emerald-400 mb-4" />
                        <h4 className="text-white font-bold mb-2">Invite Staff</h4>
                        <p className="text-sm text-slate-400 mb-4">Go to <strong>Faculty Directory</strong>. Use the "Invite Staff" button to send onboarding emails to teachers, bursars, and security personnel.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-950/30 to-transparent border border-blue-500/10 hover:border-blue-500/30 transition-all">
                        <FileText className="w-6 h-6 text-blue-400 mb-4" />
                        <h4 className="text-white font-bold mb-2">Enroll Students</h4>
                        <p className="text-sm text-slate-400 mb-4">Go to <strong>Student Enrollment</strong>. You can manually register students or use the "Bulk Import" feature via CSV for faster processing.</p>
                    </div>
                </div>

                <h2 id="step-4" className="text-2xl font-bold text-white mt-16 mb-6">Step 4: Financial Configuration</h2>
                <p>
                    Ensure your bursary department is ready to process tuition.
                </p>
                <ol className="space-y-4 text-slate-300">
                    <li>Navigate to <strong>Financial Config</strong> in the sidebar.</li>
                    <li><strong>Set Base Fees:</strong> Define standard tuition fees for each class level.</li>
                    <li><strong>Configure Payment Gateway:</strong> Enter your Paystack or Monnify API keys to enable instant online settlements.</li>
                    <li><strong>Test the Payment Flow:</strong> We strongly recommend running a test transaction of ₦100 to verify your webhook connectivity.</li>
                </ol>

                <h2 id="step-5" className="text-2xl font-bold text-white mt-16 mb-6">Step 5: Communication Hub</h2>
                <p>
                    Connect with parents instantly via SMS and the Parent Portal.
                </p>
                <ul className="space-y-4 text-slate-300">
                    <li><strong>Fund SMS Wallet:</strong> Go to <strong>School Settings &gt; SMS Notifications</strong> and fund your wallet to ensure attendance alerts and payment nudges can be delivered.</li>
                    <li><strong>Review Sender ID:</strong> Ensure your custom Sender ID (e.g., "EDUFLOW") is approved and active.</li>
                </ul>

                <Callout type="success" title="SYSTEM READY">
                    Once these five steps are completed, your institution is fully operational on EduFlow. You can now direct teachers to begin lesson planning and direct parents to download the mobile app.
                </Callout>

                {/* Pagination Footer */}
                <div className="mt-24 pt-8 border-t border-white/5 flex items-center justify-between not-prose">
                    <Link href="/docs" className="group flex flex-col items-start gap-2">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Previous Article</span>
                        <span className="flex items-center gap-2 text-sm text-white font-bold group-hover:text-blue-400 transition-colors">
                            <ChevronRight className="w-4 h-4 rotate-180" />
                            Getting Started
                        </span>
                    </Link>
                    <Link href="/docs/platform-overview" className="group flex flex-col items-end gap-2 text-right">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Next Article</span>
                        <span className="flex items-center gap-2 text-sm text-white font-bold group-hover:text-blue-400 transition-colors">
                            Platform Overview
                            <ChevronRight className="w-4 h-4" />
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
