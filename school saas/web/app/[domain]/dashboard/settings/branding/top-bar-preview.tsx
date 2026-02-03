"use client"

import { School, Book } from "lucide-react"
import { cn } from "@/lib/utils"

interface TopBarPreviewProps {
    name: string
    logo: string | null
    motto: string
    accent: string
}

export function TopBarPreview({ name, logo, motto, accent }: TopBarPreviewProps) {
    // We simulate the exact structure of the sidebar header
    // The user's input `accent` is a hex color. We need to handle the CSS variable simulation roughly.
    // For specific RGBA opacity classes, we'll try to use inline styles or existing tailwind processing if possible.
    // To properly simulate "bg-[var(--school-accent)]/5", we might need to convert hex to rgb. 
    // For now, we'll assume the preview just uses the raw color for simplicity or a helper.

    return (
        <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-slate-500 font-bold px-1">
                <span>Live Dashboard Preview</span>
                <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">1:1 Scale</span>
            </div>

            {/* The Container - representing the top left of the sidebar */}
            <div className="rounded-xl overflow-hidden border border-white/10 bg-slate-950 relative shadow-2xl">
                {/* Background Simulation */}

                {/* The Header Area */}
                <div className="flex h-[88px] items-center px-3 border-b border-white/5 relative group shrink-0 gap-3">
                    {/* Vertical Divider */}
                    <div className="absolute bottom-0 right-0 top-0 w-px bg-white/10" />

                    {/* Accent Glow Simulation */}
                    <div
                        className="absolute inset-0 opacity-10 transition-opacity duration-500"
                        style={{ backgroundColor: accent }}
                    />

                    <div className="flex items-center gap-3 relative z-10 w-full overflow-hidden">
                        {/* 1. Large 'Goldilocks' Logo Container (56px) */}
                        <div className="h-14 w-14 shrink-0 flex items-center justify-center rounded-xl bg-slate-900/50 backdrop-blur transition-all duration-300 border border-white/10"
                            style={{
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))',
                                borderColor: `${accent}40` // 25% opacity
                            }}>
                            {logo ? (
                                <img
                                    src={logo}
                                    alt="Logo"
                                    className="h-full w-full object-contain p-1"
                                />
                            ) : (
                                <School className="h-8 w-8" style={{ color: accent }} />
                            )}
                        </div>

                        {/* 2. Dual-Line Identity Stack */}
                        <div className="flex flex-col flex-1 min-w-0 justify-center">
                            <span className="font-bold text-[20px] text-white leading-[1.1] tracking-tight drop-shadow-sm line-clamp-2">
                                {name || "School Name"}
                            </span>
                            {/* Slogan */}
                            <span className="text-[12px] font-semibold text-cyan-400 mt-0.5 leading-none tracking-wide truncate">
                                {motto || "Institutional Slogan"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Mock Content below to show context */}
                <div className="p-4 space-y-3 opacity-30 pointer-events-none grayscale h-24">
                    <div className="h-8 w-3/4 bg-slate-800 rounded mb-2"></div>
                    <div className="h-4 w-1/2 bg-slate-800 rounded"></div>
                    <div className="h-4 w-full bg-slate-800 rounded"></div>
                </div>
            </div>
        </div>
    )
}
