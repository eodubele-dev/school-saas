import { Shield, Lock, Eye, CheckCircle2 } from "lucide-react"

export default function CampusSecurityDoc() {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-12 border-b border-white/10 pb-8">
                <p className="text-blue-500 font-mono text-xs uppercase tracking-widest mb-3">Module: Forensic Audit</p>
                <h1 className="text-4xl font-bold text-white mb-4">Immutable Audit Logs</h1>
                <p className="text-xl text-slate-400">
                    Why "Grade Tampering" is mathematically impossible on the EduFlow OS.
                </p>
            </div>

            <div className="prose prose-invert prose-lg max-w-none text-slate-300">
                <p>
                    In traditional school software, a staff member with "Admin" rights can often silently edit grade sheets.
                    EduFlow treats every academic record as a <strong>Financial Transaction</strong>. Once committed, it cannot be altered without leaving a permanent forensic trace.
                </p>

                <h3 className="text-white mt-12 mb-6">The Forensic Ledger</h3>
                <p>
                    Every "Write" operation to the Gradebook is cryptographically signed and appended to a "WORM" (Write-Once-Read-Many) log table.
                </p>

                {/* Audit Log Table Mockup */}
                <div className="my-8 rounded-xl overflow-hidden border border-white/10 bg-[#000000] shadow-2xl">
                    <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-500" />
                            <span className="text-sm font-bold text-white">System Gravity Logs (Live)</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-mono text-green-400">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            SECURE
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.02]">
                                    <th className="p-4 text-xs font-mono text-slate-500 uppercase">Timestamp</th>
                                    <th className="p-4 text-xs font-mono text-slate-500 uppercase">Actor</th>
                                    <th className="p-4 text-xs font-mono text-slate-500 uppercase">Event</th>
                                    <th className="p-4 text-xs font-mono text-slate-500 uppercase">Delta</th>
                                    <th className="p-4 text-xs font-mono text-slate-500 uppercase">Hash</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm font-mono">
                                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4 text-slate-400">10:42:05 AM</td>
                                    <td className="p-4 text-white">
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">JD</span>
                                            J. Doe
                                        </div>
                                    </td>
                                    <td className="p-4 text-yellow-400">GRADE_OVERRIDE</td>
                                    <td className="p-4">
                                        <span className="text-red-400 line-through mr-2">65</span>
                                        <span className="text-green-400">82</span>
                                    </td>
                                    <td className="p-4 text-slate-600 text-xs">0x4f...a29</td>
                                </tr>
                                <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                    <td className="p-4 text-slate-400">10:45:12 AM</td>
                                    <td className="p-4 text-white">
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-bold">SYS</span>
                                            Sentinel AI
                                        </div>
                                    </td>
                                    <td className="p-4 text-red-400">ANOMALY_DETECTED</td>
                                    <td className="p-4 text-slate-400">
                                        Manual override &gt; 15%
                                    </td>
                                    <td className="p-4 text-slate-600 text-xs">0x9c...b12</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <h3 className="text-white mt-12 mb-6">Why this Matters for Proprietors</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3 mb-3">
                            <Lock className="w-5 h-5 text-blue-400" />
                            <strong className="text-white">Zero "Favoritism"</strong>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Teachers know that every modification is logged. This psychological deterrent eliminates arbitrary score inflation for "favorite" students.
                        </p>
                    </div>
                    <div className="p-6 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3 mb-3">
                            <CheckCircle2 className="w-5 h-5 text-green-400" />
                            <strong className="text-white">Parental Trust</strong>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            You can prove to any parent that the result sheet is the "Single Source of Truth", backed by a mathematical audit trail.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
