import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface RoleBadgeProps {
    role: string
}

export function RoleBadge({ role }: RoleBadgeProps) {
    const roleColors: Record<string, string> = {
        admin: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20",
        bursar: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20",
        teacher: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20",
        registrar: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20",
    }

    const defaultColor = "bg-slate-500/10 text-slate-500 hover:bg-slate-500/20 border-slate-500/20"

    return (
        <Badge
            variant="outline"
            className={cn("capitalize px-3 py-1 text-xs font-medium border", roleColors[role.toLowerCase()] || defaultColor)}
        >
            {role}
        </Badge>
    )
}
