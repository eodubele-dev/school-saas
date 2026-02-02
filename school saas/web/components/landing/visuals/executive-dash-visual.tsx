'use client'

import { TrendingUp, Users, Wallet } from "lucide-react"

export function ExecutiveDashVisual() {
    return (
        <div className="relative w-full aspect-[16/10] bg-slate-950 rounded-xl border border-slate-800 shadow-2xl overflow-hidden font-sans">
            {/* Header */}
            <div className="h-10 border-b border-slate-800 flex items-center px-4 justify-between bg-slate-900/50">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">EXECUTIVE VIEW • LIVE</div>
            </div>

            <div className="p-6 grid grid-cols-3 gap-4">
                {/* KPI Card 1: Revenue - Shimmer Effect */}
                <div className="col-span-1 rounded-lg bg-slate-900 border border-slate-800 p-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                    <div className="text-xs text-slate-400 mb-1 flex items-center gap-2">
                        <Wallet className="h-3 w-3 text-amber-500" /> Total Revenue
                    </div>
                    <div className="text-xl font-bold text-white tracking-tight">
                        <span className="text-amber-500 mr-1">₦</span>
                        12,450,000
                    </div>
                    <div className="text-[10px] text-green-400 mt-2 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> +15% vs Last Term
                    </div>
                </div>

                {/* KPI Card 2: Staff */}
                <div className="col-span-1 rounded-lg bg-slate-900 border border-slate-800 p-4">
                    <div className="text-xs text-slate-400 mb-1 flex items-center gap-2">
                        <Users className="h-3 w-3 text-blue-500" /> Staff Presence
                    </div>
                    <div className="text-xl font-bold text-white tracking-tight">
                        42<span className="text-slate-500 text-sm font-normal">/45</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-blue-500 h-full w-[93%] relative">
                            <span className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 animate-pulse"></span>
                        </div>
                    </div>
                </div>

                {/* KPI Card 3: Donut Chart Mock */}
                <div className="col-span-1 rounded-lg bg-slate-900 border border-slate-800 p-4 flex items-center justify-between">
                    <div>
                        <div className="text-xs text-slate-400 mb-1">Fee Collection</div>
                        <div className="text-lg font-bold text-white">84%</div>
                    </div>
                    <div className="h-10 w-10 rounded-full border-4 border-slate-800 border-t-green-500 border-r-green-500 rotate-45"></div>
                </div>

                {/* Main Chart Area */}
                <div className="col-span-3 h-40 bg-slate-900/50 rounded-lg border border-slate-800 mt-2 p-4 flex items-end justify-between gap-2">
                    {[35, 45, 30, 60, 75, 50, 65, 80, 55, 70, 90, 85].map((h, i) => (
                        <div key={i} className="w-full bg-blue-500/20 hover:bg-blue-500/40 transition-colors rounded-t-sm relative group" style={{ height: `${h}%` }}>
                            <div className="absolute top-0 w-full h-1 bg-blue-500/50"></div>
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-[10px] text-white px-2 py-1 rounded border border-white/10 whitespace-nowrap z-10">
                                Day {i + 1}: ₦{(h * 10000).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
