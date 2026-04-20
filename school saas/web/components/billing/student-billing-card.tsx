
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, GraduationCap, Bus, Cpu, Check, CreditCard, FileText } from "lucide-react";
import Link from "next/link";

interface StudentBillingCardProps {
    child: any;
    isProcessing: boolean;
    printingId: string | null;
    onPay: (id: string) => void;
    onInvoice: (id: string, name: string, balance: number, fees: any[]) => void;
    domain: string;
    paymentEnabled?: boolean;
}

export const StudentBillingCard = ({
    child,
    isProcessing,
    printingId,
    onPay,
    onInvoice,
    domain,
    paymentEnabled = true
}: StudentBillingCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isUnpaid = child.balance > 0;

    const borderColor = isUnpaid
        ? 'border-cyan-500/50 hover:border-cyan-400'
        : 'border-blue-600/30 hover:border-blue-500/50';

    const shadowColor = isUnpaid
        ? 'shadow-[0_0_20px_rgba(6,182,212,0.15)]'
        : 'shadow-lg';

    return (
        <div
            className={cn(
                "bg-card text-card-foreground rounded-[2rem] border p-8 transition-all duration-300 relative overflow-hidden group/card shadow-2xl flex flex-col h-full",
                borderColor,
                shadowColor
            )}
        >
            {/* Top Glow Bar */}
            <div className={cn(
                "absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[1px] rounded-full blur-[2px]",
                isUnpaid ? "bg-cyan-500" : "bg-blue-600"
            )} />

            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-foreground tracking-wide italic">{child.name}</h3>
                    <p className="text-muted-foreground text-xs font-mono uppercase mt-1 tracking-wider">{child.grade}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl border-2 overflow-hidden flex items-center justify-center",
                        isUnpaid ? "border-cyan-500/30 bg-cyan-950/30" : "border-blue-600/30 bg-blue-950/30"
                    )}>
                        {child.avatar ? (
                            <img src={child.avatar} alt={child.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-lg font-bold text-muted-foreground">
                                {child.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    {/* Attendance Badge */}
                    <div className="flex items-center gap-1 bg-slate-900/50 border border-white/5 py-1 px-2 rounded-full backdrop-blur-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-bold text-slate-300">{child.attendancePercentage || 0}% Att.</span>
                    </div>
                </div>
            </div>

            {/* Collapsible Fee Items */}
            <div className="mb-6 flex-1">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest">
                        Fee Breakdown ({child.fees.length})
                    </span>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>

                <div className={cn(
                    "space-y-4 overflow-hidden transition-all duration-500 ease-in-out",
                    isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                )}>
                    {child.fees.map((fee: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center group/item border-b border-border/50 pb-3 last:border-0 last:pb-0">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "p-2 rounded-lg",
                                    isUnpaid ? "bg-cyan-500/5 text-cyan-400" : "bg-blue-600/5 text-blue-400"
                                )}>
                                    {fee.icon === 'GraduationCap' && <GraduationCap size={14} />}
                                    {fee.icon === 'Bus' && <Bus size={14} />}
                                    {fee.icon === 'Cpu' && <Cpu size={14} />}
                                </div>
                                <span className="text-slate-300 text-sm font-medium group-hover/item:text-foreground transition-colors">
                                    {fee.label}
                                </span>
                            </div>
                            <span className="font-mono font-bold text-foreground tracking-tight">
                                ₦{fee.amount.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>

                {!isExpanded && (
                    <div className="text-center">
                        <p className="text-slate-600 text-xs italic">
                            {child.fees.length} items hidden. Expand to view details.
                        </p>
                    </div>
                )}
            </div>

            {/* Footer / Total */}
            <div className="mt-auto pt-6 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                    <span className={cn(
                        "block text-2xl font-black italic tracking-tighter",
                        isUnpaid ? "text-cyan-400" : "text-blue-500"
                    )}>
                        ₦{child.balance.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                        {isUnpaid ? 'Total Outstanding' : 'Paid in Full'}
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                    {/* Academic Results Button */}
                    <Link href={`/parent/results/${child.id}`} className="flex-1 sm:flex-none">
                        <button
                            className="w-full px-4 py-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 text-xs font-bold text-cyan-400 hover:bg-cyan-500/10 transition-all uppercase tracking-wider flex items-center justify-center gap-2 group/btn"
                        >
                            <FileText size={14} className="group-hover/btn:scale-110 transition-transform" />
                            Results
                        </button>
                    </Link>

                    {/* View Invoice */}
                    <button
                        onClick={() => onInvoice(child.id, child.name, child.balance, child.fees)}
                        disabled={!!printingId}
                        className="px-4 py-3 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {printingId === child.id ? 'Preparing...' : 'Invoice'}
                    </button>

                    {/* Pay Button */}
                    {isUnpaid && paymentEnabled && (
                        <button
                            onClick={() => onPay(child.id)}
                            disabled={isProcessing}
                            className={cn(
                                "flex-1 sm:flex-none px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2",
                                isProcessing
                                    ? "bg-slate-800 text-muted-foreground cursor-wait"
                                    : "bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/20"
                            )}
                        >
                            {isProcessing ? 'Processing' : 'Pay Now'} <CreditCard size={14} />
                        </button>
                    )}

                    {isUnpaid && !paymentEnabled && (
                        <div className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-slate-900 border border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                            Payments Offline
                        </div>
                    )}

                    {!isUnpaid && (
                        <div className="px-5 py-3 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center gap-2">
                            <Check size={14} className="text-blue-500" />
                            <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Cleared</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
