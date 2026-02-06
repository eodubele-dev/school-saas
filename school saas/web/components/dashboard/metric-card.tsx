
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
        <Card id={id} className={cn("bg-[#0f172a]/80 border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden group hover:border-blue-500/40 transition-all duration-300 rounded-2xl", className)}>
            {/* Hover Glow Effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity opacity-0 group-hover:opacity-100" />

            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {title}
                </CardTitle>
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:text-blue-300 group-hover:scale-110 transition-all duration-300 border border-blue-500/20">
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
                                <span className={trend.positive ? "text-blue-400 font-bold" : "text-amber-400 font-bold"}>
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
