
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
    title: string
    value: string | number
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
        blue: { border: 'bg-blue-500', icon: 'text-blue-400', iconBg: 'bg-blue-500/10', iconBorder: 'border-blue-500/20', glow: 'bg-blue-500/5' },
        emerald: { border: 'bg-emerald-500', icon: 'text-emerald-400', iconBg: 'bg-emerald-500/10', iconBorder: 'border-emerald-500/20', glow: 'bg-emerald-500/5' },
        rose: { border: 'bg-rose-500', icon: 'text-rose-400', iconBg: 'bg-rose-500/10', iconBorder: 'border-rose-500/20', glow: 'bg-rose-500/5' },
        amber: { border: 'bg-amber-500', icon: 'text-amber-400', iconBg: 'bg-amber-500/10', iconBorder: 'border-amber-500/20', glow: 'bg-amber-500/5' },
        purple: { border: 'bg-purple-500', icon: 'text-purple-400', iconBg: 'bg-purple-500/10', iconBorder: 'border-purple-500/20', glow: 'bg-purple-500/5' },
        cyan: { border: 'bg-cyan-500', icon: 'text-cyan-400', iconBg: 'bg-cyan-500/10', iconBorder: 'border-cyan-500/20', glow: 'bg-cyan-500/5' },
    }

    const theme = colors[accentColor] || colors.blue

    return (
        <Card id={id} className={cn("bg-[#0f172a]/80 border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-300 rounded-2xl pt-2", className)}>
            {/* 🌈 Thick Top Border Action */}
            <div className={cn("absolute top-0 left-0 right-0 h-1.5", theme.border)} />

            {/* Hover Glow Effect */}
            <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity opacity-0 group-hover:opacity-100", theme.glow)} />

            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {title}
                </CardTitle>
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 border", theme.iconBg, theme.icon, theme.iconBorder)}>
                    <Icon className="h-5 w-5" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-1">
                    <div className="text-4xl font-black text-white tracking-tighter">
                        {value}
                    </div>
                    {(description || trend) && (
                        <div className="flex items-center text-[10px] text-slate-500 gap-2 font-medium">
                            {trend && (
                                <span className={trend.positive ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                                    {trend.value}
                                </span>
                            )}
                            {description && <span className="uppercase tracking-wider opacity-60">{description}</span>}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
