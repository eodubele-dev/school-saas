'use client'

import { Card } from "@/components/ui/card"
import { DollarSign, ShieldAlert, GraduationCap, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function LivePulse({ logs }: { logs: any[] }) {
    return (
        <Card className="bg-slate-900 border-white/10 p-4 space-y-4">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Pulse
            </h3>

            <div className="space-y-4">
                {logs.length === 0 ? (
                    <div className="text-xs text-slate-500 italic">No critical events today.</div>
                ) : logs.map((log) => (
                    <div key={log.id} className="relative pl-4 border-l border-white/10">
                        <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-slate-900 border border-slate-700" />
                        <div className="space-y-1">
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-medium text-slate-300">{log.action}</span>
                                <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                                    <Clock className="h-2 w-2" />
                                    {formatDistanceToNow(new Date(log.created_at))}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2">
                                {log.details}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                                {log.category === 'Financial' && <DollarSign className="h-3 w-3 text-emerald-500" />}
                                {log.category === 'Security' && <ShieldAlert className="h-3 w-3 text-red-500" />}
                                {log.category === 'Academic' && <GraduationCap className="h-3 w-3 text-blue-500" />}
                                <span className="text-[10px] text-slate-600 uppercase">{log.actor_name}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    )
}
