"use client"

import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle2, AlertTriangle, MessageSquare } from "lucide-react"

export function IncidentLog({ incidents }: { incidents: any[] }) {
    return (
        <Card className="p-6 bg-slate-900 border-white/5 h-full flex flex-col">
            <div className="mb-4">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-cyan-400" />
                    Remarks & Incidents
                </h3>
                <p className="text-sm text-slate-400">Timeline of reports and notes.</p>
            </div>

            <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4 relative border-l border-white/10 ml-2 pl-6 py-2">
                    {incidents.map((incident, idx) => (
                        <div key={idx} className="relative">
                            {/* Dot */}
                            <div className={`absolute -left-[29px] top-1 h-3 w-3 rounded-full border-2 border-slate-900 ${incident.type === 'positive' ? 'bg-cyan-500' :
                                    incident.type === 'disciplinary' ? 'bg-amber-500' : 'bg-slate-500'
                                }`} />

                            <div className={`p-3 rounded-lg border border-white/5 ${incident.type === 'positive' ? 'bg-cyan-500/5' :
                                    incident.type === 'disciplinary' ? 'bg-amber-500/5' : 'bg-slate-950'
                                }`}>
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className={`text-sm font-bold ${incident.type === 'positive' ? 'text-cyan-400' :
                                            incident.type === 'disciplinary' ? 'text-amber-400' : 'text-white'
                                        }`}>
                                        {incident.title}
                                    </h4>
                                    <span className="text-[10px] text-slate-500 whitespace-nowrap">{new Date(incident.occurred_at).toLocaleDateString()}</span>
                                </div>
                                {incident.description && <p className="text-xs text-slate-400">{incident.description}</p>}
                            </div>
                        </div>
                    ))}

                    {incidents.length === 0 && (
                        <p className="text-sm text-slate-500 italic">No remarks recorded yet.</p>
                    )}
                </div>
            </ScrollArea>
        </Card>
    )
}
