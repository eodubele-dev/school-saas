"use client"

import React from 'react';
import { BookOpen, CheckCircle2, Lock, Edit2 } from 'lucide-react';

interface CurriculumManagerContentProps {
    milestones: any[]
    onEdit: (milestone: any) => void
}

export function CurriculumManagerContent({ milestones, onEdit }: CurriculumManagerContentProps) {
    if (milestones.length === 0) {
        return (
            <div className="bg-[#0A0A0B]/50 backdrop-blur-md border border-border rounded-3xl p-12 text-center shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 to-transparent pointer-events-none" />
                <p className="text-muted-foreground font-medium relative z-10">No milestones assigned to this student yet.</p>
            </div>
        )
    }

    return (
        <div className="bg-[#0A0A0B]/80 backdrop-blur-xl border border-border rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent pointer-events-none" />
            <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-yellow-500/50 via-blue-500/20 to-red-500/10 rounded-full"></div>

                <div className="space-y-6 relative z-10">
                    {milestones.map((item) => (
                        <div key={item.id} className="flex gap-4 group">
                            <div className="relative z-10 flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 shadow-xl ${item.status === 'completed' ? 'bg-blue-500/20 border-blue-400 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.4)]' :
                                    item.status === 'in-progress' ? 'bg-yellow-500/20 border-yellow-400 text-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.4)] animate-pulse' :
                                        'bg-card text-card-foreground border-slate-700 text-muted-foreground'
                                    }`}>
                                    {item.status === 'completed' ? <CheckCircle2 size={24} /> :
                                        item.status === 'in-progress' ? <BookOpen size={20} /> :
                                            <Lock size={18} />}
                                </div>
                            </div>

                            <div className={`flex-1 p-5 rounded-2xl border transition-all duration-300 ${item.status === 'in-progress' ? 'bg-yellow-950/30 border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.05)] translate-x-2' :
                                item.status === 'completed' ? 'bg-secondary/50 border-blue-500/20 hover:bg-blue-950/20 hover:border-blue-500/30 hover:translate-x-1' :
                                    'bg-transparent border-transparent hover:bg-secondary/50 hover:border-border hover:translate-x-1'
                                }`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${item.status === 'in-progress' ? 'bg-yellow-500/10 text-yellow-300' : 'bg-secondary/50 text-muted-foreground'}`}>
                                        {item.subject} • {item.grade_level} • {item.week_range}
                                    </span>
                                    <button
                                        onClick={() => onEdit(item)}
                                        className="text-muted-foreground hover:text-yellow-400 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-lg hover:bg-yellow-500/10 active:scale-95"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                </div>
                                <h3 className={`font-black tracking-tight text-xl mt-2 ${item.status === 'locked' ? 'text-slate-600' : 'text-foreground drop-shadow-sm'}`}>
                                    {item.topic}
                                </h3>

                                <div className="mt-5 flex items-center gap-4">
                                    <span className={`text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-md shadow-sm border ${item.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                        item.status === 'in-progress' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                                            'bg-card text-card-foreground text-muted-foreground border-border'
                                        }`}>
                                        {item.status.replace('-', ' ')}
                                    </span>

                                    {item.status === 'in-progress' && (
                                        <div className="flex-1 max-w-[250px] flex items-center gap-3 bg-black/40 p-2 rounded-xl border border-border/50">
                                            <div className="flex-1 h-2 bg-card text-card-foreground rounded-full overflow-hidden shadow-inner">
                                                <div className="h-full bg-gradient-to-r from-red-500 to-yellow-500 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]" style={{ width: `${item.progress_percent || 0}%` }}></div>
                                            </div>
                                            <span className="text-xs text-yellow-400 font-mono font-bold">{item.progress_percent || 0}%</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
