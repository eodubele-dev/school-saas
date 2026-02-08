"use client"

import React, { useState } from 'react';
import { AlertTriangle, Plus, ShieldAlert, Check, RefreshCw } from 'lucide-react';

export const AllergyAlertManager = ({ alerts = [] }: { alerts?: any[] }) => {
    // Map DB fields if necessary, or use directly
    const activeAlerts = alerts;
    return (
        <div className="bg-[#0A0A0B] border border-white/10 rounded-3xl p-6 shadow-2xl animate-in fade-in duration-500 delay-100">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                        <AlertTriangle className="text-amber-500" size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white uppercase tracking-tight">Critical Alerts</h2>
                        <p className="text-slate-500 text-xs">Allergies & Conditions</p>
                    </div>
                </div>
                <button className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-lg transition-colors">
                    <Plus size={16} />
                </button>
            </div>

            {activeAlerts.length > 0 ? (
                activeAlerts.map((alert) => (
                    <div key={alert.id} className={`border-l-2 rounded-r-xl p-4 mb-4 relative overflow-hidden ${alert.severity === 'Severe' || alert.severity === 'Critical' ? 'bg-red-500/5 border-red-500' : 'bg-blue-500/5 border-blue-500'
                        }`}>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className={`text-sm font-black uppercase tracking-widest ${alert.severity === 'Severe' || alert.severity === 'Critical' ? 'text-red-500' : 'text-blue-400'
                                    }`}>{alert.condition}</h3>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${alert.severity === 'Severe' || alert.severity === 'Critical' ? 'bg-red-500 text-black' : 'bg-blue-500/20 text-blue-300'
                                    }`}>{alert.severity}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                                {alert.notes}
                            </p>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[9px] text-emerald-400 font-mono uppercase tracking-widest">
                                    Synced to Teacher Dashboard
                                </span>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                    <ShieldAlert className="mx-auto text-slate-600 mb-2" size={24} />
                    <p className="text-xs text-slate-500">No critical health alerts on file.</p>
                </div>
            )}

            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-600 font-mono">
                <span>LAST_VERIFIED: 24_OCT_2025</span>
                <div className="flex items-center gap-1 text-cyan-500 cursor-pointer hover:text-cyan-400">
                    <RefreshCw size={10} /> Sync
                </div>
            </div>
        </div>
    );
};
