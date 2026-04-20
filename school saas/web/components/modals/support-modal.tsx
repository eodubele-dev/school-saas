"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { MessageSquare, Phone, Mail, ExternalLink, ShieldCheck, Clock, X } from "lucide-react"
import { toast } from "sonner"

export function SupportModal({
    isOpen,
    onClose,
    tenantName
}: {
    isOpen: boolean,
    onClose: () => void,
    tenantName: string
}) {
    const supportName = process.env.NEXT_PUBLIC_SUPPORT_NAME || 'Platform Engineer'
    const supportInitials = supportName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    const supportRole = process.env.NEXT_PUBLIC_SUPPORT_ROLE || 'Technical Success Lead'
    const supportWhatsApp = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || ''
    const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || '08130029819'
    const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@eduflow.ng'

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#09090b] border-white/10 text-foreground max-w-md overflow-hidden p-0 gap-0 shadow-2xl [&>button]:z-50 [&>button]:text-zinc-400 [&>button]:hover:text-zinc-100">
                {/* Ambient Background Glow */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />

                <div className="p-6 border-b border-white/5 bg-transparent relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-zinc-400 animate-pulse" />
                        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em] shadow-sm">Priority Infrastructure Link</span>
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold tracking-tight text-zinc-100">Direct Access Terminal</DialogTitle>
                        <DialogDescription className="text-muted-foreground text-xs mt-1">
                            Secure line for {tenantName} executive operations.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-4 relative z-10">
                    {/* Support Lead */}
                    <button 
                        onClick={() => toast.success("Live Chat Protocol Initiating", { description: "Connecting to secure channel..." })}
                        className="w-full flex items-center gap-4 p-4 rounded-xl bg-zinc-900 border border-white/10 shadow-sm hover:border-white/30 hover:bg-zinc-800/80 transition-all text-left outline-none focus-visible:ring-1 focus-visible:ring-zinc-500"
                    >
                        <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(255,255,255,0.15)]">{supportInitials}</div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-zinc-400 border-2 border-[#09090b]" />
                        </div>
                        <div className="flex-1">
                            <div className="font-semibold text-zinc-100 text-sm">{supportName}</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">{supportRole}</div>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                            <div className="text-[9px] text-zinc-400 font-mono text-right tracking-widest">ONLINE</div>
                            <div className="text-[9px] text-zinc-500 flex items-center gap-1 mt-1 font-mono">
                                <Clock className="h-2.5 w-2.5" />
                                ~2m wait
                            </div>
                        </div>
                    </button>

                    {/* WhatsApp Support */}
                    {supportWhatsApp && (
                        <a
                            href={`https://wa.me/${supportWhatsApp}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-4 p-4 rounded-xl bg-transparent border border-white/10 hover:border-white/20 hover:bg-white/[0.02] transition-colors outline-none focus-visible:ring-1 focus-visible:ring-zinc-500"
                        >
                            <div className="p-2.5 rounded-lg bg-zinc-900 border border-white/5 text-zinc-400 group-hover:text-zinc-100 transition-colors shadow-sm">
                                <MessageSquare className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                                <div className="font-medium text-zinc-100 text-sm tracking-tight">WhatsApp Direct</div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">Encrypted executive messaging</div>
                            </div>
                            <ExternalLink className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                        </a>
                    )}

                    {/* Email Support */}
                    <a
                        href={`mailto:${supportEmail}?subject=Executive Support Request: ${tenantName}`}
                        className="group flex items-center gap-4 p-4 rounded-xl bg-transparent border border-white/10 hover:border-white/20 hover:bg-white/[0.02] transition-colors outline-none focus-visible:ring-1 focus-visible:ring-zinc-500 text-left w-full"
                    >
                        <div className="p-2.5 rounded-lg bg-zinc-900 border border-white/5 text-zinc-400 group-hover:text-zinc-100 transition-colors shadow-sm">
                            <Mail className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-zinc-100 text-sm tracking-tight">Email Uplink</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">Official support ticketing</div>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    </a>

                    {/* Voice Support */}
                    <a 
                        href={`tel:${supportPhone}`}
                        className="group flex items-center gap-4 p-4 rounded-xl bg-transparent border border-white/10 hover:border-white/20 hover:bg-white/[0.02] transition-all text-left w-full"
                    >
                        <div className="p-2.5 rounded-lg bg-zinc-900 border border-white/5 text-zinc-400 group-hover:text-zinc-100 transition-colors shadow-sm">
                            <Phone className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-zinc-100 text-sm tracking-tight flex items-center gap-2">
                                Voice Consultation
                                <span className="text-[9px] bg-emerald-500/10 px-1.5 py-0.5 rounded text-emerald-500 font-mono tracking-wider">AVAILABLE</span>
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">Direct executive line</div>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    </a>
                </div>

                <div className="p-6 border-t border-white/5 bg-transparent relative z-10">
                    <div className="flex items-center justify-between text-[9px] font-mono text-zinc-600 uppercase tracking-widest mb-2">
                        <span>Connection: AES-256</span>
                        <span>Protocol: PLATINUM_SECURE</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-relaxed uppercase tracking-wide">
                        High-tier institutional support session. All interactions are prioritized for executive users.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
