import React from 'react';
import { CheckCircle, Download, ArrowRight, ShieldCheck } from 'lucide-react';

interface PaymentSuccessLandingProps {
    transactionData: {
        total: number;
        refID: string;
    };
    onReturn: () => void;
    onDownloadReceipt: () => void;
}

export const PaymentSuccessLanding = ({ transactionData, onReturn, onDownloadReceipt }: PaymentSuccessLandingProps) => {
    return (
        <div className="fixed inset-0 z-50 bg-[#0A0A0B] flex items-center justify-center p-6 text-white font-sans animate-in fade-in duration-500 overflow-hidden">
            {/* 🕸️ Background Grid Pattern */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            <div className="max-w-2xl w-full text-center relative z-10">

                {/* 🎇 Success Animation Area */}
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full animate-pulse"></div>
                        <CheckCircle className="text-emerald-400 relative z-10" size={120} strokeWidth={1.5} />
                    </div>
                </div>

                {/* 📝 Confirmation Text */}
                <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4">
                    Payment Confirmed
                </h1>
                <p className="text-gray-400 text-lg mb-10 max-w-md mx-auto">
                    The transaction was successful. Your family ledger has been synchronized across the <span className="text-cyan-400">Lagos Pilot</span> network.
                </p>

                {/* 📊 Transaction Summary Card */}
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 mb-10 backdrop-blur-xl">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Amount_Paid</span>
                        <span className="text-2xl font-bold text-emerald-400">₦{transactionData.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Reference_ID</span>
                        <span className="text-sm font-mono text-gray-300">{transactionData.refID}</span>
                    </div>
                </div>

                {/* 🏁 Primary Actions */}
                <div className="space-y-4">
                    <button
                        onClick={onDownloadReceipt}
                        className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-200 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-[0.98]"
                    >
                        <Download size={20} /> DOWNLOAD OFFICIAL RECEIPT
                    </button>

                    <button
                        onClick={onReturn}
                        className="w-full bg-white/5 border border-white/10 text-gray-400 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all active:scale-[0.98]"
                    >
                        RETURN TO DASHBOARD <ArrowRight size={16} />
                    </button>
                </div>

                {/* 🛡️ Trust Footer */}
                <div className="mt-12 flex items-center justify-center gap-2 text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                    <ShieldCheck size={14} />
                    Verified by EduFlow Platinum Security Gateway
                </div>
            </div>
        </div>
    );
};
