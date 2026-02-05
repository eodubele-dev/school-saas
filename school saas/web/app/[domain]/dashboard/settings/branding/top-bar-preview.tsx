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
                {/* The Header Area - Exact Match of Sidebar Header */}
                <div
                    className="px-4 pt-4 pb-4 border-b border-white/5 relative group shrink-0"
                    style={{
                        backgroundColor: 'rgba(15, 23, 42, 0.4)', // bg-slate-900/40 approx
                    }}
                >
                    {/* Accent Glow Simulation (Subtle) */}
                    <div
                        className="absolute inset-0 opacity-[0.03] transition-opacity duration-500 pointer-events-none"
                        style={{ backgroundColor: accent }}
                    />

                    <div className="flex items-center gap-3 relative z-10 w-full">
                        {/* 1. Logo Container (48px / h-12) */}
                        <div
                            className="h-12 w-12 shrink-0 flex items-center justify-center rounded-xl bg-slate-900/50 border border-white/10 overflow-hidden"
                            style={{
                                borderColor: `${accent}40`, // 25% opacity
                                boxShadow: `0 0 20px ${accent}10`
                            }}
                        >
                            {logo ? (
                                <img
                                    src={logo}
                                    alt="Logo"
                                    className="h-full w-full object-contain p-1"
                                />
                            ) : (
                                <span className="text-2xl">🎓</span>
                            )}
                        </div>

                        {/* 2. Identity Stack */}
                        <div className="flex flex-col flex-1 min-w-0">
                            <h2 className="text-white font-bold text-lg tracking-tight leading-tight truncate">
                                {name || "EduFlow Platinum"}
                            </h2>
                            <p
                                className="text-[10px] font-semibold mt-0.5 tracking-wide truncate"
                                style={{ color: accent }}
                            >
                                {motto || "Excellence in Education"}
                            </p>
                        </div>
                    </div>

                    {/* System Integrity (Visual Polish) */}
                    <div className="flex items-center gap-2 mt-4 opacity-40">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-[0.2em]">
                            System_Integrity: Optimal
                        </span>
                    </div>
                </div>

                {/* Mock Content below */}
                <div className="p-4 space-y-3 opacity-10 pointer-events-none grayscale h-20">
                    <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded bg-white/20" />
                        <div className="h-3 w-3/4 bg-white/20 rounded" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded bg-white/20" />
                        <div className="h-3 w-1/2 bg-white/20 rounded" />
                    </div>
                </div>
            </div>
        </div>
    )
}
