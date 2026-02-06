"use client"

import React, { useState } from 'react';
import { Send, Camera, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { submitAttendanceDispute } from '@/lib/actions/attendance-dispute';

interface AttendanceDisputeViewProps {
    failedAttemptId: string;
    distanceDetected: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export const AttendanceDisputeView: React.FC<AttendanceDisputeViewProps> = ({
    failedAttemptId,
    distanceDetected,
    onSuccess,
    onCancel
}) => {
    const [loading, setLoading] = useState(false)
    const [reason, setReason] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!reason.trim()) {
            toast.error("Please provide a reason for the dispute.")
            return
        }

        setLoading(true)
        try {
            const res = await submitAttendanceDispute({
                auditLogId: failedAttemptId,
                distanceDetected,
                reason,
                proofUrl: "" // Mocked for now
            })

            if (res.success) {
                toast.success("Dispute submitted successfully", {
                    description: "The Principal will review your request shortly."
                })
                onSuccess()
            } else {
                toast.error(res.error || "Failed to submit dispute")
            }
        } catch (error) {
            toast.error("Internal service error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[110] p-6 animate-in fade-in zoom-in duration-300">
            <div className="max-w-xl w-full bg-[#0A0A0B] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

                <header className="mb-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-4">
                        Manual Verification Request
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Institutional <span className="text-cyan-500">Dispute</span></h2>
                    <p className="text-slate-500 text-sm mt-3 font-medium leading-relaxed">
                        Submit this form if technical GPS drift is preventing your verification despite being at the school gate.
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* 🛰️ Incident Context (Read-Only) */}
                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 flex justify-between items-center backdrop-blur-md">
                        <div>
                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">INCIDENT_ID</p>
                            <p className="text-xs font-mono text-cyan-400 font-bold">{failedAttemptId.slice(0, 18)}...</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">DISTANCE_ERROR</p>
                            <p className="text-xs font-mono text-red-500 font-black">{distanceDetected}m</p>
                        </div>
                    </div>

                    {/* 📝 Reason for Dispute */}
                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Evidence Summary</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 text-white text-sm focus:border-cyan-500 outline-none transition-all h-32 resize-none placeholder:text-slate-700 font-medium"
                            placeholder="e.g., GPS signal lost inside Administrative Building. Currently standing at the Main Gate..."
                        />
                    </div>

                    {/* 📸 Proof of Presence */}
                    <div className="border-2 border-dashed border-white/10 rounded-3xl p-10 flex flex-col items-center justify-center hover:border-cyan-500/30 transition-all cursor-pointer group bg-white/5 active:scale-[0.98]">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/20 transition-all">
                            <Camera size={32} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                        </div>
                        <p className="text-[10px] font-black text-slate-500 group-hover:text-white uppercase tracking-widest transition-colors">Capture Proof of Presence</p>
                        <p className="text-[9px] text-slate-700 mt-2 italic">(Photo of school gate or terminal required)</p>
                    </div>

                    {/* 🛡️ Warning Note */}
                    <div className="flex gap-4 p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                        <Info size={18} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-amber-200/40 leading-relaxed font-medium uppercase tracking-wider">
                            Note: All manual requests are tethered to executive forensic review. Any attempt to spoof location metadata will result in a permanent integrity flag.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 bg-white/5 border border-white/10 text-slate-400 font-black py-5 rounded-2xl uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] bg-cyan-600 hover:bg-cyan-500 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-[0_0_30px_rgba(8,145,178,0.3)] uppercase tracking-widest text-[10px]"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                            Submit for Approval
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
