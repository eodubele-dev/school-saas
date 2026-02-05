"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { MessageSquare, Phone, Mail, ExternalLink, ShieldCheck, Clock } from "lucide-react"

export function SupportModal({
    isOpen,
    onClose,
    tenantName
}: {
    isOpen: boolean,
    onClose: () => void,
    tenantName: string
}) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#0A0A0B] border-white/10 text-white max-w-md overflow-hidden p-0 gap-0">
                <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">Platinum Priority Uplink</span>
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold tracking-tight text-white italic">Direct Access Terminal</DialogTitle>
                        <DialogDescription className="text-slate-400 text-xs">
                            Secure line for {tenantName} executive operations.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-4">
                    {/* Support Lead */}
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-sm">EO</div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0A0A0B]" />
                        </div>
                        <div>
                            <div className="font-bold text-white text-sm">Emmanuel O.</div>
                            <div className="text-[10px] text-slate-500">Platinum Success Lead</div>
                        </div>
                        <div className="ml-auto flex flex-col items-end">
                            <div className="text-[9px] text-emerald-400 font-mono text-right">ONLINE</div>
                            <div className="text-[8px] text-slate-600 flex items-center gap-1 mt-1">
                                <Clock className="h-2 w-2" />
                                ~2m wait
                            </div>
                        </div>
                    </div>

                    {/* WhatsApp Support */}
                    <a
                        href="https://wa.me/2348123456789"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                    >
                        <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                            <MessageSquare className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-white text-xs tracking-wide">WhatsApp Direct</div>
                            <div className="text-[10px] text-slate-400 font-medium">Encrypted executive messaging</div>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                    </a>

                    {/* Email Support */}
                    <button
                        onClick={() => window.location.href = `mailto:support@eduflow.platinum?subject=Executive Support Request: ${tenantName}`}
                        className="group flex items-center gap-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all text-left w-full"
                    >
                        <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-white text-xs tracking-wide">Email Uplink</div>
                            <div className="text-[10px] text-slate-400 font-medium">Official support ticketing</div>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-slate-600 group-hover:text-blue-400 transition-colors" />
                    </button>

                    {/* Voice Support (Locked) */}
                    <div className="group flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 opacity-50 cursor-not-allowed grayscale">
                        <div className="p-2.5 rounded-xl bg-slate-800 text-slate-500">
                            <Phone className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-slate-400 text-xs tracking-wide flex items-center gap-2">
                                Voice Consultation
                                <span className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded text-slate-500 font-mono uppercase">LTS ONLY</span>
                            </div>
                            <div className="text-[10px] text-slate-600">Enterprise direct line</div>
                        </div>
                        <Clock className="h-3.5 w-3.5 text-slate-700" />
                    </div>
                </div>

                <div className="p-6 border-t border-white/5 bg-white/[0.01]">
                    <div className="flex items-center justify-between text-[8px] font-mono text-slate-600 uppercase tracking-[0.2em] mb-2">
                        <span>Connection: AES-256</span>
                        <span>Protocol: PLATINUM_SECURE</span>
                    </div>
                    <p className="text-[9px] text-slate-600 leading-relaxed uppercase">
                        High-tier institutional support session. All interactions are prioritized for executive users.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
