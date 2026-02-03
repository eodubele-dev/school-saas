"use client"

import { useState } from "react"
import { startTrip, updateManifestItemStatus } from "@/lib/actions/logistics"
import { Button } from "@/components/ui/button"
import { Bus, CheckCircle, MapPin, Navigation } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function ManifestClient({ manifest }: { manifest: any }) {
    const [status, setStatus] = useState(manifest.status)
    // Optimistic UI could be added here, but for simplicity we rely on revalidatePath in action
    const [loading, setLoading] = useState<string | null>(null) // itemId being updated

    const handleStart = async () => {
        setLoading('trip')
        await startTrip(manifest.id)
        setStatus('active')
        setLoading(null)
        toast.success("Trip Started! Drive safely. 🚌")
    }

    const handleAction = async (itemId: string, action: 'boarded' | 'dropped') => {
        setLoading(itemId)
        const res = await updateManifestItemStatus(itemId, action)
        if (res.success) {
            toast.success(action === 'boarded' ? "Student Boarded" : "Student Dropped")
        } else {
            toast.error("Failed to update status")
        }
        setLoading(null)
    }

    if (status === 'pending') {
        return (
            <div className="p-8 flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
                <div className="h-24 w-24 bg-slate-900 rounded-full flex items-center justify-center border border-white/10 animate-pulse">
                    <Bus className="h-10 w-10 text-slate-500" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">Ready to roll?</h3>
                    <p className="text-slate-400 text-sm">Start the trip to enable check-ins.</p>
                </div>
                <Button
                    size="lg"
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-14"
                    onClick={handleStart}
                    disabled={!!loading}
                >
                    <Navigation className="mr-2 h-5 w-5" /> START {manifest.direction === 'pickup' ? 'PICKUP' : 'DROPOFF'}
                </Button>
            </div>
        )
    }

    // Sort: Pending first, then Boarded, then Dropped
    const items = manifest.items?.sort((a: any, b: any) => {
        const order = { pending: 1, boarded: 2, dropped: 3, absent: 4 }
        return (order[a.status as keyof typeof order] || 0) - (order[b.status as keyof typeof order] || 0)
    }) || []

    return (
        <div className="p-4 space-y-3">
            {items.map((item: any) => {
                const isBoarded = item.status === 'boarded'
                const isDropped = item.status === 'dropped'
                const isPending = item.status === 'pending'
                const actionLoading = loading === item.id

                return (
                    <div
                        key={item.id}
                        className={cn(
                            "p-4 rounded-xl border transition-all duration-300",
                            isPending ? "bg-slate-900 border-white/10" :
                                isBoarded ? "bg-blue-500/10 border-blue-500/30" :
                                    "bg-emerald-500/5 border-emerald-500/20 opacity-75"
                        )}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="font-bold text-base">{item.student.first_name} {item.student.last_name}</h4>
                                <p className="text-xs text-slate-400 font-mono">{item.student.admission_number}</p>
                            </div>
                            <div className="text-xs font-mono opacity-50">
                                {item.status.toUpperCase()}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            {isPending && (
                                <Button
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 h-10 text-xs font-bold"
                                    onClick={() => handleAction(item.id, 'boarded')}
                                    disabled={!!loading}
                                >
                                    {actionLoading ? "..." : manifest.direction === 'pickup' ? "BOARD BUS" : "ON BOARD"}
                                </Button>
                            )}

                            {isBoarded && (
                                <Button
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 h-10 text-xs font-bold"
                                    onClick={() => handleAction(item.id, 'dropped')}
                                    disabled={!!loading}
                                >
                                    {actionLoading ? "..." : manifest.direction === 'pickup' ? "DROP AT SCHOOL" : "DROP HOME"}
                                </Button>
                            )}

                            {isDropped && (
                                <div className="flex-1 flex items-center justify-center gap-2 text-emerald-400 text-sm font-bold bg-emerald-500/10 rounded h-10">
                                    <CheckCircle className="h-4 w-4" /> COMPLETED
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}

            {items.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                    No students assigned to this route.
                </div>
            )}
        </div>
    )
}
