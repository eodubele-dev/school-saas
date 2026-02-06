"use client"

import React, { useState } from 'react';
import { FileText, AlertCircle, CheckCircle2, Download, ChevronDown, ChevronUp, MapPin, UserCheck, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BursarOverrideDetail } from './bursar-override-detail';

interface OverrideDetail {
    date: string;
    distance: number;
    principalNote: string;
}

interface StaffReconciliationData {
    id: string;
    name: string;
    role: string;
    daysPresent: number;
    totalDays: number;
    flags: number;
    overrideDetails: OverrideDetail[];
}

interface PayrollReconciliationReportProps {
    staffData: StaffReconciliationData[];
    month: string;
    year: number;
}

export const PayrollReconciliationReport: React.FC<PayrollReconciliationReportProps> = ({ staffData, month, year }) => {
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [auditState, setAuditState] = useState<{ staff: StaffReconciliationData, index: number } | null>(null);

    const toggleRow = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    return (
        <div className="bg-[#0A0A0B] border border-white/10 rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                        <FileText className="text-cyan-400" /> Payroll Reconciliation
                    </h2>
                    <p className="text-slate-500 text-[10px] font-mono uppercase tracking-[0.3em] mt-2">
                        Audit_Mode_Active // Period: {month} {year}
                    </p>
                </div>
                <button className="bg-white/5 border border-white/10 text-white px-6 py-2.5 rounded-2xl flex items-center gap-2 hover:bg-white/10 transition-all active:scale-95 font-bold text-xs uppercase tracking-widest group">
                    <Download size={16} className="text-cyan-400 group-hover:animate-bounce" /> Export for Bank
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.01]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Member</th>
                            <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Net Attendance</th>
                            <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Forensic Flags</th>
                            <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reconciliation Status</th>
                            <th className="py-4 px-6"></th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {staffData.map((staff) => (
                            <React.Fragment key={staff.id}>
                                <tr
                                    className={cn(
                                        "border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer group",
                                        expandedRow === staff.id && "bg-white/[0.04]"
                                    )}
                                    onClick={() => toggleRow(staff.id)}
                                >
                                    <td className="py-6 px-6">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-200 group-hover:text-white transition-colors uppercase tracking-tight">{staff.name}</span>
                                            <span className="text-[10px] text-slate-500 font-mono uppercase mt-1">{staff.role}</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-6 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-white font-black text-lg">{staff.daysPresent}</span>
                                            <span className="text-[10px] text-slate-600 font-mono">/ {staff.totalDays} DAYS</span>
                                        </div>
                                    </td>
                                    <td className="py-6 px-6">
                                        {staff.flags > 0 ? (
                                            <div className="flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-widest bg-amber-500/5 border border-amber-500/20 px-3 py-1.5 rounded-lg w-fit shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                                                <AlertCircle size={14} className="animate-pulse" /> {staff.flags} override_events
                                            </div>
                                        ) : (
                                            <span className="text-slate-700 font-mono text-[10px] uppercase tracking-widest ml-1">0_flags_detected</span>
                                        )}
                                    </td>
                                    <td className="py-6 px-6">
                                        <div className={cn(
                                            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all shadow-sm",
                                            staff.flags === 0
                                                ? 'bg-cyan-500/5 text-cyan-400 border-cyan-500/20'
                                                : 'bg-red-500/5 text-red-500 border-red-500/20'
                                        )}>
                                            {staff.flags === 0 ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                            {staff.flags === 0 ? 'Protocol_Verified' : 'Bursar_Review_Required'}
                                        </div>
                                    </td>
                                    <td className="py-6 px-6 text-right">
                                        {staff.flags > 0 && (
                                            <div className="text-slate-500 group-hover:text-white transition-colors">
                                                {expandedRow === staff.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </div>
                                        )}
                                    </td>
                                </tr>

                                {/* Expanded Details Pane */}
                                {expandedRow === staff.id && staff.flags > 0 && (
                                    <tr className="bg-black/40 border-b border-white/5 animate-in slide-in-from-top-2 duration-300">
                                        <td colSpan={5} className="p-0">
                                            <div className="p-8 space-y-4">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <AlertCircle size={16} className="text-amber-500" />
                                                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Forensic Flag Detail: {staff.name}</h4>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {staff.overrideDetails.map((detail, idx) => (
                                                        <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-3 relative overflow-hidden group/item">
                                                            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover/item:opacity-40 transition-opacity">
                                                                <MapPin size={40} className="text-slate-500" />
                                                            </div>
                                                            <div className="relative z-10">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <span className="text-[10px] font-mono text-cyan-400 group-hover:text-cyan-300 transition-colors uppercase">{detail.date}</span>
                                                                    <span className="text-[10px] font-mono text-red-400">{detail.distance}m Deviation</span>
                                                                </div>
                                                                <div className="flex gap-3 items-start bg-black/40 p-3 rounded-xl border border-white/5">
                                                                    <UserCheck size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                                                    <p className="text-[11px] text-slate-300 leading-relaxed font-medium capitalize">
                                                                        "{detail.principalNote}"
                                                                    </p>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setAuditState({ staff, index: idx });
                                                                    }}
                                                                    className="w-full mt-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest py-2 rounded-lg border border-red-500/20 transition-all flex items-center justify-center gap-2"
                                                                >
                                                                    <ShieldAlert size={12} /> ENTER_FORENSIC_AUDIT
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 flex gap-4 items-center p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl">
                <CheckCircle2 size={18} className="text-cyan-500" />
                <p className="text-[11px] text-cyan-200/50 leading-relaxed font-medium uppercase tracking-wider">
                    Report Strategy: This forensic view cross-references <span className="text-cyan-400">Identity_Pins</span> with <span className="text-cyan-400">Approval_Streams</span>. Zero financial leakage protocol is currently enforced for February 2026.
                </p>
            </div>

            {/* Forensic Audit Modal */}
            {auditState && (
                <BursarOverrideDetail
                    staffMember={{ name: auditState.staff.name, role: auditState.staff.role }}
                    evidence={{
                        photoUrl: "", // In a real app index would fetch real photo
                        distance: auditState.staff.overrideDetails[auditState.index].distance,
                        date: auditState.staff.overrideDetails[auditState.index].date,
                        principalNote: auditState.staff.overrideDetails[auditState.index].principalNote,
                        authorizerName: "Admin_Principal"
                    }}
                    onClose={() => setAuditState(null)}
                    onConfirm={() => {
                        console.log("Confirmed for payroll:", auditState.staff.name);
                        setAuditState(null);
                    }}
                />
            )}
        </div>
    );
};
