"use client"

import React, { useState } from 'react';
import { CreditCard, Download, ExternalLink, GraduationCap, Bus, Cpu, Wallet, AlertCircle, ChevronRight, Check, Users } from 'lucide-react';
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

/**
 * 💳 Family Billing Detail View
 * 
 * Refined Platinum UI based on "Blue Horizon" aesthetic.
 */
export function FamilyBillingDetail({
    familyLedger
}: {
    familyLedger: {
        totalBalance: number,
        children: any[]
    }
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

    const handlePayment = (studentId: string) => {
        setIsProcessing(studentId);
        setTimeout(() => {
            setIsProcessing(null);

            // Find student details for the success screen
            const student = familyLedger.children.find(c => c.id === studentId);
            const amount = student?.balance || 0;

            setShowSuccess({
                total: amount,
                refID: `PAY-${Math.floor(Math.random() * 1000000)}`,
                studentName: student?.name || 'Student',
                items: student?.fees || [],
                balance: amount
            });

            toast.success("Payment Successful!");
        }, 1500);
    }

    const handlePayAll = () => {
        setIsProcessing('all');
        setTimeout(() => {
            setIsProcessing(null);

            // Aggregated details for success screen
            const allUnpaid = familyLedger.children.filter(c => c.balance > 0);

            const receiptItems = allUnpaid.flatMap(child =>
                child.fees.map((fee: any) => ({
                    label: fee.label,
                    amount: fee.amount,
                    studentName: child.name // Hack to pass name for the triggerInvoice adapter
                }))
            );

            setShowSuccess({
                total: familyLedger.totalBalance,
                refID: `PAY-ALL-${Math.floor(Math.random() * 1000000)}`,
                studentName: "Family Consolidated", // For the invoice Trigger
                items: receiptItems,
                balance: familyLedger.totalBalance
            });

            toast.success("All Payments Successful!");
        }, 2000);
    }

    return (
        <div
            className="min-h-screen bg-slate-950 text-white animate-in fade-in duration-500 pb-32"
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
                    <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-white mb-2 leading-none">
                        Financial <span className="text-cyan-500">Hub</span>
                    </h1>
                    <p className="text-slate-400 font-mono text-xs tracking-widest uppercase opacity-70">
                        Academic Year 2025/2026 • Ledger ID: {familyLedger.children[0]?.id.slice(0, 8).toUpperCase() || 'NA'}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 flex flex-col items-end">
                        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-1">Total Family Balance</p>
                        <p className="text-2xl font-black text-white tabular-nums">
                            ₦{familyLedger.totalBalance.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-white/5 pb-4">
                    <h2 className="text-xl font-bold italic tracking-tight uppercase">Family Overview</h2>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Filter Items:</span>
                        <Select value={statusFilter} onValueChange={(val: any) => setStatusFilter(val)}>
                            <SelectTrigger className="w-32 bg-slate-900 border-white/5 text-xs text-slate-300">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-slate-300">
                                <SelectItem value="all">All Items</SelectItem>
                                <SelectItem value="unpaid">Outstanding</SelectItem>
                                <SelectItem value="paid">Settled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Dashboard Summary Widgets */}
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {/* Summary Card 1: Balance Breakdown */}
                        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-rose-500/10 rounded-xl text-rose-400">
                                    <AlertCircle size={20} />
                                </div>
                                <h3 className="font-bold text-sm text-white uppercase tracking-wider">Pending Dues</h3>
                            </div>
                            <p className="text-3xl font-black text-white mb-2">₦{familyLedger.totalBalance.toLocaleString()}</p>
                            <Progress value={familyLedger.totalBalance > 0 ? 30 : 100} className="h-1.5 bg-slate-800" indicatorClassName="bg-rose-500" />
                            <p className="text-[10px] text-slate-500 mt-2">Requires attention to prevent arrears.</p>
                        </div>

                        {/* Summary Card 2: Students Covered */}
                        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
                                    <Users size={20} />
                                </div>
                                <h3 className="font-bold text-sm text-white uppercase tracking-wider">Education Access</h3>
                            </div>
                            <p className="text-3xl font-black text-white mb-2">{familyLedger.children.length} Students</p>
                            <div className="flex gap-1">
                                {familyLedger.children.map((_, i) => (
                                    <div key={i} className="h-1.5 w-full rounded-full bg-cyan-500" />
                                ))}
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2">All children currently in active session.</p>
                        </div>

                        {/* Summary Card 3: Payment Health */}
                        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                                    <Check size={20} />
                                </div>
                                <h3 className="font-bold text-sm text-white uppercase tracking-wider">Status</h3>
                            </div>
                            <p className="text-3xl font-black text-emerald-400">Healthy</p>
                            <Progress value={75} className="h-1.5 bg-slate-800" indicatorClassName="bg-emerald-500" />
                            <p className="text-[10px] text-slate-500 mt-2">Majority of services are active.</p>
                        </div>
                    </div>

                    {/* Unified Multi-Child View */}
                    <div className="space-y-12">
                        {familyLedger.children.map((child) => {
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
                                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-2 border-l-2 border-cyan-500">Student Ledger</h3>
                                        </div>
                                        <StudentBillingCard
                                            child={{ ...child, fees: filteredFees }}
                                            isProcessing={isProcessing === child.id}
                                            printingId={printingId}
                                            onPay={handlePayment}
                                            onInvoice={triggerInvoice}
                                        />
                                    </div>

                                    {/* Individual Ledger History (Right Column) */}
                                    <div className="w-full">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recent Activity</h3>
                                        </div>
                                        <div className="bg-slate-900/30 border border-white/5 rounded-[2rem] p-6 h-full min-h-[300px]">
                                            <div className="space-y-4">
                                                {[1, 2].map(i => (
                                                    <div key={i} className="flex justify-between items-center p-3 bg-slate-950/50 rounded-xl border border-white/5 group hover:border-emerald-500/30 transition-all">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-lg bg-slate-900 text-slate-500">
                                                                <CreditCard size={14} />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-white truncate max-w-[120px]">Tuition Payment</p>
                                                                <p className="text-[9px] text-slate-500 font-mono tracking-tighter">OCT 12 • REF-8273{i}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs font-black text-emerald-400">+ ₦50K</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="pt-4 mt-4 border-t border-white/5 text-center">
                                                    <button className="text-[10px] text-slate-500 uppercase tracking-widest font-bold hover:text-cyan-400 transition-colors">
                                                        View Full History →
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>



            {/* 🦶 Consolidated Footer Dock */}
            {familyLedger.totalBalance > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl bg-[#0f1014]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 z-50 animate-in slide-in-from-bottom-10">
                    <div className="text-center sm:text-left">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-0.5">Consolidated Family Summary</p>
                        <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                            <span className="text-slate-400 text-sm">Total Outstanding:</span>
                            <span className="text-xl font-black text-white">₦{familyLedger.totalBalance.toLocaleString()}</span>
                        </div>
                    </div>

                    <button
                        onClick={handlePayAll}
                        disabled={!!isProcessing}
                        className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl text-white font-black text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center gap-2"
                    >
                        {isProcessing === 'all' ? 'Processing Securely...' : 'Pay All Outstanding'}
                        {!isProcessing && <CreditCard size={16} />}
                    </button>
                </div>
            )}
        </div>
    );
};
