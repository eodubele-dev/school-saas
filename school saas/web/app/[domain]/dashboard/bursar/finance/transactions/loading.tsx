import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
    return (
        <div className="bg-slate-950 p-6 min-h-screen space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48 bg-white/5" />
                    <Skeleton className="h-4 w-64 bg-white/5" />
                </div>
            </div>

            <Card className="bg-slate-900 border-white/10">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-6 w-32 bg-white/5" />
                        <Skeleton className="h-10 w-64 bg-white/5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(10)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full bg-white/5" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
