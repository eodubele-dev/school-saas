"use client"

import React from 'react'
import { Smartphone, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface NotificationPreviewModalProps {
    studentName: string
    badgeTitle: string
    teacherNote: string
    onConfirm: () => void
    onCancel: () => void
    creditStatus?: 'Sufficient' | 'Low' | 'Insufficient'
    auditTag?: string
}

export function NotificationPreviewModal({
    studentName,
    badgeTitle,
    teacherNote,
    onConfirm,
    onCancel,
    creditStatus = 'Sufficient',
    auditTag = `PLATINUM_NUDGE_${Date.now().toString().slice(-6)}`
}: NotificationPreviewModalProps) {
    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-[#0A0A0B] border border-white/10 rounded-[2.5rem] max-w-md w-full overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                >
                    {/* 📱 Mobile Mockup Header */}
                    <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/5 rounded-xl">
                                <Smartphone className="text-slate-400" size={18} />
                            </div>
                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Parent_SMS_Preview</h3>
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all group"
                        >
                            <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>

                    {/* 💬 The SMS Bubble Perspective */}
                    <div className="p-10 bg-gradient-to-b from-black/20 to-transparent">
                        <div className="bg-[#1C1C1E] rounded-3xl p-5 ml-auto max-w-[90%] border border-white/5 relative shadow-2xl space-y-3">
                            <p className="text-sm text-slate-200 leading-relaxed">
                                🌟 <span className="font-bold text-white">High-Recognition Alert:</span> Hi Parent, we are proud to inform you that <span className="text-cyan-400 font-bold">{studentName}</span> has just been awarded the <span className="text-purple-400 font-bold">{badgeTitle}</span> badge! 🎓
                            </p>
                            {teacherNote && (
                                <div className="border-l-2 border-cyan-500/30 pl-3 py-1 bg-cyan-500/5 rounded-r-lg">
                                    <p className="text-sm text-cyan-400/90 italic">
                                        "{teacherNote}"
                                    </p>
                                </div>
                            )}
                            <div className="pt-2 flex justify-between items-center text-[9px] text-slate-500 font-mono">
                                <span>eduflow.app/portal</span>
                                <span>Deliverable: NOW</span>
                            </div>
                            <div className="absolute -right-2 top-6 w-5 h-5 bg-[#1C1C1E] rotate-45 border-r border-t border-white/5"></div>
                        </div>

                        <div className="mt-8 flex flex-col items-center gap-2">
                            <p className="text-[9px] text-slate-600 text-center font-mono uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck size={10} className="text-cyan-500/50" />
                                Delivering via EduFlow Platinum SMS Gateway
                            </p>
                        </div>
                    </div>

                    {/* 🏁 Confirmation Actions & Forensic Data */}
                    <div className="p-10 pt-0 space-y-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center px-2">
                                <div className="flex items-center gap-2 text-emerald-400/80">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest font-mono">Credit_Status: {creditStatus}_Ready</span>
                                </div>
                                <div className="text-[9px] text-slate-500 font-mono uppercase">
                                    Audit_Tag: <span className="text-slate-300">{auditTag}</span>
                                </div>
                            </div>

                            <button
                                onClick={onConfirm}
                                className="group relative w-full overflow-hidden rounded-2xl p-4 bg-white hover:bg-cyan-50 transition-all duration-300 active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.05)]"
                            >
                                <div className="relative z-10 flex items-center justify-center gap-2">
                                    <span className="text-black font-black text-sm uppercase tracking-tighter">Confirm & Finalize SMS</span>
                                    <CheckCircle2 size={18} className="text-black stroke-[3px]" />
                                </div>
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-cyan-500/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                            </button>

                            <button
                                onClick={onCancel}
                                className="w-full bg-white/[0.03] text-slate-500 hover:text-white py-4 rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300 font-bold text-xs uppercase tracking-widest shadow-inner"
                            >
                                Re-Edit Message
                            </button>
                        </div>

                        <div className="text-center">
                            <p className="text-[8px] text-slate-700 font-mono uppercase tracking-[0.5em]">
                                Institutional_Communication_Policy_v4.2
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
