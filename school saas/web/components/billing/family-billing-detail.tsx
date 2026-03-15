"use client"

import React, { useState } from 'react';
import { CreditCard, Download, ExternalLink, GraduationCap, Bus, Cpu, Wallet, AlertCircle, ChevronRight, Check, Users, Search } from 'lucide-react';
import { logInvoiceView } from '@/lib/actions/parent-portal';
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useReactToPrint } from 'react-to-print';
import { PaymentReceiptTemplate } from "./payment-receipt-template";
import { PaymentSuccessLanding } from "./payment-success-landing";
import { StudentBillingCard } from "./student-billing-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { initiatePayment } from "@/lib/actions/paystack";
import { format } from "date-fns";

/**
 * 💳 Family Billing Detail View
 * 
 * Refined Platinum UI based on "Blue Horizon" aesthetic.
 */
export function FamilyBillingDetail({
    familyLedger,
    domain
}: {
    familyLedger: {
        totalBalance: number,
        sessionName?: string,
        paymentHealth?: number,
        recentTransactions?: any[],
        children: any[],
        parentEmail?: string
    },
    domain: string
}) {
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [printingId, setPrintingId] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState<any>(null);
    const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

    // Print Logic
    const componentRef = React.useRef(null);
    const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        onAfterPrint: () => setPrintingId(null),
        documentTitle: `Tuition_Receipt_${new Date().toISOString().split('T')[0]}`
    });

    const triggerInvoice = async (studentId: string | null, studentName: string, balance: number, fees: any[]) => {
        if (studentId) setPrintingId(studentId);

        // ADAPTER LOGIC:
        // If fees have 'studentName' property (from PayAll), we use it. Otherwise we use the passed studentName.
        const items = fees.map((f: any) => ({
            student: f.studentName || studentName,
            category: f.label,
            amount: f.amount
        }));

        const receiptData = {
            refID: `REF-${Math.floor(Math.random() * 1000000)}`,
            date: new Date().toLocaleDateString(),
            items: items,
            total: balance > 0 ? balance : items.reduce((acc: number, curr: any) => acc + curr.amount, 0),
            signatureHash: `SHA-${Math.random().toString(36).substring(7).toUpperCase()}`
        };

        setSelectedReceipt({ data: receiptData, familyName: studentName.split(' ').pop() || 'Parent' });

        if (studentId) await logInvoiceView(studentId);

        setTimeout(() => {
            handlePrint();
        }, 100);
    }

    const handlePayment = async (studentId: string) => {
        setIsProcessing(studentId);
        
        const student = familyLedger.children.find(c => c.id === studentId);
        if (!student) {
            toast.error("Student error");
            setIsProcessing(null);
            return;
        }

        try {
            // Find the pending invoice for this term (assuming the logic in parent-portal picks the current one)
            // For now, we'll try to initiate payment directly.
            // Note: In a real scenario, we'd need the actual invoiceId from the database.
            // The ledger data should ideally carry the invoiceId.
            // Assuming the invoice exists since balance > 0.
            
            const result = await initiatePayment({
                amount: student.balance,
                email: familyLedger.parentEmail || 'parent@school.com', 
                studentId: studentId,
                invoiceId: student.invoiceId
            });

            if (result.success && result.url) {
                toast.info("Redirecting to secure payment...");
                window.location.href = result.url;
            } else {
                toast.error(result.error || "Failed to initialize payment");
                setIsProcessing(null);
            }
        } catch (error) {
            console.error("Payment Error:", error);
            toast.error("An error occurred during payment initialization");
            setIsProcessing(null);
        }
    }

    const handlePayAll = async () => {
        setIsProcessing('all');
        try {
            const firstChildId = familyLedger.children[0]?.id;
            const result = await initiatePayment({
                amount: familyLedger.totalBalance,
                email: familyLedger.parentEmail || 'parent@school.com',
                studentId: firstChildId,
                reference: `PAY-ALL-${Date.now()}`
            });

            if (result.success && result.url) {
                toast.info("Redirecting to secure payment for all dues...");
                window.location.href = result.url;
            } else {
                toast.error(result.error || "Failed to initialize payment");
                setIsProcessing(null);
            }
        } catch (error) {
            console.error("Payment Error:", error);
            toast.error("An error occurred during payment initialization");
            setIsProcessing(null);
        }
    }

    return (
        <div
            className="min-h-screen bg-slate-950 text-foreground animate-in fade-in duration-500 pb-32"
        >
            {/* 🕸️ Background Grid Pattern (Fixed Layer) */}
            <div
                className="fixed inset-0 z-[-1] pointer-events-none"
                style={{
                    backgroundColor: '#020617', // bg-slate-950
                    backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)' // Optional: fades out at edges like the screenshot vignette
                }}
            />
            {/* Hidden Receipt Component for Printing */}
            <div style={{ display: "none" }}>
                <div ref={componentRef}>
                    {selectedReceipt && (
                        <PaymentReceiptTemplate
                            transactionData={selectedReceipt.data}
                            familyName={selectedReceipt.familyName}
                        />
                    )}
                </div>
            </div>

            {/* Success Landing Overlay */}
            {showSuccess && (
                <PaymentSuccessLanding
                    transactionData={showSuccess}
                    onReturn={() => setShowSuccess(null)}
                    onDownloadReceipt={() => triggerInvoice(null, showSuccess.studentName, showSuccess.balance, showSuccess.items)}
                />
            )}

            {/* 🏁 Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-2 leading-none">
                        Financial Hub
                    </h1>
                    <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase opacity-70">
                        {familyLedger.sessionName || "Academic Year"} • Ledger ID: {familyLedger.children[0]?.id.slice(0, 8).toUpperCase() || 'NA'}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {familyLedger.totalBalance > 0 && (
                        <button
                            onClick={handlePayAll}
                            disabled={!!isProcessing}
                            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl text-foreground font-black text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center gap-2"
                        >
                            {isProcessing === 'all' ? 'Processing...' : 'Settle All Dues'}
                            {!isProcessing && <CreditCard size={14} />}
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-12 mt-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-border/50 pb-4">
                    <h2 className="text-sm font-bold opacity-40 tracking-widest uppercase">Family Ledgers</h2>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Filter Items:</span>
                        <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
                            <SelectTrigger className="w-32 bg-card text-card-foreground border-border/50 text-xs text-slate-300">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-card text-card-foreground border-border text-slate-300">
                                <SelectItem value="all">All Items</SelectItem>
                                <SelectItem value="unpaid">Outstanding</SelectItem>
                                <SelectItem value="paid">Settled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Dashboard Summary Widgets */}
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    {/* Filter Summary Header */}
                    {statusFilter !== 'all' && (
                        <div className="mb-6 flex items-center gap-2 px-6 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full w-fit animate-in zoom-in duration-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                            <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em]">
                                Showing {statusFilter} accounts only
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {/* Summary Card 1: Balance Breakdown */}
                        <div className="bg-card text-card-foreground/50 border border-border/50 border-t-4 border-t-rose-500/80 rounded-3xl p-6 backdrop-blur-sm shadow-xl shadow-rose-500/5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-rose-500/10 rounded-xl text-rose-400">
                                    <AlertCircle size={20} />
                                </div>
                                <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Pending Dues</h3>
                            </div>
                            <p className="text-3xl font-black text-foreground mb-2">₦{familyLedger.totalBalance.toLocaleString()}</p>
                            <Progress value={100 - (familyLedger.paymentHealth || 0)} className="h-1.5 bg-slate-800" indicatorClassName="bg-rose-500" />
                            <p className="text-[10px] text-muted-foreground mt-2">Family Debt</p>
                        </div>

                        {/* Summary Card 2: Students Covered */}
                        <div className="bg-card text-card-foreground/50 border border-border/50 border-t-4 border-t-cyan-500/80 rounded-3xl p-6 backdrop-blur-sm shadow-xl shadow-cyan-500/5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
                                    <Users size={20} />
                                </div>
                                <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Education Access</h3>
                            </div>
                            <p className="text-3xl font-black text-foreground mb-2">{familyLedger.children.length} Students</p>
                            <div className="flex gap-1">
                                {familyLedger.children.map((_, i) => (
                                    <div key={i} className="h-1.5 w-full rounded-full bg-cyan-500" />
                                ))}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-2">All children currently in active session.</p>
                        </div>

                        {/* Summary Card 3: Payment Health */}
                        <div className="bg-card text-card-foreground/50 border border-border/50 border-t-4 border-t-emerald-500/80 rounded-3xl p-6 backdrop-blur-sm shadow-xl shadow-emerald-500/5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                                    <Check size={20} />
                                </div>
                                <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Status</h3>
                            </div>
                            <p className="text-3xl font-black text-emerald-400">{familyLedger.paymentHealth === 100 ? 'Verified' : 'Healthy'}</p>
                            <Progress value={familyLedger.paymentHealth || 0} className="h-1.5 bg-slate-800" indicatorClassName="bg-emerald-500" />
                            <p className="text-[10px] text-muted-foreground mt-2">Family financial health status.</p>
                        </div>
                    </div>

                    {/* Unified Multi-Child View */}
                    <div className="space-y-12">
                        {(() => {
                            const filteredChildren = familyLedger.children.filter(child => {
                                if (statusFilter === 'all') return true;
                                if (statusFilter === 'unpaid') return child.balance > 0;
                                if (statusFilter === 'paid') return child.balance === 0;
                                return true;
                            });

                            if (filteredChildren.length === 0) {
                                return (
                                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-slate-900/20 rounded-[3rem] border border-dashed border-border/50 animate-in fade-in duration-700">
                                        <div className="p-6 bg-slate-900 rounded-full border border-border shadow-2xl">
                                            <Search className="text-muted-foreground opacity-20" size={48} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black uppercase tracking-widest text-foreground/50">No Matches Found</h3>
                                            <p className="text-xs text-muted-foreground font-mono">No students fit the "{statusFilter}" criteria.</p>
                                        </div>
                                        <button 
                                            onClick={() => setStatusFilter('all')}
                                            className="text-[10px] font-black uppercase tracking-widest text-cyan-500 hover:text-cyan-400 transition-colors"
                                        >
                                            Clear Filters →
                                        </button>
                                    </div>
                                );
                            }

                            return filteredChildren.map((child) => {
                                // Apply status filter to the child's individual fee line-items
                                const filteredFees = child.fees.filter((f: any) => {
                                    if (statusFilter === 'all') return true;
                                    if (statusFilter === 'unpaid') return f.amount > 0;
                                    return f.amount === 0;
                                });

                                return (
                                    <div key={child.id} className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                                        {/* Billing Card (Left Column) */}
                                        <div className="w-full">
                                            <div className="mb-4 flex items-center justify-between">
                                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-2 border-l-2 border-cyan-500">Student Ledger</h3>
                                            </div>
                                            <StudentBillingCard
                                                child={{ ...child, fees: filteredFees }}
                                                isProcessing={isProcessing === child.id}
                                                printingId={printingId}
                                                onPay={handlePayment}
                                                onInvoice={triggerInvoice}
                                                domain={domain}
                                            />
                                        </div>

                                        {/* Individual Ledger History (Right Column) */}
                                        <div className="w-full">
                                            <div className="mb-4 flex items-center justify-between">
                                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Recent Activity</h3>
                                            </div>
                                            <div className="bg-card text-card-foreground/30 border border-border/50 rounded-[2rem] p-6 h-full min-h-[300px]">
                                                <div className="space-y-4">
                                                    {familyLedger.recentTransactions && familyLedger.recentTransactions.filter(t => t.student_id === child.id).length > 0 ? (
                                                        familyLedger.recentTransactions.filter(t => t.student_id === child.id).map((trx, i) => (
                                                            <div key={trx.id || i} className="flex justify-between items-center p-3 bg-slate-950/50 rounded-xl border border-border/50 group hover:border-emerald-500/30 transition-all">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 rounded-lg bg-card text-card-foreground text-muted-foreground">
                                                                        {trx.method === 'paystack' ? <CreditCard size={14} /> : 
                                                                         trx.method === 'bank_transfer' ? <ExternalLink size={14} /> : 
                                                                         <Wallet size={14} />}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-bold text-foreground truncate max-w-[120px]">
                                                                            {trx.method?.toUpperCase()} Payment
                                                                        </p>
                                                                        <p className="text-[9px] text-muted-foreground font-mono tracking-tighter">
                                                                            {trx.date ? format(new Date(trx.date), 'MMM dd') : 'N/A'} • {trx.reference?.slice(0, 10) || 'REF-N/A'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className={cn(
                                                                        "text-xs font-black",
                                                                        trx.status === 'success' ? "text-emerald-400" : "text-amber-400"
                                                                    )}>
                                                                        {trx.status === 'success' ? '+' : ''} ₦{(Number(trx.amount) || 0).toLocaleString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                                                            <Wallet size={32} className="mb-2" />
                                                            <p className="text-[10px] font-bold uppercase tracking-widest">No recent records</p>
                                                        </div>
                                                    )}
                                                    <div className="pt-4 mt-4 border-t border-border/50 text-center">
                                                        <button className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold hover:text-cyan-400 transition-colors">
                                                            View Full History →
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>
            </div>



        </div>
    );
};
