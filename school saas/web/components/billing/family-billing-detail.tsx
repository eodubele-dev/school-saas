"use client"

import React, { useState } from 'react';
import { CreditCard, Download, ExternalLink, GraduationCap, Bus, Cpu, Wallet, AlertCircle, ChevronRight, Check } from 'lucide-react';
import { logInvoiceView } from '@/lib/actions/parent-portal';
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useReactToPrint } from 'react-to-print';
import { PaymentReceiptTemplate } from "./payment-receipt-template";
import { PaymentSuccessLanding } from "./payment-success-landing";
import { StudentBillingCard } from "./student-billing-card";

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
    const [showSuccess, setShowSuccess] = useState<any>(null); // Stores transaction data for success screen

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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase text-white mb-2">
                        Family Financial Overview
                    </h1>
                    <p className="text-slate-400 font-mono text-sm tracking-wide">
                        Comprehensive Ledger for the 2025/2026 Academic Year
                    </p>
                </div>

                <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-5 shadow-[0_0_30px_rgba(6,182,212,0.1)] flex flex-col items-end min-w-[240px]">
                    <p className="text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Family Balance</p>
                    <p className="text-3xl font-black text-cyan-400 tabular-nums tracking-tight">
                        ₦{familyLedger.totalBalance.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* 🧒 Student Billing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {familyLedger.children.map((child) => (
                    <StudentBillingCard
                        key={child.id}
                        child={child}
                        isProcessing={isProcessing === child.id}
                        printingId={printingId}
                        onPay={handlePayment}
                        onInvoice={triggerInvoice}
                    />
                ))}
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
