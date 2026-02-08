"use client"

import React from 'react';
import { Map, BookOpen, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

export const CurriculumRoadmap = ({ milestones = [] }: { milestones?: any[] }) => {
    // Use passed milestones or empty array
    const items = milestones && milestones.length > 0 ? milestones : [];
    return (
        <div className="bg-[#0A0A0B] border border-white/10 rounded-3xl p-6 shadow-2xl animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20">
                        <Map className="text-blue-500" size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white uppercase tracking-tight">NERDC Roadmap</h2>
                        <p className="text-slate-500 text-xs">JSS 2 Mathematics • Term 1</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Current Velocity</p>
                    <p className="text-emerald-400 font-bold text-xs">ON_TARGET</p>
                </div>
            </div>

            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-white/10"></div>

                <div className="space-y-6 relative z-10">
                    {items.length > 0 ? (
                        items.map((item, idx) => (
                            <div key={item.id} className="flex gap-4 group">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 transition-all ${item.status === 'completed' ? 'bg-emerald-500 border-[#0A0A0B] text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                                    item.status === 'in-progress' ? 'bg-blue-600 border-[#0A0A0B] text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] animate-pulse' :
                                        'bg-[#0A0A0B] border-white/10 text-slate-600'
                                    }`}>
                                    {item.status === 'completed' ? <CheckCircle2 size={20} /> :
                                        item.status === 'in-progress' ? <BookOpen size={20} /> :
                                            <Lock size={18} />}
                                </div>

                                <div className={`flex-1 p-4 rounded-2xl border transition-all ${item.status === 'in-progress' ? 'bg-white/5 border-blue-500/30' :
                                    'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'
                                    }`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{item.week}</span>
                                        {item.status === 'in-progress' && (
                                            <span className="text-[9px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold uppercase">Active</span>
                                        )}
                                    </div>
                                    <h3 className={`font-bold ${item.status === 'locked' ? 'text-slate-500' : 'text-white'}`}>
                                        {item.title}
                                    </h3>
                                    {item.status === 'in-progress' && (
                                        <div className="mt-3">
                                            <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 w-[65%] rounded-full"></div>
                                            </div>
                                            <div className="flex justify-between mt-1 text-[9px] text-slate-400 font-mono">
                                                <span>Progress: 65%</span>
                                                <span>Est. Completion: Fri</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl">
                            <BookOpen className="mx-auto text-slate-700 mb-3" size={32} />
                            <p className="text-slate-500 text-sm">Curriculum data syncing...</p>
                        </div>
                    )}
                </div>
            </div>

            <button className="w-full mt-8 bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-3 rounded-xl uppercase tracking-widest text-xs flex items-center justify-center gap-2 border border-white/5 transition-all">
                Download Full Syllabus <ArrowRight size={14} />
            </button>
        </div >
    );
};
