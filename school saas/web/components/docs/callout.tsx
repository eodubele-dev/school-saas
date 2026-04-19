import { Info, AlertTriangle, ShieldCheck, HelpCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface CalloutProps {
    children: React.ReactNode
    type?: 'note' | 'tip' | 'important' | 'warning' | 'caution' | 'security'
    title?: string
}

const config = {
    note: {
        icon: Info,
        border: "border-blue-500/20",
        bg: "bg-blue-500/5",
        text: "text-blue-400",
        title: "NOTE"
    },
    tip: {
        icon: HelpCircle,
        border: "border-emerald-500/20",
        bg: "bg-emerald-500/5",
        text: "text-emerald-400",
        title: "PRO TIP"
    },
    important: {
        icon: AlertCircle,
        border: "border-purple-500/20",
        bg: "bg-purple-500/5",
        text: "text-purple-400",
        title: "IMPORTANT"
    },
    warning: {
        icon: AlertTriangle,
        border: "border-amber-500/20",
        bg: "bg-amber-500/5",
        text: "text-amber-400",
        title: "WARNING"
    },
    caution: {
        icon: AlertCircle,
        border: "border-red-500/20",
        bg: "bg-red-500/5",
        text: "text-red-400",
        title: "CAUTION"
    },
    security: {
        icon: ShieldCheck,
        border: "border-cyan-500/20",
        bg: "bg-cyan-500/5",
        text: "text-cyan-400",
        title: "SECURITY PROTOCOL"
    }
}

export function Callout({ children, type = 'note', title }: CalloutProps) {
    const Icon = config[type].icon
    
    return (
        <div className={cn(
            "my-8 p-5 rounded-2xl border flex gap-4 animate-in fade-in slide-in-from-left-2 duration-500",
            config[type].border,
            config[type].bg
        )}>
            <div className={cn("mt-1", config[type].text)}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <div className={cn(
                    "text-[10px] font-mono font-black tracking-widest uppercase mb-2",
                    config[type].text
                )}>
                    {title || config[type].title}
                </div>
                <div className="text-sm text-slate-300 leading-relaxed prose prose-invert prose-sm max-w-none">
                    {children}
                </div>
            </div>
        </div>
    )
}
