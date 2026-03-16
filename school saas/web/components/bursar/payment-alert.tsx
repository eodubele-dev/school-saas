"use client";

import React, { useState } from 'react';
import { Landmark, Check, ChevronRight, Loader2, CheckCircle2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { reconcileTransaction } from '@/lib/actions/finance';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface TransactionItem {
    student: string;
    category: string;
    amount: number;
}

interface TransactionAlert {
    id: string;
    timestamp: string;
    total: number;
    familyName: string;
    items: TransactionItem[];
}

interface BursarPaymentAlertProps {
    transactions: TransactionAlert[];
}

const PaymentCard = ({ tx, index }: { tx: TransactionAlert, index: number }) => {
    const [isReconciling, setIsReconciling] = useState(false);
    const router = useRouter();

    const handleReconcile = async () => {
        setIsReconciling(true);
        try {
            const res = await reconcileTransaction(tx.id);
            if (res.success) {
                toast.success("Payment Reconciled", { description: "The transaction has been cleared from the alert stack." });
                router.refresh();
            } else {
                toast.error("Reconciliation Failed", { description: res.error });
                setIsReconciling(false);
            }
        } catch (error) {
            toast.error("Internal Error", { description: "Failed to reach the server." });
            setIsReconciling(false);
        }
    };

    return (
        <div className="w-[380px] shrink-0 bg-gradient-to-br from-emerald-950/30 via-slate-900/80 to-slate-900/80 border border-emerald-500/20 backdrop-blur-xl rounded-2xl p-5 shadow-2xl animate-in fade-in slide-in-from-right-8" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                        <Check className="text-emerald-400" size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground tracking-tight">Payment Received</h3>
                        <p className="text-xs text-emerald-400/80 font-medium">Auto-Reconciling</p>
                    </div>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px] uppercase tracking-wider">
                    {tx.timestamp}
                </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Total Amount</p>
                    <p className="text-2xl font-black text-foreground">₦{tx.total.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Payer Family</p>
                    <p className="text-sm font-bold text-slate-200 truncate">{tx.familyName}</p>
                </div>
            </div>

            <div className="space-y-2 mb-5">
                {tx.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs border-b border-border/50 pb-2">
                        <span className="text-muted-foreground truncate pr-2">{item.student} <span className="text-muted-foreground text-[10px] capitalize">({item.category})</span></span>
                        <span className="text-slate-200 font-medium">₦{item.amount.toLocaleString()}</span>
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={handleReconcile}
                    disabled={isReconciling}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isReconciling ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle2 size={16} /> Mark Reconciled</>}
                </button>
                <Link href="/dashboard/bursar/finance/collections" className="px-4 bg-secondary/50 hover:bg-emerald-500/10 border border-border hover:border-emerald-500/30 text-slate-300 hover:text-emerald-400 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center group">
                    Ledger <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform ml-1" />
                </Link>
            </div>
        </div>
    );
};

export const BursarPaymentAlert = ({ transactions }: BursarPaymentAlertProps) => {
    const [isVisible, setIsVisible] = React.useState(true);
    const [lastTxId, setLastTxId] = React.useState<string | null>(null);

    // Auto-show if a brand new transaction arrives
    React.useEffect(() => {
        if (transactions.length > 0) {
            const latestId = transactions[0].id;
            if (latestId !== lastTxId) {
                setIsVisible(true);
                setLastTxId(latestId);
            }
        }
    }, [transactions, lastTxId]);

    if (!transactions || transactions.length === 0 || !isVisible) return null;

    return (
        <div className="relative group/alerts overflow-hidden rounded-3xl">
            <button
                onClick={() => setIsVisible(false)}
                className="absolute top-2 right-2 z-10 p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full border border-border/50 transition-all opacity-0 group-hover/alerts:opacity-100 backdrop-blur-md"
                title="Dismiss Alerts"
            >
                <X size={16} />
            </button>
            <div className="w-full overflow-x-auto pb-4 hide-scrollbar">
                <div className="flex gap-4 w-max p-1">
                    {transactions.map((tx, i) => (
                        <PaymentCard key={tx.id || i} tx={tx} index={i} />
                    ))}
                </div>
            </div>
        </div>
    );
};
