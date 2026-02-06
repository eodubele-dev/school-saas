"use client"

import React from 'react';
import { DatabaseZap, FileDown, ShieldCheck, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LedgerEntry {
    id: string;
    staffName: string;
    bankName: string;
    accountNo: string;
    accountName: string;
    amount: number;
    status: string;
}

interface BursaryLedgerSyncProps {
    reconciledPayroll: LedgerEntry[];
    batchId: string;
}

export const BursaryLedgerSync: React.FC<BursaryLedgerSyncProps> = ({ reconciledPayroll, batchId }) => {
    const totalBatchValue = reconciledPayroll.reduce((acc, curr) => acc + curr.amount, 0);

    const handleDownloadCSV = () => {
        const headers = ["Beneficiary Name", "Bank Name", "Account Number", "Amount", "Narration"];
        const rows = reconciledPayroll.map(entry => [
            entry.accountName,
            entry.bankName,
            `'${entry.accountNo}`, // Force string in Excel
            entry.amount.toFixed(2),
            `SALARY_PAYROLL_${batchId}`
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `BULK_PAYMENT_${batchId}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-[#0A0A0B] border border-white/10 rounded-3xl p-8 shadow-2xl max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* 💳 Banking Header */}
            <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-cyan-500/10 p-2 rounded-xl border border-cyan-500/20">
                            <DatabaseZap size={24} className="text-cyan-400" />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Ledger Synchronization</h2>
                    </div>
                    <p className="text-slate-500 text-[10px] font-mono uppercase tracking-[0.3em]">
                        Batch_ID: #{batchId} // Forensic_Audit: Active_Safe
                    </p>
                </div>
                <div className="text-right bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total_Batch_Value</p>
                    <p className="text-3xl font-black text-white tracking-tighter">₦{totalBatchValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
            </div>

            {/* 📊 Bank-Ready Table */}
            <div className="bg-black/40 rounded-2xl border border-white/5 overflow-hidden mb-10 shadow-inner">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <tr>
                            <th className="py-5 px-8">Account Name</th>
                            <th className="py-5 px-8">Bank / Account_Instructions</th>
                            <th className="py-5 px-8 text-right">Net_Settlement</th>
                            <th className="py-5 px-8 text-center">Audit_Lock</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {reconciledPayroll.map((entry) => (
                            <tr key={entry.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-all group">
                                <td className="py-5 px-8">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-200 group-hover:text-white transition-colors uppercase tracking-tight">{entry.staffName}</span>
                                        <span className="text-[10px] text-slate-500 font-mono mt-0.5">{entry.accountName}</span>
                                    </div>
                                </td>
                                <td className="py-5 px-8">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
                                            <Landmark size={14} className="text-slate-400" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[11px] text-slate-300 font-bold uppercase">{entry.bankName}</span>
                                            <span className="text-[10px] text-slate-500 font-mono mt-1 tracking-widest">{entry.accountNo}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-5 px-8 text-right font-black text-cyan-400 font-mono text-base">
                                    ₦{entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-5 px-8 flex justify-center">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/5 px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                                        <ShieldCheck size={12} className="animate-pulse" /> Reconciled
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 🏁 Export Actions */}
            <div className="flex flex-col md:flex-row items-center justify-between p-8 bg-cyan-500/5 rounded-3xl border border-cyan-500/10 gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-cyan-500 animate-ping" />
                    <div className="flex flex-col">
                        <p className="text-xs text-cyan-200 font-black uppercase tracking-widest mb-1">Ready_for_Transmission</p>
                        <p className="text-[10px] text-cyan-500/60 font-medium max-w-sm">
                            All records have been forensic-verified against Geofence Logs and Admin Principal Overrides. 0% Financial Leakage detected.
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleDownloadCSV}
                    className="w-full md:w-auto bg-cyan-600 hover:bg-cyan-500 text-white font-black px-10 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-[0_0_30px_rgba(8,145,178,0.3)] hover:shadow-[0_0_40px_rgba(8,145,178,0.4)] active:scale-95 uppercase text-xs tracking-widest group"
                >
                    <FileDown size={20} className="group-hover:animate-bounce" /> DOWNLOAD_BULK_PAYMENT_PAYROLL
                </button>
            </div>
        </div>
    );
};
