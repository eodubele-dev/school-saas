"use client"

import React from 'react';
import { ShieldAlert, FileCheck, MapPin, UserCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BursarOverrideDetailProps {
    staffMember: {
        name: string;
        role: string;
    };
    evidence: {
        photoUrl: string;
        distance: number;
        date: string;
        principalNote: string;
        authorizerName?: string;
    };
    onClose: () => void;
    onConfirm: () => void;
}

export const BursarOverrideDetail: React.FC<BursarOverrideDetailProps> = ({
    staffMember,
    evidence,
    onClose,
    onConfirm
}) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#0A0A0B] border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
                {/* 🔴 Audit Header */}
                <div className="p-6 bg-red-500/5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-500/10 p-2 rounded-xl border border-red-500/20">
                            <ShieldAlert className="text-red-500" size={24} />
                        </div>
                        <div>
                            <h3 className="text-white font-black text-lg tracking-tight uppercase">Manual Override Audit</h3>
                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">
                                EMP_ID: {staffMember.name.split(' ').join('_').toUpperCase()} // {staffMember.role}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-mono text-red-500 font-black uppercase tracking-tighter">Status: Flagged_Manual</p>
                            <p className="text-xs text-white font-bold opacity-80 mt-0.5">Date: {evidence.date}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* 📸 Evidence Panel */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                            <FileCheck size={14} className="text-cyan-400" /> Submitted_Evidence_Proof
                        </label>
                        <div className="aspect-video bg-black rounded-2xl border border-white/10 overflow-hidden relative group shadow-inner">
                            <img
                                src={evidence.photoUrl || "/api/placeholder/800/450"}
                                alt="Staff Proof"
                                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end p-6">
                                <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <p className="text-[11px] text-slate-200 font-semibold italic">"Selfie confirmed at Campus Main Entrance Gateway"</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 🗺️ Telemetry */}
                        <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <MapPin size={48} className="text-red-500" />
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">GPS_Deviation_Metrix</p>
                            <div className="flex items-baseline gap-2">
                                <span className="font-black text-3xl text-red-500 tracking-tighter">{evidence.distance}</span>
                                <span className="text-sm font-mono text-red-500/60 uppercase">Meters</span>
                            </div>
                            <div className="mt-3 w-full bg-red-500/10 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-red-500 h-full w-[65%] animate-pulse" />
                            </div>
                        </div>

                        {/* 👤 Authorizer */}
                        <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <UserCheck size={48} className="text-cyan-400" />
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Institutional_Authorizer</p>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                    <span className="text-cyan-400 font-black text-xs">AP</span>
                                </div>
                                <div>
                                    <p className="text-white font-black text-base italic tracking-tight">{evidence.authorizerName || "Admin_Principal"}</p>
                                    <p className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Encrypted_Signature_Verified</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 📝 Administrative Note */}
                    <div className="bg-white/[0.01] p-6 rounded-2xl border border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Administrative_Audit_Rationale</p>
                            <div className="flex gap-1">
                                {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500/20" />)}
                            </div>
                        </div>
                        <p className="text-sm text-slate-300 italic leading-relaxed font-medium bg-black/20 p-4 rounded-xl border border-white/5">
                            "{evidence.principalNote || "Verified presence; GPS sensor drift reported in Building C during rainstorm. Approval granted following visual verification."}"
                        </p>
                    </div>
                </div>

                {/* 🏁 Final Action */}
                <div className="p-8 bg-white/[0.02] border-t border-white/5 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-bold py-4 rounded-2xl border border-white/10 transition-all uppercase text-[11px] tracking-widest"
                    >
                        Cancel_Review
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-[2] bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-2xl transition-all shadow-[0_0_30px_rgba(8,145,178,0.3)] hover:shadow-[0_0_40px_rgba(8,145,178,0.4)] active:scale-95 uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 group"
                    >
                        <UserCheck size={18} className="group-hover:animate-bounce" />
                        CONFIRM_FOR_PAYROLL_DISBURSEMENT
                    </button>
                </div>
            </div>
        </div>
    );
};
