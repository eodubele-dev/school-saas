"use client"

import { Card } from "@/components/ui/card"
import { School, ShieldCheck } from "lucide-react"

export function ResultPreview({ data }: { data: any }) {
    const primaryColor = data?.theme_config?.primary || "#06b6d4"

    return (
        <div className="space-y-6 lg:sticky lg:top-24">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Live Result Preview</h3>

            <Card className="bg-white text-slate-950 overflow-hidden shadow-2xl border-none">
                {/* Header of Result Sheet */}
                <div className="p-8 border-b-2 border-slate-100 relative">
                    <div className="flex items-center gap-6">
                        {data?.logo_url ? (
                            <img src={data.logo_url} className="h-20 w-20 rounded-lg object-cover shadow-lg border border-slate-100" />
                        ) : (
                            <div className="h-20 w-20 rounded-lg bg-slate-50 flex items-center justify-center text-slate-200">
                                <School className="h-10 w-10 text-slate-300" />
                            </div>
                        )}
                        <div className="flex-1 space-y-1">
                            <h2 className="text-2xl font-black uppercase tracking-tight leading-none" style={{ color: primaryColor }}>
                                {data?.name || "School Name Placeholder"}
                            </h2>
                            <p className="text-sm font-medium text-slate-500 italic">
                                "{data?.motto || "School motto goes here..."}"
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                {data?.address || "123 School Road, City, State"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body Content Placeholder */}
                <div className="p-8 space-y-6 bg-slate-50/50">
                    <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-slate-200">
                        <div className="space-y-2">
                            <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
                            <div className="h-3 w-48 bg-slate-50 rounded animate-pulse" />
                        </div>
                        <div className="h-10 w-10 rounded-full bg-slate-100 animate-pulse" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-24 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                            <span className="text-3xl font-black opacity-10" style={{ color: primaryColor }}>A+</span>
                        </div>
                        <div className="h-24 bg-white rounded-lg border border-slate-200" />
                    </div>
                </div>

                {/* Footer Branding */}
                <div className="p-4 bg-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-2 opacity-30">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-[8px] font-bold uppercase tracking-widest">EduFlow Verified Result</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Page 1 of 1</span>
                </div>
            </Card>

            <div className="p-6 bg-cyan-950/20 border border-cyan-500/20 rounded-xl space-y-3">
                <p className="text-xs text-cyan-400 font-bold uppercase tracking-widest">Design Principle</p>
                <p className="text-sm text-slate-400 leading-relaxed">
                    This preview shows how your branding accent (<span style={{ color: primaryColor }} className="font-bold underline">this color</span>) and logo will appear on student result sheets and formal documents.
                </p>
            </div>
        </div>
    )
}
