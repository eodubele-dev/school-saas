"use client"

import React from 'react';
import { Map, BookOpen, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { toast } from "sonner";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const CurriculumRoadmap = ({ milestones = [] }: { milestones?: any[] }) => {
    // Use passed milestones or empty array
    const items = milestones && milestones.length > 0 ? milestones : [];

    const downloadSyllabus = () => {
        if (items.length === 0) {
            toast.error("No Data", { description: "There is no curriculum data to download." });
            return;
        }

        toast.loading("Generating PDF...", { id: "pdf-gen" });

        try {
            const doc = new jsPDF();

            // Header
            doc.setFontSize(20);
            doc.setTextColor(40, 40, 40);
            doc.text("Curriculum Syllabus", 14, 22);

            doc.setFontSize(11);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);

            // Table Body
            const tableColumn = ["Subject", "Topic", "Grade Level", "Week Range", "Status", "Progress"];
            const tableRows = items.map(item => [
                item.subject || 'N/A',
                item.topic || item.title || 'N/A',
                item.grade_level || 'N/A',
                item.week_range || item.week || 'N/A',
                item.status.toUpperCase(),
                `${item.progress_percent || 0}%`
            ]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 40,
                styles: { fontSize: 9, cellPadding: 3 },
                headStyles: { fillColor: [14, 165, 233] }, // Cyan-500
                alternateRowStyles: { fillColor: [245, 247, 250] } // Slate-50
            });

            doc.save("student-curriculum-syllabus.pdf");
            toast.success("PDF Downloaded!", { id: "pdf-gen", description: "Your syllabus has been successfully saved." });
        } catch (error) {
            console.error("PDF Generation Error:", error);
            toast.error("Generation Failed", { id: "pdf-gen", description: "There was an error generating the document." });
        }
    };

    return (
        <div className="bg-slate-950/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-2xl animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20">
                        <Map className="text-blue-500" size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white uppercase tracking-tight">NERDC Roadmap</h2>
                        <p className="text-slate-500 text-xs">Current Academic Session</p>
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
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 transition-all ${item.status === 'completed' ? 'bg-emerald-500 border-slate-900 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                                    item.status === 'in-progress' ? 'bg-blue-600 border-slate-900 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] animate-pulse' :
                                        'bg-slate-800 border-white/10 text-slate-500'
                                    }`}>
                                    {item.status === 'completed' ? <CheckCircle2 size={20} /> :
                                        item.status === 'in-progress' ? <BookOpen size={20} /> :
                                            <Lock size={18} />}
                                </div>

                                <div className={`flex-1 p-4 rounded-2xl border transition-all ${item.status === 'in-progress' ? 'bg-white/5 border-blue-500/30' :
                                    'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'
                                    }`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{item.week_range || item.week}</span>
                                        {item.status === 'in-progress' && (
                                            <span className="text-[9px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold uppercase">Active</span>
                                        )}
                                    </div>
                                    <h3 className={`font-bold ${item.status === 'locked' ? 'text-slate-500' : 'text-white'}`}>
                                        {item.topic || item.title}
                                    </h3>
                                    {item.status === 'in-progress' && (
                                        <div className="mt-3">
                                            <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${item.progress_percent || 0}%` }}></div>
                                            </div>
                                            <div className="flex justify-between mt-1 text-[9px] text-slate-400 font-mono">
                                                <span>{item.progress_percent || 0}% Complete</span>
                                                <span>Est: This Week</span>
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

            <button
                onClick={downloadSyllabus}
                className="w-full mt-8 bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-3 rounded-xl uppercase tracking-widest text-xs flex items-center justify-center gap-2 border border-white/5 transition-all"
            >
                Download Full Syllabus <ArrowRight size={14} />
            </button>
        </div >
    );
};
