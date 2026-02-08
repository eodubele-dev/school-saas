"use client"

import React from 'react';
import { Activity, Stethoscope, Thermometer, Clock, FileText } from 'lucide-react';

interface MedicalRecord {
    id: string;
    date: string;
    time: string;
    type: 'Injury' | 'Illness' | 'Routine' | 'Emergency';
    title: string;
    treatment: string;
    nurse: string;
    status: 'Back to Class' | 'Sent Home' | 'Under Observation';
}

// MOCK_LOGS removed in favor of real data

export const MedicalIncidentLog = ({ outcomes = [] }: { outcomes?: any[] }) => {
    // Fallback to empty if undefined
    const logs = outcomes && outcomes.length > 0 ? outcomes : [];

    return (
        <div className="bg-[#0A0A0B] border border-white/10 rounded-3xl p-6 shadow-2xl animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                        <Activity className="text-rose-500" size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white uppercase tracking-tight">Infirmary Log</h2>
                        <p className="text-slate-500 text-xs">Real-time clinical updates</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {logs.length > 0 ? (
                    <>
                        {logs.map((log: any) => (
                            <div key={log.id} className="relative pl-6 pb-6 border-l border-white/10 last:pb-0 last:border-0 group">
                                <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-slate-800 border-2 border-[#0A0A0B] group-hover:bg-rose-500 transition-colors"></div>

                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${log.type === 'Injury' ? 'bg-rose-500/20 text-rose-300' :
                                            log.type === 'Emergency' ? 'bg-red-500/20 text-red-400 animate-pulse' :
                                                'bg-blue-500/20 text-blue-300'
                                        }`}>
                                        {log.type}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                                        <Clock size={10} /> {log.incident_date} • {log.incident_time}
                                    </span>
                                </div>

                                <div className="flex gap-4">
                                    <div className="mt-1">
                                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                            <Stethoscope size={14} className="text-slate-400" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-white mb-1">{log.title}</h3>
                                        <p className="text-xs text-slate-400 leading-relaxed mb-3">
                                            <span className="text-slate-600 uppercase font-bold text-[10px] tracking-wider mr-2">Treatment:</span>
                                            {log.treatment}
                                        </p>

                                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-300">NS</div>
                                                <span className="text-[10px] text-slate-500 uppercase tracking-widest">{log.nurse_name || 'N/A'}</span>
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${log.status === 'Back to Class' ? 'text-emerald-400' : 'text-amber-400'
                                                }`}>
                                                {log.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button className="w-full py-3 text-[10px] text-slate-500 hover:text-white uppercase tracking-widest font-bold hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/5">
                            View Complete Medical History
                        </button>
                    </>
                ) : (
                    <div className="text-center py-6 text-slate-500 text-xs">
                        No medical incidents on record.
                    </div>
                )}
            </div>
        </div>
    );
};
