"use client"

import React, { useState } from 'react';
import { QrCode, Clock, AlertTriangle, CheckCircle2, Ticket } from 'lucide-react';
import { cn } from "@/lib/utils";

import { generateGatePass } from "@/lib/actions/platinum";
import { toast } from "sonner"; // Assuming sonner is used, or generic alert

export const GatePassGenerator = ({ studentId }: { studentId?: string }) => {
    const [activeTab, setActiveTab] = useState<'early' | 'late'>('early');
    const [generatedPass, setGeneratedPass] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form states
    const [reason, setReason] = useState('');
    const [time, setTime] = useState('');

    const handleGenerate = async () => {
        if (!studentId) return;
        setIsLoading(true);

        try {
            const result = await generateGatePass(studentId, activeTab === 'early' ? 'early_dismissal' : 'late_pickup', reason, time);
            if (result.success) {
                setGeneratedPass(result.data);
            } else {
                console.error("Failed to generate pass");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#0A0A0B] border border-white/10 rounded-3xl p-8 shadow-2xl animate-in fade-in duration-500">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white uppercase tracking-tight italic">Digital Gate Pass</h2>
                    <p className="text-gray-500 text-sm">Generate temporary authorized exit/entry permits</p>
                </div>
                <div className="bg-white/5 p-2 rounded-xl">
                    <QrCode className="text-white" size={24} />
                </div>
            </div>

            {/* Type Selector */}
            <div className="flex bg-white/5 p-1 rounded-xl mb-8">
                <button
                    onClick={() => setActiveTab('early')}
                    className={cn(
                        "flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                        activeTab === 'early'
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                            : "text-gray-500 hover:text-gray-300"
                    )}
                >
                    Early Dismissal
                </button>
                <button
                    onClick={() => setActiveTab('late')}
                    className={cn(
                        "flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                        activeTab === 'late'
                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                            : "text-gray-500 hover:text-gray-300"
                    )}
                >
                    Late Pick-up
                </button>
            </div>

            {!generatedPass ? (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Reason for Request</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors h-24 resize-none"
                            placeholder="Please state the reason for this exception..."
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Expected Time</label>
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Authorized By</label>
                            <input
                                type="text"
                                value="Parent (Self)"
                                disabled
                                className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm text-gray-500 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="bg-amber-900/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="text-amber-500 shrink-0" size={16} />
                        <p className="text-[10px] text-amber-200/70 leading-relaxed">
                            Generating this pass will trigger an immediate alert to the Campus Security Team and the Class Teacher.
                            Please ensure you are physically present or have deployed an Authorized Person.
                        </p>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !reason || !time}
                        className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black py-4 rounded-xl uppercase tracking-widest shadow-lg shadow-amber-900/20 items-center justify-center flex gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <span className="animate-pulse">Generating...</span> : <><Ticket size={18} /> Generate Gate Pass</>}
                    </button>
                </div>
            ) : (
                <div className="text-center animate-in zoom-in duration-300">
                    <div className="bg-white p-6 rounded-2xl mb-6 inline-block mx-auto relative overflow-hidden">
                        <div className="absolute inset-0 border-[3px] border-black/10 rounded-2xl m-1"></div>
                        <div className="w-48 h-48 bg-black flex items-center justify-center rounded-lg">
                            {/* Mock QR */}
                            <QrCode className="text-white w-32 h-32" />
                        </div>
                        <p className="font-mono text-black font-bold mt-4 text-lg">{generatedPass.pass_code}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Valid until: {new Date(generatedPass.valid_until).toLocaleTimeString()}</p>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-emerald-400 mb-6">
                        <CheckCircle2 size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">Security Notified Successfully</span>
                    </div>

                    <button
                        onClick={() => setGeneratedPass(null)}
                        className="text-gray-500 hover:text-white text-xs underline decoration-gray-700 underline-offset-4"
                    >
                        Dismiss & Return
                    </button>
                </div>
            )}
        </div>
    );
};
