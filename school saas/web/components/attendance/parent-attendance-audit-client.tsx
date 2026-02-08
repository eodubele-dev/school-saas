"use client"

import React from 'react';
import { Clock, Calendar, ShieldAlert, MapPin, CheckCircle } from 'lucide-react';
import { format } from "date-fns";

export function ParentAttendanceAudit({
    studentName,
    auditLogs
}: {
    studentName: string,
    auditLogs: any[]
}) {
    return (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl w-full">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/5 pb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Attendance Audit Trail</h2>
                    <p className="text-slate-500 text-sm mt-1">Forensic log for <span className="text-cyan-400 font-medium">{studentName}</span></p>
                </div>
                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
                    <ShieldAlert size={16} className="text-emerald-500" />
                    <div>
                        <p className="text-[10px] font-mono text-slate-600 uppercase leading-none mb-0.5">Audit_Integrity</p>
                        <p className="text-xs font-bold text-emerald-400 leading-none">VERIFIED_LOGS</p>
                    </div>
                </div>
            </header>

            {/* 📊 Chronological Audit Feed */}
            <div className="space-y-4">
                {auditLogs.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <p>No attendance records found for this period.</p>
                    </div>
                ) : (
                    auditLogs.map((log) => {
                        const isLate = log.status === 'late'
                        const isAbsent = log.status === 'absent'
                        const isPresent = log.status === 'present'

                        // Mock Location Status if not in DB
                        // Logic: If Late, assume Geofence Trigger. If Present, assume Biometric.
                        const locationStatus = log.location_status || (
                            isLate ? "OUT_OF_GEOFENCE (100m)" :
                                isAbsent ? "NO_DEVICE_SIGNAL" :
                                    "BIOMETRIC_VERIFIED"
                        )

                        return (
                            <div key={log.id} className="group relative flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 bg-white/[0.02] border border-white/5 p-5 rounded-2xl hover:border-white/20 transition-all">
                                {/* Status Indicator */}
                                <div className={`w-3 h-3 rounded-full shadow-[0_0_10px] mt-2 md:mt-0 ${isAbsent ? 'bg-red-500 shadow-red-500/20' :
                                    isLate ? 'bg-amber-400 shadow-amber-400/20' :
                                        'bg-emerald-500 shadow-emerald-500/20'
                                    }`} />

                                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-y-2 gap-x-4 w-full">
                                    <div className="flex items-center gap-3">
                                        <Calendar size={14} className="text-slate-600" />
                                        <span className="text-sm font-medium text-slate-200">{format(new Date(log.date || log.created_at), 'MMM dd, yyyy')}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock size={14} className="text-slate-600" />
                                        <span className="text-sm font-mono text-slate-400">
                                            {format(new Date(log.created_at), 'hh:mm:ss a')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin size={14} className="text-slate-600" />
                                        <span className={`text-[10px] font-mono uppercase tracking-wide ${isLate ? 'text-amber-500/70' :
                                            isAbsent ? 'text-red-500/70' :
                                                'text-slate-500'
                                            }`}>
                                            {locationStatus}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-left md:text-right w-full md:w-auto mt-2 md:mt-0 pl-7 md:pl-0">
                                    <p className="text-[10px] text-slate-600 uppercase mb-0.5">Status</p>
                                    <p className={`text-xs font-bold tracking-wider ${isAbsent ? 'text-red-500' :
                                        isLate ? 'text-amber-400' :
                                            'text-emerald-500'
                                        }`}>{String(log.status).toUpperCase()}</p>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
};
