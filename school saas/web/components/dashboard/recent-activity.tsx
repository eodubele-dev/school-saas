
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ActivityItem {
    type: string
    message: string
    time: string
}

interface RecentActivityProps {
    data?: ActivityItem[]
}

export function RecentActivity({ data }: RecentActivityProps) {
    const activities = data || []

    return (
        <Card className="bg-slate-900/50 border-white/5 backdrop-blur-xl shadow-lg h-full">
            <CardHeader>
                <CardTitle className="text-slate-400 font-medium text-sm">Recent System Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {activities.length > 0 ? (
                        activities.map((item, index) => (
                            <div key={index} className="flex items-center">
                                <Avatar className="h-9 w-9 bg-slate-800 border border-white/10">
                                    <AvatarFallback className="text-xs text-blue-400 font-bold bg-blue-500/10">
                                        {item.type.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none text-slate-200">{item.type}</p>
                                    <p className="text-xs text-slate-500">
                                        {item.message}
                                    </p>
                                </div>
                                <div className="ml-auto text-xs text-slate-400">
                                    {new Date(item.time).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-slate-500 text-center py-8">No recent activity recorded</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
