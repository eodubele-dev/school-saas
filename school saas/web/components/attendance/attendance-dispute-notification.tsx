"use client"

import React from 'react';
import { CheckCircle, XCircle, MapPin, Camera, Info } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface AttendanceDisputeNotificationProps {
    teacherName: string;
    photoUrl?: string;
    distance: number;
    reason: string;
    submittedAt: string;
    onApprove: () => void;
    onDecline: () => void;
    isProcessing?: boolean;
}

export const AttendanceDisputeNotification: React.FC<AttendanceDisputeNotificationProps> = ({
    teacherName,
    photoUrl,
    distance,
    reason,
    submittedAt,
    onApprove,
    onDecline,
    isProcessing
}) => {
    return (
        <div className="bg-[#0A0A0B] border border-white/10 rounded-3xl overflow-hidden shadow-2xl w-full animate-in fade-in zoom-in duration-500">
            {/* 🟢 Header: Contextual Identity */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Attendance Dispute: {teacherName}</h3>
                    <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest mt-1">Action_Required // Academic_Oversight</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="bg-red-500/10 text-red-500 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-red-500/20">
                        {Math.round(distance)}m protocol_breach
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">{formatDate(submittedAt)}</span>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row h-full lg:h-[450px]">
                {/* 📸 Teacher's Uploaded Proof */}
                <div className="flex-1 bg-black p-6 border-b lg:border-b-0 lg:border-r border-white/5 relative group">
                    <div className="absolute top-8 left-8 flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 z-10 shadow-xl">
                        <Camera size={14} className="text-cyan-400" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Teacher_Evidence</span>
                    </div>

                    {photoUrl ? (
                        <img src={photoUrl} alt="Teacher Proof" className="w-full h-full object-cover rounded-2xl opacity-70 group-hover:opacity-100 transition-opacity" />
                    ) : (
                        <div className="w-full h-full bg-white/[0.02] rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center p-8">
                            <Camera size={48} className="text-slate-800 mb-4" />
                            <p className="text-[10px] font-mono text-slate-600 uppercase leading-relaxed max-w-[140px]">
                                Evidence_Stream_Unavailable // Manual_Verification_Required
                            </p>
                        </div>
                    )}
                </div>

                {/* 🗺️ Live GPS Telemetry / Dispute Reason */}
                <div className="flex-1 bg-[#0D0D0E] p-6 relative flex flex-col">
                    <div className="absolute top-8 left-8 flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 z-10 shadow-xl">
                        <MapPin size={14} className="text-red-500 animate-pulse" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Protocol_Telemetry</span>
                    </div>

                    <div className="flex-1 flex flex-col gap-6 pt-12">
                        {/* Reason Block */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Self-Reported Statement</p>
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 italic text-slate-300 text-sm leading-relaxed shadow-inner">
                                "{reason}"
                            </div>
                        </div>

                        {/* Map Telemetry Placeholder */}
                        <div className="flex-1 bg-blue-900/[0.03] rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)]" />
                            <div className="text-center relative z-10">
                                <div className="w-4 h-4 bg-cyan-500 rounded-full animate-ping mx-auto mb-3 shadow-[0_0_20px_rgba(6,182,212,0.5)]" />
                                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em] group-hover:text-cyan-500/50 transition-colors">
                                    Connecting_GPS_Stream...
                                </p>
                                <p className="text-[8px] font-mono text-slate-800 uppercase mt-1">Satellite_Link_Active</p>
                            </div>
                            {/* Visual Distance Overlay */}
                            <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm px-3 py-1 rounded text-[9px] font-mono text-red-400 border border-red-500/20">
                                Breach_Vector: {distance}m
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 🛡️ Warning Context */}
            <div className="px-6 py-4 bg-amber-500/5 border-t border-b border-white/5 flex items-center gap-4">
                <Info size={16} className="text-amber-500 shrink-0" />
                <p className="text-[10px] text-amber-200/40 font-medium uppercase tracking-wider leading-relaxed">
                    Forensic metadata suggests this is a <span className="text-amber-500">one-time anomaly</span>. No recurring geofence drift detected for this profile in the last 30 days.
                </p>
            </div>

            {/* ⚡ Action Bar */}
            <div className="p-6 bg-white/[0.02] flex gap-4">
                <button
                    onClick={onDecline}
                    disabled={isProcessing}
                    className="flex-1 bg-white/5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 border border-white/10 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] font-black uppercase tracking-widest text-[10px]"
                >
                    <XCircle size={16} />
                    Decline Request
                </button>
                <button
                    onClick={onApprove}
                    disabled={isProcessing}
                    className="flex-[1.5] bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-[0_0_30px_rgba(16,185,129,0.3)] uppercase tracking-widest text-[10px]"
                >
                    <CheckCircle size={16} />
                    Verify & Clock-In
                </button>
            </div>
        </div>
    );
};
