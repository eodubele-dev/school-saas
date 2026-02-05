"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, MessageSquare, Phone, MapPin, ExternalLink, Clock, Hash } from "lucide-react"
import { useExecutiveConversion } from "./executive-context"

export function SupportSlideOver() {
    const { isSupportOpen, closeSupport } = useExecutiveConversion()

    return (
        <AnimatePresence>
            {isSupportOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeSupport}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    />

                    {/* Slide-over Content */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0A0A0B] border-l border-white/10 shadow-2xl z-[70] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div>
                                <h2 className="text-lg font-bold text-white">Lagos Executive Support</h2>
                                <p className="text-xs text-slate-400 font-mono tracking-widest uppercase mt-1">Direct Access Uplink</p>
                            </div>
                            <button
                                onClick={closeSupport}
                                className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Support Rep Info */}
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">EO</div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0A0A0B]" />
                                </div>
                                <div>
                                    <div className="font-bold text-white">Emmanuel O.</div>
                                    <div className="text-xs text-slate-500">Platinum Success Lead</div>
                                </div>
                                <div className="ml-auto flex flex-col items-end">
                                    <div className="text-[10px] text-emerald-400 font-mono">AVAIALABLE</div>
                                    <div className="text-[9px] text-slate-500">Wait time: ~2m</div>
                                </div>
                            </div>

                            {/* Contact Options */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest">Connect Instantly</h3>

                                <a
                                    href="https://wa.me/2348123456789" // Placeholder
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all group"
                                >
                                    <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                                        <MessageSquare className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">WhatsApp Direct</div>
                                        <div className="text-xs text-slate-400">Secure end-to-end messaging</div>
                                    </div>
                                    <ExternalLink className="ml-auto w-4 h-4 text-slate-500" />
                                </a>

                                <div
                                    className="flex items-center gap-4 p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all cursor-pointer group"
                                >
                                    <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">Instant Call-back</div>
                                        <div className="text-xs text-slate-400">Request a phone consultation</div>
                                    </div>
                                    <ExternalLink className="ml-auto w-4 h-4 text-slate-500" />
                                </div>
                            </div>

                            {/* Office Info */}
                            <div className="space-y-4 pt-4">
                                <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest">Our HQ</h3>
                                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                                    <div className="flex gap-4">
                                        <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                                        <div className="text-sm text-slate-300">
                                            12A Ligali Ayorinde St,<br />
                                            Victoria Island, Lagos.
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <Clock className="w-5 h-5 text-slate-400 shrink-0" />
                                        <div className="text-sm text-slate-300">
                                            Mon - Fri: 8:00 AM - 6:00 PM<br />
                                            Sat (Immersion Sessions): 10:00 AM - 2:00 PM
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/5 bg-white/[0.01]">
                            <div className="flex items-center gap-2 mb-4">
                                <Hash className="w-3 h-3 text-slate-600" />
                                <span className="text-[10px] font-mono text-slate-600 uppercase tracking-tighter">System_Session_ID: EF-LAG-772</span>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-relaxed uppercase">
                                Monitoring active secure support channels for high-tier institutions.
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
