import { Terminal } from "lucide-react"

export default function FinancialIntegrityDoc() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-12 border-b border-white/10 pb-8">
                <p className="text-cyan-500 font-mono text-xs uppercase tracking-widest mb-3">Module: Revenue Engine</p>
                <h1 className="text-4xl font-bold text-white mb-4">The Logic of Fee Recovery</h1>
                <p className="text-xl text-slate-400">
                    How automated "nudge" algorithms and results-blurring create a confrontation-free payment culture.
                </p>
            </div>

            <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                <p>
                    Schools often lose up to <strong>30% of potential revenue</strong> to delayed payments and "goodwill" extensions that are never honored.
                    EduFlow eliminates this utilizing a <strong>Zero-Confrontation Enforcement Protocol</strong>.
                </p>

                <h3 className="text-white mt-12 mb-6">The "Pay-to-Unlock" Algorithm</h3>
                <p>
                    Instead of relying on bursars to chase parents, the system automatically restricts access to high-value digital assets (Report Cards, LMS) based on real-time ledger status.
                </p>

                {/* Code Block */}
                <div className="my-8 rounded-xl overflow-hidden border border-white/10 bg-[#000000] shadow-2xl">
                    <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/5">
                        <div className="flex gap-1.5">
                            <div className="w-3 h-3 rounded-full bg-red-500/20" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                            <div className="w-3 h-3 rounded-full bg-green-500/20" />
                        </div>
                        <span className="text-xs font-mono text-slate-500 ml-4">lib/revenue-engine.ts</span>
                    </div>
                    <div className="p-6 overflow-x-auto">
                        <pre className="font-mono text-sm leading-relaxed">
                            <code className="block">
                                <span className="text-purple-400">async function</span> <span className="text-blue-400">checkAccess</span>(studentId, resourceType) {"{"}{"\n"}
                                {"  "} <span className="text-slate-500">// 1. Fetch real-time balance from Ledger</span>{"\n"}
                                {"  "} <span className="text-purple-400">const</span> balance = <span className="text-purple-400">await</span> ledger.<span className="text-blue-400">getBalance</span>(studentId);{"\n"}
                                {"\n"}
                                {"  "} <span className="text-slate-500">// 2. Check Threshold (e.g., &gt; ₦5,000 debt)</span>{"\n"}
                                {"  "} <span className="text-purple-400">if</span> (balance.debt &gt; <span className="text-green-400">5000</span>) {"{"}{"\n"}
                                {"    "} <span className="text-purple-400">if</span> (resourceType === <span className="text-green-300">'REPORT_CARD'</span>) {"{"}{"\n"}
                                {"      "} <span className="text-slate-500">// 3. Enforce Blur Logic</span>{"\n"}
                                {"      "} <span className="text-purple-400">return</span> {"{"}{"\n"}
                                {"        "} status: <span className="text-red-400">'RESTRICTED'</span>,{"\n"}
                                {"        "} action: <span className="text-green-300">'BLUR_RESULTS'</span>,{"\n"}
                                {"        "} redirect: <span className="text-green-300">'/payment-gateway'</span>{"\n"}
                                {"      "} {"}"};{"\n"}
                                {"    "} {"}"}{"\n"}
                                {"  "} {"}"}{"\n"}
                                {"\n"}
                                {"  "} <span className="text-purple-400">return</span> {"{"} status: <span className="text-green-400">'GRANTED'</span> {"}"};{"\n"}
                                {"}"}
                            </code>
                        </pre>
                    </div>
                </div>

                <h3 className="text-white mt-12 mb-6">Workflow Visualization</h3>
                <ul className="list-none space-y-4 pl-0">
                    <li className="flex gap-4 items-start p-4 rounded-lg bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-colors">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">1</div>
                        <div>
                            <strong className="block text-white mb-1">T-Minus 3 Days (SMS Nudge)</strong>
                            <span className="text-slate-400 text-sm">System sends a polite, automated reminder to parents via SMS/WhatsApp with a direct payment link.</span>
                        </div>
                    </li>
                    <li className="flex gap-4 items-start p-4 rounded-lg bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-colors">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-sm">2</div>
                        <div>
                            <strong className="block text-white mb-1">Result Day (The Lock)</strong>
                            <span className="text-slate-400 text-sm">If fees remain unpaid, the Report Card is accessible but <strong>heavily blurred</strong>. A "Pay Now to Unlock" button is prominent.</span>
                        </div>
                    </li>
                    <li className="flex gap-4 items-start p-4 rounded-lg bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-colors">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold text-sm">3</div>
                        <div>
                            <strong className="block text-white mb-1">Instant Restoration</strong>
                            <span className="text-slate-400 text-sm">Upon successful transaction (via Paystack/Transfer), the system <strong>instantly unblurs</strong> the results. Zero staff intervention required.</span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    )
}
