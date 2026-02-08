"use client"

import React, { useState } from 'react';
import { MessageSquarePlus, Star, Send, ThumbsUp } from 'lucide-react';
import { cn } from "@/lib/utils";

import { submitFeedback } from "@/lib/actions/platinum";

export const FeedbackHub = ({ studentId }: { studentId?: string }) => {
    const [rating, setRating] = useState<number>(0);
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [comment, setComment] = useState('');

    const handleSubmit = async () => {
        if (rating === 0) return;
        setIsLoading(true);
        try {
            const result = await submitFeedback('General Inquiry', rating, comment);
            if (result.success) {
                setSubmitted(true);
                setTimeout(() => {
                    setSubmitted(false);
                    setRating(0);
                    setComment('');
                }, 3000);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#0A0A0B] border border-white/10 rounded-3xl p-5 shadow-2xl animate-in fade-in duration-500 delay-100">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-cyan-500/10 p-2.5 rounded-xl border border-cyan-500/20">
                        <MessageSquarePlus className="text-cyan-500" size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white uppercase tracking-tight">Feedback Hub</h2>
                        <p className="text-slate-500 text-xs">Voice of the Parents</p>
                    </div>
                </div>
            </div>

            {!submitted ? (
                <>
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-5 mb-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Star size={80} />
                        </div>
                        <h3 className="text-sm font-bold text-white mb-2">How was the Open Day?</h3>
                        <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                            We'd love to hear your thoughts on the recent Science Fair exhibition. Your input shapes our events.
                        </p>

                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={cn(
                                        "p-2 rounded-lg transition-all",
                                        star <= rating
                                            ? "text-amber-400 bg-amber-400/10 scale-110"
                                            : "text-slate-600 hover:text-amber-200 bg-white/5 hover:bg-white/10"
                                    )}
                                >
                                    <Star size={18} fill={star <= rating ? "currentColor" : "none"} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-cyan-500/50 transition-colors h-20 resize-none"
                            placeholder="Share your suggestions or concerns..."
                        />

                        <button
                            onClick={handleSubmit}
                            disabled={isLoading || rating === 0}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-black py-4 rounded-xl uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(8,145,178,0.3)] hover:shadow-[0_0_20px_rgba(8,145,178,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <span className="animate-pulse">Sending...</span> : <><Send size={14} /> Submit Feedback</>}
                        </button>
                    </div>
                </>
            ) : (
                <div className="h-full flex flex-col items-center justify-center py-10 animate-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mb-6 border border-cyan-500/20 shadow-[0_0_30px_rgba(8,145,178,0.2)]">
                        <ThumbsUp size={32} className="text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-2">Thank You!</h3>
                    <p className="text-xs text-slate-400 text-center max-w-[240px] leading-relaxed">
                        Your feedback has been encrypted and sent directly to the <span className="text-cyan-400 font-bold">Quality Assurance Desk</span>.
                    </p>
                </div>
            )}
        </div>
    );
};
