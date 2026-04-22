import Link from "next/link"
import { Terminal, ChevronRight, Hash, Zap } from "lucide-react"
import { Callout } from "@/components/docs/callout"
import { CodeBlock } from "@/components/docs/code-block"

export default function WebhooksDoc() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="mb-12 border-b border-white/5 pb-12">
                <div className="flex items-center gap-2 text-[10px] font-mono text-orange-400 tracking-[0.2em] uppercase mb-4">
                    <Hash className="w-3 h-3" />
                    Module: Developer_Resources
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight">
                    Webhook Protocol
                </h1>
                <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
                    Listen to real-time events across your institution, from payment successes to disciplinary actions.
                </p>
            </div>

            <div className="prose prose-invert prose-slate max-w-none text-slate-300">
                <p className="text-lg leading-relaxed">
                    Instead of constantly polling the EduFlow API for changes, you can register Webhook URLs to receive HTTP POST payloads whenever specific events occur in your tenant.
                </p>

                <h2 id="events" className="text-2xl font-bold text-white mt-16 mb-6">Supported Events</h2>
                <ul className="space-y-2">
                    <li><code>payment.success</code> - Triggered when a parent completes a tuition payment via Paystack or Monnify.</li>
                    <li><code>student.enrolled</code> - Triggered when a new student is added to the directory.</li>
                    <li><code>attendance.flagged</code> - Triggered when a student is marked absent for 3 consecutive days.</li>
                    <li><code>security.gate_breach</code> - Triggered when an unauthorized exit is attempted via the Gate Control module.</li>
                </ul>

                <h2 id="payload" className="text-2xl font-bold text-white mt-16 mb-6">Payload Structure</h2>
                <p>
                    Every webhook request contains a JSON body with the event type and relevant data.
                </p>
                <CodeBlock 
                    filename="webhook-payload.json"
                    language="json"
                    code={`{
  "event": "payment.success",
  "data": {
    "student_id": "stu_01HX...",
    "amount": 45000,
    "currency": "NGN",
    "reference": "ref_93jd82...",
    "timestamp": "2026-04-22T14:30:00Z"
  }
}`}
                />

                <Callout type="tip">
                    Ensure your endpoint returns a <code>200 OK</code> status code within 5 seconds. If a timeout occurs, EduFlow will retry the webhook up to 3 times with exponential backoff.
                </Callout>

                {/* Pagination Footer */}
                <div className="mt-24 pt-8 border-t border-white/5 flex items-center justify-between not-prose">
                    <Link href="/docs/authentication" className="group flex flex-col items-start gap-2">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Previous Article</span>
                        <span className="flex items-center gap-2 text-sm text-white font-bold group-hover:text-orange-400 transition-colors">
                            <ChevronRight className="w-4 h-4 rotate-180" />
                            Authentication
                        </span>
                    </Link>
                    <Link href="/docs/changelog" className="group flex flex-col items-end gap-2 text-right">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Next Article</span>
                        <span className="flex items-center gap-2 text-sm text-white font-bold group-hover:text-orange-400 transition-colors">
                            Changelog
                            <ChevronRight className="w-4 h-4" />
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
