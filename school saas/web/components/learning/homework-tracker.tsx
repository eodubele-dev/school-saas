"use client"

import React from 'react';
import { PenTool, Calendar, AlertCircle, FileCheck } from 'lucide-react';

export const HomeworkTracker = ({ tasks = [] }: { tasks?: any[] }) => {
    const activeTasks = tasks && tasks.length > 0 ? tasks : [];
    return (
        <div className="bg-[#0A0A0B] border border-white/10 rounded-3xl p-5 shadow-2xl animate-in fade-in duration-500 delay-100 flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-orange-500/10 p-2.5 rounded-xl border border-orange-500/20">
                        <PenTool className="text-orange-500" size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white uppercase tracking-tight">Assignments</h2>
                        <p className="text-slate-500 text-xs">2 Pending Tasks</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-3">
                {activeTasks.length > 0 ? (
                    activeTasks.map((task) => (
                        <div key={task.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all group relative overflow-hidden">
                            {task.priority === 'high' && task.status !== 'completed' && (
                                <div className="absolute right-0 top-0 bg-red-500 w-12 h-12 rotate-45 translate-x-6 -translate-y-6"></div>
                            )}

                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded-md">
                                    {task.subject}
                                </span>
                                {task.status === 'completed' ? (
                                    <span className="text-emerald-400 flex items-center gap-1 text-[10px] font-bold uppercase">
                                        <FileCheck size={12} /> Submitted
                                    </span>
                                ) : (
                                    <span className={`text-[10px] font-bold uppercase flex items-center gap-1 ${task.priority === 'high' ? 'text-red-400' : 'text-amber-400'
                                        }`}>
                                        <ClockIcon /> Due: {task.due}
                                    </span>
                                )}
                            </div>

                            <h3 className={`text-sm font-bold mb-1 ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-white'}`}>
                                {task.title}
                            </h3>

                            {task.status !== 'completed' && (
                                <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="flex-1 bg-white text-black py-2 rounded-lg text-[10px] font-black uppercase">
                                        Upload
                                    </button>
                                    <button className="px-3 bg-white/10 rounded-lg text-white hover:bg-white/20">
                                        Details
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl">
                        <FileCheck className="mx-auto text-slate-700 mb-3" size={32} />
                        <p className="text-slate-500 text-sm">No pending assignments.</p>
                    </div>
                )}
            </div >

            <div className="mt-6 bg-slate-900/50 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                <AlertCircle size={16} className="text-slate-500" />
                <p className="text-[10px] text-slate-500 leading-tight">
                    Assignments account for <strong className="text-slate-300">20%</strong> of the Continuous Assessment score.
                </p>
            </div>
        </div >
    );
};

const ClockIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
)
