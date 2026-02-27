import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto animate-pulse">
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

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-slate-900/50 border border-white/10 rounded-xl p-6 space-y-4">
                        <Skeleton className="h-6 w-3/4 bg-white/5" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full bg-white/5" />
                            <Skeleton className="h-4 w-full bg-white/5" />
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-2">
                            <Skeleton className="h-12 rounded bg-white/5" />
                            <Skeleton className="h-12 rounded bg-white/5" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
