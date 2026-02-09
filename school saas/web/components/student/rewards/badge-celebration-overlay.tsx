"use client"

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Star, Sparkles, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export interface UnseenBadge {
    id: string;
    title: string;
    description: string;
    icon_key: string;
    category: string;
    awarded_at: string;
    comment: string;
    awarded_by_name?: string;
}

interface BadgeCelebrationOverlayProps {
    badge: UnseenBadge | null;
    onDismiss: () => void;
    onAddToPortfolio: () => void;
}

export const BadgeCelebrationOverlay = ({ badge, onDismiss, onAddToPortfolio }: BadgeCelebrationOverlayProps) => {
    const router = useRouter();

    if (!badge) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[1000] bg-[#0A0A0B]/95 backdrop-blur-3xl flex items-center justify-center p-6"
            >
                <div className="relative max-w-lg w-full text-center">

                    {/* ✨ Background Sparkle Effect */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none"
                    >
                        <Sparkles className="text-emerald-500" size={400} />
                    </motion.div>

                    {/* 🏆 The Badge Core */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.2 }}
                        className="relative z-10 mb-8"
                    >
                        <div className="w-48 h-48 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-400 shadow-[0_0_100px_rgba(52,211,153,0.3)] flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent opacity-50" />
                            <Award className="text-emerald-400 relative z-10 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]" size={100} strokeWidth={1} />
                        </div>
                    </motion.div>

                    {/* 📝 Achievement Details */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="relative z-10"
                    >
                        <h2 className="text-sm font-mono text-emerald-500 uppercase tracking-[0.5em] mb-4 drop-shadow-sm">
                            New_Achievement_Unlocked
                        </h2>
                        <h1 className="text-5xl font-black italic text-white uppercase tracking-tighter mb-4 drop-shadow-lg">
                            {badge.title}
                        </h1>
                        <p className="text-slate-400 text-lg mb-2 max-w-sm mx-auto italic">
                            "{badge.comment || badge.description}"
                        </p>

                        {badge.awarded_by_name && (
                            <div className="flex items-center justify-center gap-2 mb-10 text-slate-500 text-sm">
                                <User size={14} />
                                <span>Issued by {badge.awarded_by_name}</span>
                            </div>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onAddToPortfolio}
                            className="bg-white text-black font-black px-12 py-4 rounded-2xl hover:bg-emerald-400 hover:text-white transition-all uppercase text-xs tracking-widest shadow-[0_20px_40px_rgba(255,255,255,0.1)] mb-4"
                        >
                            Add to Growth Portfolio
                        </motion.button>

                        <div>
                            <button onClick={onDismiss} className="text-slate-600 hover:text-white text-xs uppercase tracking-widest transition-colors">
                                Dismiss
                            </button>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
