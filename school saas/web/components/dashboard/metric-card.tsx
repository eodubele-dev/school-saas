
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
}

export function MetricCard({ title, value, icon: Icon, description, trend, id, className }: MetricCardProps) {
    return (
        <Card id={id} className={cn("bg-slate-900/90 border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group hover:border-cyan-500/40 transition-all duration-300", className)}>
            {/* Hover Glow Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity opacity-0 group-hover:opacity-100" />

            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-400">
                    {title}
                </CardTitle>
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:text-cyan-300 group-hover:scale-110 transition-all duration-300">
                    <Icon className="h-5 w-5" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-1">
                    <div className="text-2xl font-bold text-white tracking-tight">
                        {value}
                    </div>
                    {(description || trend) && (
                        <div className="flex items-center text-xs text-slate-500 gap-2">
                            {trend && (
                                <span className={trend.positive ? "text-cyan-400 font-semibold" : "text-amber-400 font-semibold"}>
                                    {trend.value}
                                </span>
                            )}
                            {description && <span>{description}</span>}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
