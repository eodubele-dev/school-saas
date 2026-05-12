
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
    title: string
    value: React.ReactNode
    icon: LucideIcon
    description?: string
    trend?: {
        value: string
        positive: boolean
    }
    id?: string
    className?: string
    accentColor?: 'blue' | 'emerald' | 'rose' | 'amber' | 'purple' | 'cyan'
}

export function MetricCard({ title, value, icon: Icon, description, trend, id, className, accentColor = 'blue' }: MetricCardProps) {
    const colors = {
        blue: { 
            border: 'border-blue-500/20', 
            icon: 'text-blue-400', 
            orb: 'bg-blue-500/10 shadow-[inset_0_0_15px_rgba(59,130,246,0.3)]', 
            glow: 'from-blue-600/10 to-transparent',
            accent: 'text-blue-500/50'
        },
        emerald: { 
            border: 'border-emerald-500/20', 
            icon: 'text-emerald-400', 
            orb: 'bg-emerald-500/10 shadow-[inset_0_0_15px_rgba(16,185,129,0.3)]', 
            glow: 'from-emerald-600/10 to-transparent',
            accent: 'text-emerald-500/50'
        },
        rose: { 
            border: 'border-rose-500/20', 
            icon: 'text-rose-400', 
            orb: 'bg-rose-500/10 shadow-[inset_0_0_15px_rgba(244,63,94,0.3)]', 
            glow: 'from-rose-600/10 to-transparent',
            accent: 'text-rose-500/50'
        },
        amber: { 
            border: 'border-amber-500/20', 
            icon: 'text-amber-400', 
            orb: 'bg-amber-500/10 shadow-[inset_0_0_15px_rgba(245,158,11,0.3)]', 
            glow: 'from-amber-600/10 to-transparent',
            accent: 'text-amber-500/50'
        },
        purple: { 
            border: 'border-purple-500/20', 
            icon: 'text-purple-400', 
            orb: 'bg-purple-500/10 shadow-[inset_0_0_15px_rgba(168,85,247,0.3)]', 
            glow: 'from-purple-600/10 to-transparent',
            accent: 'text-purple-500/50'
        },
        cyan: { 
            border: 'border-cyan-500/20', 
            icon: 'text-cyan-400', 
            orb: 'bg-cyan-500/10 shadow-[inset_0_0_15px_rgba(6,182,212,0.3)]', 
            glow: 'from-cyan-600/10 to-transparent',
            accent: 'text-cyan-500/50'
        },
    }

    const theme = colors[accentColor] || colors.blue

    return (
        <Card id={id} className={cn(
            "relative group overflow-hidden bg-[#0a0f1e]/80 border-white/5 backdrop-blur-3xl transition-all duration-500 hover:border-white/10 hover:-translate-y-1 rounded-[2rem]", 
            className
        )}>
            {/* 🎨 Internal Radial Glow */}
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-20 transition-opacity group-hover:opacity-40", theme.glow)} />
            
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] font-mono">
                    {title}
                </CardTitle>
                <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6 border border-white/5 backdrop-blur-md", 
                    theme.orb, theme.icon
                )}>
                    <Icon className="h-6 w-6 transition-transform group-hover:scale-110" />
                </div>
            </CardHeader>

            <CardContent className="relative z-10">
                <div className="flex flex-col gap-1">
                    <div className="relative inline-block">
                        <span className="text-5xl font-black text-white tracking-tighter drop-shadow-lg">
                            {value}
                        </span>
                        {/* Decorative background number hint */}
                        <span className={cn("absolute -right-4 -bottom-4 text-6xl font-black opacity-[0.03] select-none pointer-events-none transition-transform group-hover:scale-110", theme.accent)}>
                            {String(value).slice(0, 1)}
                        </span>
                    </div>

                    {(description || trend) && (
                        <div className="flex items-center text-[10px] font-bold text-slate-400 gap-3 mt-4">
                            {trend && (
                                <span className={cn(
                                    "px-2 py-0.5 rounded-md border backdrop-blur-md transition-colors",
                                    trend.positive ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                )}>
                                    {trend.value}
                                </span>
                            )}
                            {description && <span className="uppercase tracking-[0.1em] text-slate-500/80">{description}</span>}
                        </div>
                    )}
                </div>
            </CardContent>
            
            {/* Corner Accent Detail */}
            <div className={cn("absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-white/5 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity")} />
        </Card>
    )
}
