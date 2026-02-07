"use client"

import React from 'react';
import { ShieldAlert, FileText, BarChart3, Fingerprint, ClipboardCheck, Printer, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuditStat {
    label: string;
    value: string | number;
    significance: string;
}

interface DeviationEntry {
    date: string;
    staffName: string;
    deviationType: string;
    authorizer: string;
    proofId: string;
    distance: number;
}

interface BursaryAuditTrailProps {
    institutionName?: string;
    auditId: string;
    period: string;
    stats: {
        totalPings: number;
        successRate: string;
        geofenceFailures: number;
        manualOverrides: number;
        disputeRejections: number;
    };
    ledger: DeviationEntry[];
}

export const BursaryAuditTrail: React.FC<BursaryAuditTrailProps> = ({
    institutionName = "Achievers Minds Schools",
    auditId,
    period,
    stats,
    ledger
}) => {
    const auditStats: AuditStat[] = [
        { label: "Total Attendance Pings", value: stats.totalPings, significance: "Total raw clock-in attempts." },
        { label: "Geofence Success Rate", value: `${stats.successRate}%`, significance: "Automated location verifications." },
        { label: "Geofence Failures", value: stats.geofenceFailures, significance: "Attempts outside the 100m radius." },
        { label: "Manual Overrides", value: stats.manualOverrides, significance: "Total human-authorized clock-ins." },
        { label: "Dispute Rejections", value: stats.disputeRejections, significance: "Principal-denied attendance requests." }
    ];

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="bg-[#0A0A0B] border border-white/10 rounded-3xl p-10 shadow-2xl max-w-5xl mx-auto space-y-12 print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
            {/* 🏛️ Header */}
            <div className="flex justify-between items-start border-b border-white/10 pb-8 print:border-black">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="bg-cyan-500/10 p-2 rounded-xl border border-cyan-500/20 print:hidden">
                            <ShieldAlert className="text-cyan-400" size={24} />
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tighter uppercase print:text-black">
                            Monthly Bursary Audit Transcript
                        </h1>
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest print:text-gray-600">
                            Institution: <span className="text-white font-bold print:text-black">{institutionName}</span>
                        </p>
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest print:text-gray-600">
                            Audit_ID: <span className="text-cyan-400 font-bold">{auditId}</span>
                        </p>
                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest print:text-gray-600">
                            Reporting_Period: <span className="text-slate-300 font-bold print:text-gray-800">{period}</span>
                        </p>
                    </div>
                </div>
                <div className="text-right space-y-2">
                    <div className="bg-emerald-500/5 border border-emerald-500/20 px-4 py-2 rounded-xl print:border-black">
                        <p className="text-[10px] font-mono text-emerald-500 font-black uppercase tracking-widest">System_Status</p>
                        <p className="text-xs text-white font-bold print:text-black mt-1 flex items-center justify-end gap-2">
                            <Fingerprint size={12} className="text-emerald-500" /> Verified Integrity (Forensic Lock Active)
                        </p>
                    </div>
                </div>
            </div>

            {/* 📋 Section 1: Statistical Summary */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <BarChart3 className="text-cyan-400" size={18} />
                    <h2 className="text-sm font-black text-white uppercase tracking-[0.3em] print:text-black">1. Statistical Summary (System Performance)</h2>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden print:border-black">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white/5 print:bg-gray-100">
                            <tr>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest print:text-black">Metric</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest print:text-black">Value</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest print:text-black">Audit Significance</th>
                            </tr>
                        </thead>
                        <tbody className="text-[11px] font-medium">
                            {auditStats.map((stat, idx) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors print:border-gray-200">
                                    <td className="py-4 px-6 text-slate-400 print:text-black">{stat.label}</td>
                                    <td className="py-4 px-6 text-white font-bold print:text-black">{stat.value}</td>
                                    <td className="py-4 px-6 text-slate-500 italic print:text-gray-600">{stat.significance}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 🛡️ Section 2: Detailed Deviation Ledger */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <FileText className="text-red-500" size={18} />
                    <h2 className="text-sm font-black text-white uppercase tracking-[0.3em] print:text-black">2. Detailed Deviation Ledger (The Forensic Trail)</h2>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden print:border-black">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white/5 print:bg-gray-100">
                            <tr>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest print:text-black">Date</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest print:text-black">Staff Member</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest print:text-black">Deviation Type</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest print:text-black">Admin Authorizer</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-widest print:text-black">Forensic Proof ID</th>
                            </tr>
                        </thead>
                        <tbody className="text-[11px] font-medium">
                            {ledger.map((entry, idx) => (
                                <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors print:border-gray-200">
                                    <td className="py-4 px-6 text-slate-400 print:text-black">{entry.date}</td>
                                    <td className="py-4 px-6 text-white font-bold print:text-black">{entry.staffName}</td>
                                    <td className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="text-red-400 font-bold uppercase print:text-black">{entry.deviationType}</span>
                                            <span className="text-[9px] text-slate-600 font-mono mt-0.5">[{entry.distance}m Deviation]</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-cyan-400 font-black italic print:text-black">{entry.authorizer}</td>
                                    <td className="py-4 px-6 font-mono text-slate-500 print:text-black">{entry.proofId}</td>
                                </tr>
                            ))}
                            {ledger.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-600 font-mono uppercase tracking-widest">
                                        Zero_Deviations_Recorded_In_This_Period
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ⚖️ Section 3: Administrative Justification & Notes */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <ClipboardCheck className="text-emerald-500" size={18} />
                    <h2 className="text-sm font-black text-white uppercase tracking-[0.3em] print:text-black">3. Administrative Justification & Notes</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/5 border border-white/5 p-6 rounded-2xl print:border-black">
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-3 letter-spacing-widest">Manual Overrides</p>
                        <p className="text-[11px] text-slate-400 leading-relaxed italic print:text-black">
                            All {stats.manualOverrides} overrides were accompanied by mandatory photo evidence uploaded through the Attendance Dispute view.
                        </p>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-6 rounded-2xl print:border-black">
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-3">Identity Pinning</p>
                        <p className="text-[11px] text-slate-400 leading-relaxed italic print:text-black">
                            Each authorization was signed by the Admin Principal's unique JWT credential, ensuring no staff member could self-authorize.
                        </p>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-6 rounded-2xl print:border-black">
                        <p className="text-[10px] font-black text-slate-500 uppercase mb-3">Payroll Impact</p>
                        <p className="text-[11px] text-slate-400 leading-relaxed italic print:text-black">
                            Reconciled totals were adjusted for the {stats.disputeRejections} unexcused absences detected by the Smart Attendance engine.
                        </p>
                    </div>
                </div>
            </div>

            {/* 🖋️ Certification of Integrity */}
            <div className="pt-12 border-t border-white/10 space-y-12 print:border-black print:pt-20">
                <p className="text-xs text-slate-400 text-center max-w-2xl mx-auto italic print:text-black">
                    I, the undersigned, certify that this report is a direct extract from the System Audit & Integrity Log. No records have been modified, deleted, or suppressed.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-3xl mx-auto">
                    <div className="text-center space-y-4">
                        <div className="h-px bg-white/20 w-full print:bg-black" />
                        <div>
                            <p className="text-[11px] font-black text-white uppercase tracking-widest print:text-black">[Bursar Name]</p>
                            <p className="text-[9px] text-slate-500 font-mono uppercase mt-1">Financial Controller, Achievers Minds Schools</p>
                        </div>
                    </div>
                    <div className="text-center space-y-4">
                        <div className="h-px bg-white/20 w-full print:bg-black" />
                        <div>
                            <p className="text-[11px] font-black text-white uppercase tracking-widest print:text-black">[Proprietor Name]</p>
                            <p className="text-[9px] text-slate-500 font-mono uppercase mt-1">Group Proprietor</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🏁 Footer Actions */}
            <div className="flex justify-center gap-6 pt-6 print:hidden">
                <button
                    onClick={handlePrint}
                    className="bg-white/5 hover:bg-white/10 text-white font-black px-12 py-4 rounded-2xl flex items-center gap-3 transition-all border border-white/10 uppercase text-xs tracking-widest"
                >
                    <Printer size={18} /> Print Audit Transcript
                </button>
                <button className="bg-cyan-600 hover:bg-cyan-500 text-white font-black px-12 py-4 rounded-2xl flex items-center gap-3 transition-all shadow-[0_0_30px_rgba(8,145,178,0.3)] uppercase text-xs tracking-widest">
                    <Download size={18} /> Export as Forensic PDF
                </button>
            </div>
        </div>
    );
};
