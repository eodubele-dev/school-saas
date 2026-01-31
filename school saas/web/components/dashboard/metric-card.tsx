
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface MetricCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    description?: string
    trend?: {
        value: string
        positive: boolean
    }
}

export function MetricCard({ title, value, icon: Icon, description, trend }: MetricCardProps) {
    return (
        <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl shadow-lg relative overflow-hidden group hover:border-blue-500/20 transition-all duration-300">
            {/* Hover Glow Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity opacity-0 group-hover:opacity-100" />

            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-slate-400">
                    {title}
                </CardTitle>
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:text-blue-300 group-hover:scale-110 transition-all duration-300">
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
                                <span className={trend.positive ? "text-emerald-400" : "text-rose-400"}>
                                    {trend.positive ? "+" : ""}{trend.value}
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
