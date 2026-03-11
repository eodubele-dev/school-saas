"use client"

import React from 'react';
import { ShieldAlert, FileText, BarChart3, Fingerprint, ClipboardCheck, Printer, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
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
    bursarName?: string;
    proprietorName?: string;
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
    bursarName = "Bursar",
    proprietorName = "System Administrator",
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

    const handleExportPDF = () => {
        toast.info("Select 'Save as PDF' in the destination dropdown to export.");
        setTimeout(() => window.print(), 500);
    }

    return (
        <React.Fragment>
            <style dangerouslySetInnerHTML={{
                __html: `
            @media print {
                body * {
                    visibility: hidden;
                }
                #printable-audit-trail, #printable-audit-trail * {
                    visibility: visible;
                }
                #printable-audit-trail {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100vw;
                    margin: 0;
                    padding: 0;
                    background: white;
                    color: black;
                }
            }
        `}} />
            <Card id="printable-audit-trail" className="bg-card text-card-foreground border-border shadow-sm max-w-5xl mx-auto print:bg-white print:text-black print:p-8 print:border-none print:shadow-none">
                {/* 🏛️ Header */}
                <CardHeader className="flex flex-row justify-between items-start border-b border-border pb-8 shrink-0 print:border-black">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="bg-cyan-500/10 p-2 rounded-xl border border-cyan-500/20 print:hidden">
                                <ShieldAlert className="text-cyan-400" size={24} />
                            </div>
                            <CardTitle className="text-2xl font-bold text-foreground tracking-tight print:text-black">
                                Monthly Bursary Audit Transcript
                            </CardTitle>
                        </div>
                        <div className="flex flex-col gap-1 mt-4">
                            <p className="text-xs font-medium text-muted-foreground print:text-gray-600">
                                Institution: <span className="text-foreground font-medium print:text-black">{institutionName}</span>
                            </p>
                            <p className="text-xs font-medium text-muted-foreground print:text-gray-600">
                                Audit ID: <span className="text-cyan-400 font-medium">{auditId}</span>
                            </p>
                            <p className="text-xs font-medium text-muted-foreground print:text-gray-600">
                                Reporting Period: <span className="text-slate-300 font-medium print:text-gray-800">{period}</span>
                            </p>
                        </div>
                    </div>
                    <div className="text-right space-y-2">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-lg print:border-black">
                            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">System Status</p>
                            <p className="text-xs text-emerald-50 font-bold print:text-black mt-1 flex items-center justify-end gap-2">
                                <Fingerprint size={12} className="text-emerald-500" /> Verified Integrity (Forensic Lock Active)
                            </p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-12 pt-8">

                    {/* 📋 Section 1: Statistical Summary */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="text-muted-foreground" size={18} />
                            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider print:text-black">1. Statistical Summary (System Performance)</h2>
                        </div>
                        <div className="bg-white/[0.02] border border-border/50 rounded-xl overflow-hidden print:border-black">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-secondary/50 print:bg-gray-100">
                                    <tr>
                                        <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider print:text-black">Metric</th>
                                        <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider print:text-black">Value</th>
                                        <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider print:text-black">Audit Significance</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {auditStats.map((stat, idx) => (
                                        <tr key={idx} className="border-b border-border/50 hover:bg-white/[0.04] transition-colors print:border-gray-200">
                                            <td className="py-4 px-6 text-slate-300 print:text-black">{stat.label}</td>
                                            <td className="py-4 px-6 text-foreground font-bold print:text-black">{stat.value}</td>
                                            <td className="py-4 px-6 text-muted-foreground print:text-gray-600">{stat.significance}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 🛡️ Section 2: Detailed Deviation Ledger */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <FileText className="text-muted-foreground" size={18} />
                            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider print:text-black">2. Detailed Deviation Ledger (The Forensic Trail)</h2>
                        </div>
                        <div className="bg-white/[0.02] border border-border/50 rounded-xl overflow-hidden print:border-black">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-secondary/50 print:bg-gray-100">
                                    <tr>
                                        <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider print:text-black">Date</th>
                                        <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider print:text-black">Staff Member</th>
                                        <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider print:text-black">Deviation Type</th>
                                        <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider print:text-black">Admin Authorizer</th>
                                        <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider print:text-black">Forensic Proof ID</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {ledger.map((entry, idx) => (
                                        <tr key={idx} className="border-b border-border/50 hover:bg-white/[0.04] transition-colors print:border-gray-200">
                                            <td className="py-4 px-6 text-slate-300 print:text-black">{entry.date}</td>
                                            <td className="py-4 px-6 text-foreground font-medium print:text-black">{entry.staffName}</td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col">
                                                    <span className="text-amber-500 font-medium print:text-black">{entry.deviationType}</span>
                                                    <span className="text-xs text-muted-foreground mt-0.5">[{entry.distance}m Deviation]</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-cyan-400 font-medium print:text-black">{entry.authorizer}</td>
                                            <td className="py-4 px-6 font-mono text-muted-foreground text-xs print:text-black">{entry.proofId}</td>
                                        </tr>
                                    ))}
                                    {ledger.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-muted-foreground font-medium tracking-wide">
                                                Zero Deviations Recorded In This Period
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
                            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider print:text-black">3. Administrative Justification & Notes</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-secondary/50 border border-border/50 p-6 rounded-xl print:border-black">
                                <p className="text-xs font-bold text-slate-300 uppercase mb-3 tracking-wider">Manual Overrides</p>
                                <p className="text-sm text-muted-foreground leading-relaxed print:text-black">
                                    All {stats.manualOverrides} overrides were accompanied by mandatory photo evidence uploaded through the Attendance Dispute view.
                                </p>
                            </div>
                            <div className="bg-secondary/50 border border-border/50 p-6 rounded-xl print:border-black">
                                <p className="text-xs font-bold text-slate-300 uppercase mb-3 tracking-wider">Identity Pinning</p>
                                <p className="text-sm text-muted-foreground leading-relaxed print:text-black">
                                    Each authorization was signed by the Admin Principal's unique JWT credential, ensuring no staff member could self-authorize.
                                </p>
                            </div>
                            <div className="bg-secondary/50 border border-border/50 p-6 rounded-xl print:border-black">
                                <p className="text-xs font-bold text-slate-300 uppercase mb-3 tracking-wider">Payroll Impact</p>
                                <p className="text-sm text-muted-foreground leading-relaxed print:text-black">
                                    Reconciled totals were adjusted for the {stats.disputeRejections} unexcused absences detected by the Smart Attendance engine.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 🖋️ Certification of Integrity */}
                    <div className="pt-12 border-t border-border space-y-12 print:border-black print:pt-20">
                        <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto print:text-black">
                            I, the undersigned, certify that this report is a direct extract from the System Audit & Integrity Log. No records have been modified, deleted, or suppressed.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-3xl mx-auto">
                            <div className="text-center space-y-4">
                                <div className="h-px bg-white/20 w-full print:bg-black" />
                                <div>
                                    <p className="text-sm font-bold text-foreground uppercase tracking-wider print:text-black">{bursarName}</p>
                                    <p className="text-xs text-muted-foreground font-medium uppercase mt-1">Financial Controller, {institutionName}</p>
                                </div>
                            </div>
                            <div className="text-center space-y-4">
                                <div className="h-px bg-white/20 w-full print:bg-black" />
                                <div>
                                    <p className="text-sm font-bold text-foreground uppercase tracking-wider print:text-black">{proprietorName}</p>
                                    <p className="text-xs text-muted-foreground font-medium uppercase mt-1">Group Proprietor</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 🏁 Footer Actions */}
                    <div className="flex justify-center gap-6 pt-6 pb-4 print:hidden">
                        <button
                            onClick={handlePrint}
                            className="bg-secondary/50 hover:bg-white/10 text-foreground font-semibold px-8 py-3 rounded-lg flex items-center gap-2 transition-all border border-border text-sm"
                        >
                            <Printer size={16} /> Print Audit Transcript
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="bg-cyan-600 hover:bg-cyan-500 text-foreground font-semibold px-8 py-3 rounded-lg flex items-center gap-2 transition-all text-sm"
                        >
                            <Download size={16} /> Export as Forensic PDF
                        </button>
                    </div>
                </CardContent>
            </Card>
        </React.Fragment>
    );
};
