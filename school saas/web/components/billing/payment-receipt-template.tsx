import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface ReceiptItem {
    student: string;
    category: string;
    amount: number;
}

interface TransactionData {
    refID: string;
    date: string;
    items: ReceiptItem[];
    total: number;
    signatureHash: string;
}

export const PaymentReceiptTemplate = ({
    transactionData,
    familyName
}: {
    transactionData: TransactionData;
    familyName: string;
}) => {
    return (
        <div className="bg-white p-12 max-w-[800px] mx-auto text-black font-serif shadow-2xl border border-gray-200 relative overflow-hidden">
            {/* 🛡️ Security Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-[-45deg] scale-150 select-none">
                <h1 className="text-9xl font-black whitespace-nowrap">PLATINUM_VERIFIED</h1>
            </div>

            {/* 🏛️ Header Section */}
            <header className="flex justify-between items-start border-b-2 border-black pb-8 mb-8 relative z-10">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase italic">Achievers Minds School</h1>
                    <p className="text-xs font-mono uppercase text-gray-600 tracking-widest mt-1">International Command Center • Lagos Pilot</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold uppercase tracking-widest">Official Receipt</h2>
                    <p className="text-sm font-mono mt-1 text-gray-600">REF: {transactionData.refID}</p>
                </div>
            </header>

            {/* 👤 Payer Details */}
            <section className="grid grid-cols-2 gap-12 mb-12 relative z-10">
                <div>
                    <p className="text-[10px] font-mono text-gray-500 uppercase mb-1">Paid By</p>
                    <p className="font-bold text-lg underline decoration-gray-300 underline-offset-4 uppercase">{familyName}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-mono text-gray-500 uppercase mb-1">Date of Payment</p>
                    <p className="font-bold text-lg">{transactionData.date}</p>
                </div>
            </section>

            {/* 📊 Itemized Ledger */}
            <div className="relative z-10">
                <table className="w-full mb-12">
                    <thead className="bg-gray-50 border-y border-black">
                        <tr className="text-[10px] font-mono text-left uppercase">
                            <th className="py-3 px-4">Student Name</th>
                            <th className="py-3 px-4">Category</th>
                            <th className="py-3 px-4 text-right">Amount (₦)</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {transactionData.items.map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-100 last:border-0">
                                <td className="py-4 px-4 font-bold">{item.student}</td>
                                <td className="py-4 px-4 text-gray-600 italic">{item.category}</td>
                                <td className="py-4 px-4 text-right font-mono font-bold">₦{item.amount.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-black text-white">
                            <td colSpan={2} className="py-4 px-4 font-bold text-right uppercase text-xs tracking-widest">Total Amount Received</td>
                            <td className="py-4 px-4 text-right font-mono font-black text-lg">₦{transactionData.total.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* 🖋️ Authentication Footer */}
            <footer className="flex justify-between items-end mt-20 pt-8 border-t border-gray-100 relative z-10">
                <div className="flex items-center gap-2 text-emerald-700">
                    <ShieldCheck size={16} />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest italic text-black">
                        Digital_Auth: {transactionData.signatureHash}
                    </span>
                </div>
                <div className="text-right">
                    <div className="mb-4 h-12 w-32 border-b border-black ml-auto opacity-40 italic font-serif flex items-end justify-end pb-1 font-handwriting text-2xl" style={{ fontFamily: 'cursive' }}>
                        EduFlow Bursary
                    </div>
                    <p className="text-[9px] font-mono text-gray-400 uppercase">Authorized System Signature</p>
                </div>
            </footer>
        </div>
    );
};
