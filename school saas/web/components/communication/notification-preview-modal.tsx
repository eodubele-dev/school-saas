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
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="bg-card border border-border/50 rounded-2xl max-w-[400px] w-full overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-border/50 flex justify-between items-center bg-card">
                        <div className="flex items-center gap-3">
                            <Smartphone className="text-muted-foreground h-4 w-4" />
                            <h3 className="text-[13px] font-medium text-foreground tracking-wide">SMS Delivery Preview</h3>
                        </div>
                        <button
                            onClick={onCancel}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Content Payload */}
                    <div className="p-6 space-y-6 bg-card">
                        <div className="space-y-2">
                            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Payload Content</span>
                            <div className="bg-slate-950 border border-border/50 rounded-xl p-4 space-y-4">
                                <p className="text-sm text-foreground/90 leading-relaxed">
                                    <span className="text-foreground font-medium">EduFlow Alert:</span> Hi Parent, we are proud to inform you that <span className="text-foreground font-medium">{studentName}</span> has been recognized with the <span className="text-foreground font-medium">{badgeTitle}</span> badge!
                                </p>
                                {teacherNote && (
                                    <div className="pl-3 border-l-2 border-border/50 pt-1 pb-1">
                                        <p className="text-[13px] text-muted-foreground italic">
                                            "{teacherNote}"
                                        </p>
                                    </div>
                                )}
                                <div className="pt-2 flex justify-between items-center text-[10px] text-muted-foreground/70">
                                    <span>via EduFlow Systems</span>
                                    <span>Immediate Dispatch</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                            <div className="flex justify-between items-center px-1 pb-2">
                                <span className="text-[11px] text-muted-foreground/70">
                                    Tag: {auditTag}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <div className={`h-1.5 w-1.5 rounded-full ${creditStatus === 'Sufficient' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    <span className="text-[11px] text-muted-foreground">Credits {creditStatus}</span>
                                </div>
                            </div>

                            <button
                                onClick={onConfirm}
                                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium text-[13px] rounded-lg transition-colors flex items-center justify-center"
                            >
                                Dispatch Notification
                            </button>
                            <button
                                onClick={onCancel}
                                className="w-full h-11 bg-transparent hover:bg-[#111] text-[#A1A1AA] hover:text-white font-medium text-[13px] rounded-lg border border-[#333] transition-colors flex items-center justify-center"
                            >
                                Cancel Dispatch
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
