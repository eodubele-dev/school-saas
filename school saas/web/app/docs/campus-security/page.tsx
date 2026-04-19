import Link from "next/link"
import { Shield, Lock, Eye, CheckCircle2, ChevronRight, Hash, ShieldAlert } from "lucide-react"
import { Callout } from "@/components/docs/callout"
import { CodeBlock } from "@/components/docs/code-block"

export default function CampusSecurityDoc() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="mb-12 border-b border-white/5 pb-12">
                <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 tracking-[0.2em] uppercase mb-4">
                    <Hash className="w-3 h-3" />
                    Protocol: Audit_Integrity_v4
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight">
                    Forensic Audit Logs
                </h1>
                <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
                    Why "Grade Tampering" is mathematically impossible on the EduFlow OS through immutable, cryptographic ledgers.
                </p>
            </div>

            <div className="prose prose-invert prose-slate max-w-none">
                <p className="text-lg leading-relaxed text-slate-300">
                    In traditional school software, a staff member with "Admin" rights can often silently edit grade sheets. 
                    EduFlow treats every academic record as if it were a <strong>Financial Transaction</strong>. Once committed, it cannot be altered without leaving a permanent forensic trace.
                </p>

                <Callout type="security" title="DATA ISOLATION">
                    Every institution on EduFlow operates within its own encrypted database vault. There is no cross-tenant data leakage, and system logs are signed at the infrastructure level.
                </Callout>

                <h2 id="architecture" className="text-2xl font-bold text-white mt-16 mb-6">The Forensic Ledger</h2>
                <p>
                    Every "Write" operation to the Gradebook is cryptographically signed and appended to a "WORM" (Write-Once-Read-Many) log table. Note how the system captures the "Delta"—the exact change from the old value to the new.
                </p>

                {/* Audit Log Table Mockup */}
                <div className="my-10 rounded-2xl overflow-hidden border border-white/5 bg-[#000000] shadow-2xl relative group">
                    <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div className="flex items-center justify-between px-6 py-4 bg-white/[0.02] border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-500" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">System_Gravity_Logs // Live_Feed</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            VAULT_SECURE
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.01]">
                                    <th className="p-5 text-[10px] font-mono text-slate-600 uppercase tracking-widest">Timestamp</th>
                                    <th className="p-5 text-[10px] font-mono text-slate-600 uppercase tracking-widest">Operator</th>
                                    <th className="p-5 text-[10px] font-mono text-slate-600 uppercase tracking-widest">Event</th>
                                    <th className="p-5 text-[10px] font-mono text-slate-600 uppercase tracking-widest">Delta</th>
                                    <th className="p-5 text-[10px] font-mono text-slate-600 uppercase tracking-widest text-right">Signature</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs font-mono">
                                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group/row">
                                    <td className="p-5 text-slate-500">2026-04-19 10:42:05</td>
                                    <td className="p-5 text-white">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded bg-blue-600/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">JD</div>
                                            J. Doe (Admin)
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">GRADE_OVERRIDE</span>
                                    </td>
                                    <td className="p-5">
                                        <span className="text-slate-600 line-through mr-2">65</span>
                                        <span className="text-emerald-400 font-bold">82</span>
                                    </td>
                                    <td className="p-5 text-slate-700 text-right group-hover/row:text-slate-500 transition-colors">0x4f...a29</td>
                                </tr>
                                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group/row">
                                    <td className="p-5 text-slate-500">2026-04-19 10:45:12</td>
                                    <td className="p-5 text-white">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded bg-red-600/20 text-red-400 flex items-center justify-center text-[10px] font-bold">SY</div>
                                            Sentinel_AI
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-1 w-fit">
                                            <ShieldAlert className="w-3 h-3" />
                                            ANOMALY_FLAG
                                        </span>
                                    </td>
                                    <td className="p-5 text-slate-500">
                                        Manual override &gt; 15% threshold
                                    </td>
                                    <td className="p-5 text-slate-700 text-right group-hover/row:text-slate-500 transition-colors">0x9c...b12</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <h2 id="security" className="text-2xl font-bold text-white mt-16 mb-6">Technical Implementation</h2>
                <p>
                    Administrators can verify the authenticity of any log entry by querying the system audit endpoint. Every payload is signed with a unique workstation key.
                </p>

                <CodeBlock 
                    filename="audit-verification.ts"
                    language="typescript"
                    code={`// Verify a suspicious grade change log
const logEntry = await eduflow.audit.get('log_8231fk-92');

if (logEntry.isTampered()) {
  throw new SecurityAlert('Forensic mismatch detected in academic record');
}

console.log('Delta Signature:', logEntry.getForensicSignature());`}
                />

                <Callout type="important">
                    Only users with the `PROPRIETOR_LEVEL` role can purge logs. Purging a log does not delete it; it strictly move it to the "Archived Forensics" vault for long-term storage compliance.
                </Callout>

                <h2 id="benefits" className="text-2xl font-bold text-white mt-16 mb-6">Executive Impact</h2>
                <div className="grid md:grid-cols-2 gap-6 not-prose my-10">
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <Lock className="w-5 h-5 text-blue-400" />
                            <strong className="text-white font-bold">Zero Favoritism</strong>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Immediate logging of all modifications eliminates arbitrary score inflation, ensuring academic meritocracy across the institution.
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            <strong className="text-white font-bold">Unshakeable Trust</strong>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Prove with mathematical certainty that every report card is a "Single Source of Truth", backed by an unalterable forensic ledger.
                        </p>
                    </div>
                </div>

                {/* Pagination Footer */}
                <div className="mt-24 pt-8 border-t border-white/5 flex items-center justify-between not-prose">
                    <Link href="/docs" className="group flex flex-col items-start gap-2">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Previous Article</span>
                        <span className="flex items-center gap-2 text-sm text-white font-bold group-hover:text-blue-400 transition-colors">
                            <ChevronRight className="w-4 h-4 rotate-180" />
                            Getting Started
                        </span>
                    </Link>
                    <Link href="/docs/financial-integrity" className="group flex flex-col items-end gap-2 text-right">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Next Up</span>
                        <span className="flex items-center gap-2 text-sm text-white font-bold group-hover:text-blue-400 transition-colors">
                            Financial Integrity
                            <ChevronRight className="w-4 h-4" />
                        </span>
                    </Link>
                </div>
            </div>
        </div>
    )
}
