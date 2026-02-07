"use client"

import React from 'react';
import { BarChart3, ShieldAlert, Zap, Clock, TrendingDown, Target, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OverrideLog {
    id: string;
    staffName: string;
    initials: string;
    reason: string;
    timestamp: string;
}

interface ReconciliationStats {
    leakage: number;
    pendingApprovals: number;
    integrityScore: number;
    recentOverrides: OverrideLog[];
    trendData: number[];
}

interface BursarReconciliationDashboardProps {
    liveStats: ReconciliationStats;
}

export const BursarReconciliationDashboard: React.FC<BursarReconciliationDashboardProps> = ({ liveStats }) => {
    return (
        <div className="bg-[#050505] min-h-screen p-8 text-white font-sans animate-in fade-in duration-1000">
            {/* 🚀 Top Command Vitals */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingDown size={48} className="text-red-500" />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Current_Month_Leakage</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-red-500 tracking-tighter">₦{liveStats.leakage.toLocaleString()}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estimated Revenue Leakage</span>
                    </div>
                </div>

                <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Target size={48} className="text-cyan-400" />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Pending_Dispute_Payload</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-cyan-400 tracking-tighter">{liveStats.pendingApprovals}</span>
                        <span className="text-xs font-mono text-cyan-400/60 uppercase">Files</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Awaiting Forensic Review</span>
                    </div>
                </div>

                <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity size={48} className="text-emerald-500" />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">System_Integrity_Score</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-emerald-500 tracking-tighter">{liveStats.integrityScore}%</span>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Protocol Compliance Rate</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* 🚨 Live Override Pulse */}
                <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 shadow-inner">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                            <Zap size={20} className="text-amber-400 fill-amber-400/20" /> Recent Manual Overrides
                        </h3>
                        <div className="bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                            <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Live_Ticker</p>
                        </div>
                    </div>
                    <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                        {liveStats.recentOverrides.map((log) => (
                            <div key={log.id} className="bg-white/[0.02] p-5 rounded-3xl border border-white/5 flex justify-between items-center group hover:bg-white/[0.04] hover:border-cyan-500/30 transition-all duration-500">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center font-black text-slate-400 text-sm group-hover:scale-110 transition-transform">
                                        {log.initials}
                                    </div>
                                    <div>
                                        <p className="text-slate-200 font-black text-base uppercase tracking-tight group-hover:text-white transition-colors">{log.staffName}</p>
                                        <p className="text-[10px] font-mono text-slate-500 uppercase mt-0.5 tracking-widest">REF: {log.reason}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block mb-1 opacity-60">ADMIN_CONFIRMED</span>
                                    <div className="flex items-center justify-end gap-1.5 text-slate-600">
                                        <Clock size={10} />
                                        <span className="text-[9px] font-mono uppercase font-bold">{log.timestamp}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {liveStats.recentOverrides.length === 0 && (
                            <div className="p-20 text-center">
                                <ShieldAlert size={48} className="text-slate-800 mx-auto mb-4" />
                                <p className="text-slate-600 font-mono uppercase tracking-[0.2em] text-xs">No_Recent_Override_Events</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 📊 Attendance compliance Trend */}
                <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 shadow-inner">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                            <BarChart3 size={20} className="text-cyan-400" /> Weekly Compliance Trend
                        </h3>
                        <div className="flex gap-1.5">
                            {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-500/20" />)}
                        </div>
                    </div>
                    <div className="h-80 flex items-end justify-between gap-4 px-6 relative">
                        {/* Background Grid */}
                        <div className="absolute inset-0 flex flex-col justify-between py-1 px-6 pointer-events-none">
                            {[1, 2, 3, 4].map(i => <div key={i} className="w-full border-t border-white/[0.03]" />)}
                        </div>

                        {liveStats.trendData.map((height, i) => (
                            <div key={i} className="flex-1 bg-white/5 rounded-2xl relative group overflow-hidden h-full">
                                <div
                                    style={{ height: `${height}%` }}
                                    className="absolute bottom-0 w-full bg-gradient-to-t from-cyan-600/60 to-cyan-400/20 group-hover:from-cyan-500 group-hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] transition-all duration-700"
                                />
                                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] font-black text-white font-mono">{height}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between px-6 mt-6">
                        {['MON', 'TUE', 'WED', 'THU', 'FRI'].map(day => (
                            <span key={day} className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{day}</span>
                        ))}
                    </div>

                    <div className="mt-12 bg-white/[0.03] p-6 rounded-[2rem] border border-white/5 flex items-center gap-5">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <ShieldAlert className="text-emerald-500" size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-white font-black uppercase tracking-tight">System Integrity Peak</p>
                            <p className="text-[10px] text-slate-500 font-medium">Auto-verification hit 98% this Wednesday. Geofence performance is optimal.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
