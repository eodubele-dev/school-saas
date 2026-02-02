'use client'

import { AuditLog } from "@/lib/actions/audit"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ShieldAlert, FileText, GraduationCap, Server, DollarSign, AlertTriangle, ArrowRight } from "lucide-react"
import { format } from "date-fns"

interface AuditItemProps {
    log: AuditLog
}

export function AuditItem({ log }: AuditItemProps) {
    // Red Flag Logic: Financial deletions or modifications, or Security alerts
    const isRedFlag =
        (log.category === 'Financial' && (log.action === 'DELETE' || log.action === 'UPDATE')) ||
        (log.category === 'Security' && log.action.includes('FAILED')) ||
        (log.category === 'Academic' && log.details.includes('Grade Changed'))

    const getIcon = () => {
        switch (log.category) {
            case 'Financial': return <DollarSign className={`h-4 w-4 ${isRedFlag ? 'text-red-500' : 'text-emerald-400'}`} />
            case 'Academic': return <GraduationCap className="h-4 w-4 text-blue-400" />
            case 'Security': return <ShieldAlert className="h-4 w-4 text-amber-500" />
            default: return <Server className="h-4 w-4 text-slate-400" />
        }
    }

    return (
        <Card className={`
            p-4 border bg-black/40 backdrop-blur-sm transition-all hover:bg-black/60
            ${isRedFlag ? 'border-red-500/30 shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)]' : 'border-slate-800'}
        `}>
            {/* Header Row */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className={`
                        mt-1 p-2 rounded-full border
                        ${isRedFlag ? 'bg-red-500/10 border-red-500/20' : 'bg-slate-900 border-slate-800'}
                    `}>
                        {getIcon()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-slate-300">
                                <span className={isRedFlag ? 'text-red-400 font-bold' : 'text-white font-medium'}>
                                    {log.actor_name}
                                </span>
                                <span className="mx-1 text-slate-600">/</span>
                                <span className="text-xs text-slate-500 uppercase">{log.actor_role}</span>
                            </span>
                            <Badge variant="outline" className={`
                                text-[10px] h-5 border-slate-700
                                ${log.action === 'DELETE' ? 'text-red-400 bg-red-500/5' : 'text-slate-400 bg-slate-800/50'}
                            `}>
                                {log.action}
                            </Badge>
                        </div>
                        <p className="text-slate-400 text-sm mt-1 leading-relaxed max-w-2xl font-mono">
                            {log.details}
                        </p>

                        {/* Grade Change Visualization */}
                        {log.old_values && log.new_values && log.entity_type === 'grade' && (
                            <div className="mt-3 flex items-center gap-3 text-xs font-mono bg-slate-950/50 p-2 rounded border border-slate-800 w-fit">
                                <div className="text-slate-500">
                                    Old Score: <span className="text-slate-300">{log.old_values.score || 'N/A'}</span>
                                </div>
                                <ArrowRight className="h-3 w-3 text-slate-600" />
                                <div className="text-amber-400 font-bold">
                                    New Score: {log.new_values.score || 'N/A'}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Metadata Column */}
                <div className="text-right shrink-0">
                    <div className="text-xs font-mono text-slate-500">
                        {format(new Date(log.created_at), "MMM d, HH:mm:ss")}
                    </div>
                    {isRedFlag && (
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-500 animate-pulse">
                            <AlertTriangle className="h-3 w-3" />
                            HIGH PRIORITY
                        </div>
                    )}
                    <div className="mt-2 text-[10px] text-slate-600 font-mono">
                        {log.metadata?.ip || 'Unknown IP'} <br />
                        {log.metadata?.user_agent?.split('(')[0]?.substring(0, 15) || 'Device N/A'}
                    </div>
                </div>
            </div>
        </Card>
    )
}
