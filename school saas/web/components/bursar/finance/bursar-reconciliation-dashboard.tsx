"use client"

import React from 'react';
import { BarChart3, ShieldAlert, Zap, Clock, TrendingDown, Target, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <div className="font-sans animate-in fade-in duration-1000 space-y-6">
            {/* 🚀 Top Command Vitals */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Card className="bg-card text-card-foreground border-border relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Current Month Leakage</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground mb-2">
                            ₦{liveStats.leakage.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-red-500" />
                            <span className="text-xs text-red-500">Estimated Revenue Leakage</span>
                        </div>
                        <div className="absolute -bottom-4 -right-4 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <TrendingDown size={120} className="text-foreground" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card text-card-foreground border-border relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending Dispute Payload</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground mb-2 flex items-baseline gap-2">
                            {liveStats.pendingApprovals}
                            <span className="text-sm font-normal text-muted-foreground">Files</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-cyan-500" />
                            <span className="text-xs text-cyan-500">Awaiting Forensic Review</span>
                        </div>
                        <div className="absolute -bottom-4 -right-4 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <Target size={120} className="text-foreground" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card text-card-foreground border-border relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">System Integrity Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground mb-2 flex items-baseline gap-2">
                            {liveStats.integrityScore}%
                        </div>
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-emerald-500" />
                            <span className="text-xs text-emerald-500">Protocol Compliance Rate</span>
                        </div>
                        <div className="absolute -bottom-4 -right-4 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <Activity size={120} className="text-foreground" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 🚨 Live Override Pulse */}
                <Card className="bg-card text-card-foreground border-border shadow-sm flex flex-col h-[450px]">
                    <CardHeader className="flex flex-row justify-between items-center pb-2 shrink-0">
                        <CardTitle className="text-xl font-bold text-foreground flex items-center gap-3">
                            <Zap size={20} className="text-amber-400 fill-amber-400/20" /> Recent Manual Overrides
                        </CardTitle>
                        <div className="bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                            <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Live Ticker</p>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2 mt-4">
                        {liveStats.recentOverrides.map((log) => (
                            <div key={log.id} className="bg-white/[0.02] p-4 rounded-xl border border-border/50 flex justify-between items-center group hover:bg-white/[0.04] hover:border-amber-500/30 transition-all duration-500">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-border flex items-center justify-center font-black text-muted-foreground text-sm group-hover:scale-110 transition-transform">
                                        {log.initials}
                                    </div>
                                    <div>
                                        <p className="text-slate-200 font-black text-base uppercase tracking-tight group-hover:text-foreground transition-colors">{log.staffName}</p>
                                        <p className="text-[10px] font-mono text-muted-foreground uppercase mt-0.5 tracking-widest">REF: {log.reason}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest block mb-1">Admin Confirmed</span>
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
                                <p className="text-muted-foreground font-mono uppercase tracking-[0.1em] text-xs">No Recent Override Events</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 📊 Attendance compliance Trend */}
                <Card className="bg-card text-card-foreground border-border shadow-sm flex flex-col h-[450px]">
                    <CardHeader className="flex flex-row justify-between items-center pb-2 shrink-0">
                        <CardTitle className="text-xl font-bold text-foreground flex items-center gap-3">
                            <BarChart3 size={20} className="text-cyan-400" /> Weekly Compliance Trend
                        </CardTitle>
                        <div className="flex gap-1.5">
                            {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-500/20" />)}
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between mt-4">
                        <div className="flex-1 flex items-end justify-between gap-4 px-6 relative mt-4">
                            {/* Background Grid */}
                            <div className="absolute inset-0 flex flex-col justify-between py-1 px-6 pointer-events-none">
                                {[1, 2, 3, 4].map(i => <div key={i} className="w-full border-t border-white/[0.03]" />)}
                            </div>

                            {liveStats.trendData.map((height, i) => {
                                const chartColors = [
                                    'from-rose-500/80 to-rose-500/10 group-hover:from-rose-400 group-hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]',
                                    'from-amber-500/80 to-amber-500/10 group-hover:from-amber-400 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]',
                                    'from-emerald-500/80 to-emerald-500/10 group-hover:from-emerald-400 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]',
                                    'from-blue-500/80 to-blue-500/10 group-hover:from-blue-400 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]',
                                    'from-violet-500/80 to-violet-500/10 group-hover:from-violet-400 group-hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                                ];
                                return (
                                    <div key={i} className="flex-1 bg-secondary/50 rounded-2xl relative group overflow-hidden h-full border border-border/50">
                                        <div
                                            style={{ height: `${height}%` }}
                                            className={`absolute bottom-0 w-full bg-gradient-to-t ${chartColors[i % chartColors.length]} transition-all duration-700`}
                                        />
                                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[10px] font-bold text-foreground font-mono">{height}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-between px-6 mt-4">
                            {['MON', 'TUE', 'WED', 'THU', 'FRI'].map(day => (
                                <span key={day} className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{day}</span>
                            ))}
                        </div>

                        <div className="mt-6 bg-secondary/50 p-4 rounded-xl border border-border/50 flex items-center gap-4 shrink-0">
                            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                                <ShieldAlert className="text-emerald-500" size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-200 font-bold uppercase tracking-tight">System Integrity Peak</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Auto-verification hit {Math.max(...liveStats.trendData)}% this week. Geofence performance is optimal.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
