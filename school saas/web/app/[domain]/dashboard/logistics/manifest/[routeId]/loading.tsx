import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="min-h-screen bg-slate-950 p-8 space-y-8 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-64 bg-white/5" />
                    <Skeleton className="h-4 w-48 bg-white/5" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-xl bg-white/5" />
                ))}
            </div>

            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg bg-white/5" />
                ))}
            </div>
        </div>
    )
}
