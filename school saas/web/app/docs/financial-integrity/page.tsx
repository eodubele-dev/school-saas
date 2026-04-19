import Link from "next/link"
import { CreditCard, ChevronRight, Hash, Zap, Landmark, ArrowUpRight } from "lucide-react"
import { Callout } from "@/components/docs/callout"
import { CodeBlock } from "@/components/docs/code-block"

export default function FinancialIntegrityDoc() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="mb-12 border-b border-white/5 pb-12">
                <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400 tracking-[0.2em] uppercase mb-4">
                    <Hash className="w-3 h-3" />
                    Module: Revenue_Engine_Alpha
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight">
                    Financial Integrity
                </h1>
                <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
                    How automated "nudge" algorithms and results-blurring create a confrontation-free payment culture for modern institutions.
                </p>
            </div>

            <div className="prose prose-invert prose-slate max-w-none text-slate-300">
                <p className="text-lg leading-relaxed">
                    Schools often lose up to <strong>30% of potential revenue</strong> to delayed payments and "goodwill" extensions that are never honored. 
                    EduFlow eliminates this utilizing a <strong>Zero-Confrontation Enforcement Protocol</strong>.
                </p>

                <Callout type="tip" title="QUICK STAT">
                    Schools utilizing the automatic Result Blur feature report a 40% increase in early tuition payments within the first term of deployment.
                </Callout>

                <h2 id="overview" className="text-2xl font-bold text-white mt-16 mb-6">The "Pay-to-Unlock" Algorithm</h2>
                <p>
                    Instead of relying on bursars to chase parents, the system automatically restricts access to high-value digital assets (Report Cards, LMS) based on real-time ledger status. This logic is computed at the edge, ensuring instant enforcement.
                </p>

                <CodeBlock 
                    filename="revenue-engine.ts"
                    language="typescript"
                    code={`async function checkAccess(studentId: string, resource: 'REPORT' | 'LMS') {
  // 1. Fetch real-time balance from the Immutable Ledger
  const balance = await ledger.getBalance(studentId);

  // 2. Evaluate against institutional threshold (e.g. ₦10,000)
  if (balance.totalDebt > 10000) {
    return {
      status: 'RESTRICTED',
      action: 'BLUR_INTER_NET',
      cta: 'SETTLE_INVOICE_NOW'
    };
  }

  return { status: 'GRANTED' };
}`}
                />

                <h2 id="architecture" className="text-2xl font-bold text-white mt-16 mb-6">Workflow Visualization</h2>
                <div className="space-y-6 not-prose my-10">
                    {[
                        { 
                            step: 1, 
                            title: "T-Minus 3 Days (SMS Nudge)", 
                            desc: "System sends a polite, automated reminder via SMS/WhatsApp with a direct 'Paystack-Ready' payment link.",
                            color: "text-blue-400",
                            bg: "bg-blue-500/5",
                            border: "border-blue-500/20"
                        },
                        { 
                            step: 2, 
                            title: "Result Day (The Lock)", 
                            desc: "If fees remain unpaid, the Report Card is accessible but heavily blurred. A 'Pay Now to Unlock' button is prominent.",
                            color: "text-amber-400",
                            bg: "bg-amber-500/5",
                            border: "border-amber-500/20"
                        },
                        { 
                            step: 3, 
                            title: "Instant Restoration", 
                            desc: "Upon successful transaction, the system instantly unblurs the results. Zero staff intervention required.",
                            color: "text-emerald-400",
                            bg: "bg-emerald-500/5",
                            border: "border-emerald-500/20"
                        }
                    ].map((item) => (
                        <div key={item.step} className={cn("p-6 rounded-2xl border flex gap-6 group transition-all", item.bg, item.border)}>
                            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-black border group-hover:scale-110 transition-transform", item.color, item.border)}>
                                {item.step}
                            </div>
                            <div>
                                <h4 className="text-white font-bold mb-1">{item.title}</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <h2 id="security" className="text-2xl font-bold text-white mt-16 mb-6">The Bursar Experience</h2>
                <p>
                    Bursars move from being "debt collectors" to "financial analysts". The system provides a real-time heatmap of revenue collection across all grades and sessions.
                </p>

                <Callout type="important">
                    Manual overrides can be granted by authorized staff (e.g. for scholarship students), but every override triggers a **Forensic Security Alert** and is logged against the staff's workstation.
                </Callout>

                <div className="p-8 rounded-[2rem] bg-blue-600/5 border border-blue-500/10 flex flex-col md:flex-row items-center gap-8 my-12 not-prose">
                    <div className="flex-1">
                        <h4 className="text-white font-bold text-xl mb-2">Ready for deployment?</h4>
                        <p className="text-sm text-slate-500">Learn how to configure your payment gateway and start recovering revenue.</p>
                    </div>
                    <button className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-all flex items-center gap-2 shadow-2xl shadow-blue-900/40">
                        View Gateway Setup <ArrowUpRight className="w-4 h-4" />
                    </button>
                </div>

                {/* Pagination Footer */}
                <div className="mt-24 pt-8 border-t border-white/5 flex items-center justify-between not-prose">
                    <Link href="/docs/campus-security" className="group flex flex-col items-start gap-2">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Previous Article</span>
                        <span className="flex items-center gap-2 text-sm text-white font-bold group-hover:text-amber-400 transition-colors">
                            <ChevronRight className="w-4 h-4 rotate-180" />
                            Forensic Security
                        </span>
                    </Link>
                    <Link href="/docs" className="group flex flex-col items-end gap-2 text-right opacity-50 cursor-not-allowed">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">End of Series</span>
                        <span className="flex items-center gap-2 text-sm text-white font-bold">
                            API Reference Coming Soon
                            <ChevronRight className="w-4 h-4" />
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}
