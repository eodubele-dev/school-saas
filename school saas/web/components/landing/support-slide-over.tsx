"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, MessageSquare, Phone, MapPin, ExternalLink, Clock, Hash } from "lucide-react"
import { useExecutiveConversion } from "./executive-context"
import { SITE_CONFIG } from "@/lib/constants/site-config"

export function SupportSlideOver() {
    const { isSupportOpen, closeSupport } = useExecutiveConversion()

    const whatsappUrl = `https://wa.me/${SITE_CONFIG.support.phoneFull.replace('+', '')}?text=${encodeURIComponent(SITE_CONFIG.support.whatsappMessage)}`

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
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0A0A0B] border-l border-border shadow-2xl z-[70] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border/50 flex items-center justify-between bg-white/[0.02]">
                            <div>
                                <h2 className="text-lg font-bold text-foreground">Lagos Executive Support</h2>
                                <p className="text-xs text-muted-foreground font-mono tracking-widest uppercase mt-1">Direct Access Uplink</p>
                            </div>
                            <button
                                onClick={closeSupport}
                                className="p-2 hover:bg-secondary/50 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Support Rep Info */}
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 border border-border/50">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-foreground">EO</div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0A0A0B]" />
                                </div>
                                <div>
                                    <div className="font-bold text-foreground">Emmanuel O.</div>
                                    <div className="text-xs text-muted-foreground">Platinum Success Lead</div>
                                </div>
                                <div className="ml-auto flex flex-col items-end">
                                    <div className="text-[10px] text-emerald-400 font-mono">AVAIALABLE</div>
                                    <div className="text-[9px] text-muted-foreground">Wait time: ~2m</div>
                                </div>
                            </div>

                            {/* Contact Options */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Connect Instantly</h3>

                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all group"
                                >
                                    <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                                        <MessageSquare className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-foreground">WhatsApp Direct</div>
                                        <div className="text-xs text-muted-foreground">Secure end-to-end messaging</div>
                                    </div>
                                    <ExternalLink className="ml-auto w-4 h-4 text-muted-foreground" />
                                </a>

                                <a
                                    href={`tel:${SITE_CONFIG.support.phoneFull}`}
                                    className="flex items-center gap-4 p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all cursor-pointer group"
                                >
                                    <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-foreground">Instant Call-back</div>
                                        <div className="text-xs text-muted-foreground">Request a phone consultation</div>
                                    </div>
                                    <ExternalLink className="ml-auto w-4 h-4 text-muted-foreground" />
                                </a>
                            </div>

                            {/* Office Info */}
                            <div className="space-y-4 pt-4">
                                <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Our HQ</h3>
                                <div className="p-5 rounded-2xl bg-secondary/50 border border-border/50 space-y-4">
                                    <div className="flex gap-4">
                                        <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
                                        <address className="text-sm text-slate-300 not-italic">
                                            {SITE_CONFIG.hq.address}
                                        </address>
                                    </div>
                                    <div className="flex gap-4">
                                        <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
                                        <div className="text-sm text-slate-300">
                                            Mon - Fri: 8:00 AM - 6:00 PM<br />
                                            Sat (Immersion Sessions): 10:00 AM - 2:00 PM
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-border/50 bg-white/[0.01]">
                            <div className="flex items-center gap-2 mb-4">
                                <Hash className="w-3 h-3 text-slate-600" />
                                <span className="text-[10px] font-mono text-slate-600 uppercase tracking-tighter">System_Session_ID: EF-LAG-772</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-relaxed uppercase">
                                Monitoring active secure support channels for high-tier institutions.
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
