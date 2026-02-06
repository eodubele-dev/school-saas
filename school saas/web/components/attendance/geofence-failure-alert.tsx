import React from 'react';
import { MapPin, AlertTriangle, RefreshCcw } from 'lucide-react';

interface GeofenceFailureAlertProps {
    distance: number;
    onRetry: () => void;
    onDispute: () => void;
}

export const GeofenceFailureAlert: React.FC<GeofenceFailureAlertProps> = ({ distance, onRetry, onDispute }) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
            <div className="bg-[#0A0A0B] border border-red-500/30 rounded-[2.5rem] p-8 max-w-md w-full shadow-[0_0_80px_rgba(239,68,68,0.15)] relative overflow-hidden group">
                {/* Ambient Glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-[60px] pointer-events-none" />

                <div className="relative flex flex-col items-center text-center">
                    {/* 🚨 Warning Icon */}
                    <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-8 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                        <MapPin size={48} className="text-red-500 animate-bounce" />
                    </div>

                    <div className="space-y-3 mb-8">
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                            Verification <span className="text-red-500">Failed</span>
                        </h2>
                        <p className="text-slate-400 text-sm leading-relaxed font-medium">
                            You are currently <span className="text-red-400 font-bold underline decoration-red-500/30 underline-offset-4">{distance}m</span> away from the school gate.
                            Smart Attendance requires you to be within a <span className="text-white font-bold">100m radius</span>.
                        </p>
                    </div>

                    {/* 🛰️ Metadata / Forensic Flag */}
                    <div className="w-full bg-red-500/5 rounded-2xl p-5 mb-10 flex items-start gap-4 border border-red-500/10 text-left">
                        <AlertTriangle size={20} className="text-red-500 mt-1 flex-shrink-0" />
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block">
                                Institutional Security Warning
                            </span>
                            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-normal">
                                Unauthorized_Distance_Detected // Forensic_Flag: Active // GPS_Pin: Logged_to_Audit
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col w-full gap-3">
                        <button
                            onClick={onRetry}
                            className="w-full bg-white text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-100 transition-all active:scale-[0.98] shadow-2xl uppercase tracking-widest text-xs"
                        >
                            <RefreshCcw size={18} className="animate-spin-slow" />
                            RE-SCAN LOCATION
                        </button>

                        <button
                            onClick={onDispute}
                            className="w-full bg-white/5 border border-white/10 text-slate-400 font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all active:scale-[0.98] uppercase tracking-widest text-[9px]"
                        >
                            Initiate Professional Dispute
                        </button>
                    </div>

                    <p className="mt-6 text-[9px] text-slate-600 font-mono uppercase tracking-[0.2em]">
                        Institutional Integrity Protocol v2.5
                    </p>
                </div>
            </div>
        </div>
    );
};
