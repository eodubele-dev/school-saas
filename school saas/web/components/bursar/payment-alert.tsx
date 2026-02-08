import React from 'react';
import { Landmark, ArrowUpRight, User, Hash, ExternalLink } from 'lucide-react';

interface TransactionItem {
    student: string;
    category: string;
    amount: number;
}

interface BursarPaymentAlertProps {
    transaction: {
        timestamp: string;
        total: number;
        familyName: string;
        items: TransactionItem[];
    }
}

export const BursarPaymentAlert = ({ transaction }: BursarPaymentAlertProps) => {
    return (
        <div className="bg-[#0A0A0B] border-l-4 border-emerald-500 rounded-r-3xl p-6 shadow-2xl animate-in fade-in slide-in-from-right-8">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                        <Landmark className="text-emerald-400" size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-tighter italic">Payment_Inbound_Alert</h3>
                        <p className="text-[10px] text-gray-500 font-mono">Status: AWAITING_BANK_SETTLEMENT</p>
                    </div>
                </div>
                <span className="text-[10px] bg-white/5 px-2 py-1 rounded-full text-gray-400 font-mono italic">
                    {transaction.timestamp}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <p className="text-[9px] text-gray-600 uppercase mb-1">Total_Amount</p>
                    <p className="text-lg font-bold text-emerald-400">₦{transaction.total.toLocaleString()}</p>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <p className="text-[9px] text-gray-600 uppercase mb-1">Family_Payer</p>
                    <p className="text-sm font-bold text-white truncate">{transaction.familyName}</p>
                </div>
            </div>

            {/* 🧩 Forensic Breakdown */}
            <div className="space-y-2 mb-6">
                {transaction.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[10px] font-mono border-b border-white/5 pb-2">
                        <span className="text-gray-500">{item.student} ({item.category})</span>
                        <span className="text-white">₦{item.amount.toLocaleString()}</span>
                    </div>
                ))}
            </div>

            <div className="flex gap-3">
                <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-black text-[10px] font-black py-2 rounded-lg uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                    RECONCILE <ArrowUpRight size={12} />
                </button>
                <button className="px-3 border border-white/10 rounded-lg hover:bg-white/5 transition-all">
                    <ExternalLink size={14} className="text-gray-500" />
                </button>
            </div>
        </div>
    );
};
