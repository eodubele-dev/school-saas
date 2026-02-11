"use client"

import { useState } from "react"
import { RoomVisualizer } from "@/components/hostel/room-visualizer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { allocateStudent, vacateStudent } from "@/lib/actions/hostel"
import { toast } from "sonner"
import { AllocationModal } from "./allocation-modal"
import { useRouter } from "next/navigation"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function AllocationClient({ initialBuildings, academicSettings }: {
    initialBuildings: any[],
    academicSettings: { session: string, term: string }
}) {
    const router = useRouter()
    const [selectedBuildingId, setSelectedBuildingId] = useState(initialBuildings[0]?.id || "")
    const [isAllocating, setIsAllocating] = useState(false)
    const [activeBunk, setActiveBunk] = useState<string | null>(null)
    const [bunkToVacate, setBunkToVacate] = useState<string | null>(null)

    const selectedBuilding = initialBuildings.find(b => b.id === selectedBuildingId)

    const handleAllocate = (bunkId: string) => {
        setActiveBunk(bunkId)
        setIsAllocating(true)
    }

    const handleVacate = (bunkId: string) => {
        setBunkToVacate(bunkId)
    }

    const confirmVacate = async () => {
        if (!bunkToVacate) return

        const res = await vacateStudent(bunkToVacate)
        setBunkToVacate(null)
        if (res.success) {
            toast.success("Student vacated successfully")
            router.refresh()
        } else {
            toast.error(res.error || "Failed to vacate student")
        }
    }

    const handleConfirmAllocation = async (studentId: string) => {
        if (!activeBunk) return

        const res = await allocateStudent(
            studentId,
            activeBunk,
            academicSettings.term,
            academicSettings.session
        )

        if (res.success) {
            toast.success("Student allocated successfully")
            setIsAllocating(false)
            setActiveBunk(null)
            router.refresh()
        } else {
            toast.error(res.error || "Failed to allocate student")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-white/5">
                <div className="flex gap-4 items-center">
                    <h2 className="text-white font-bold">Select Hall:</h2>
                    <Select value={selectedBuildingId} onValueChange={setSelectedBuildingId}>
                        <SelectTrigger className="w-[220px] bg-slate-950 border-white/10">
                            <SelectValue placeholder="Select a Hall" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-950 border-white/10 text-white">
                            {initialBuildings.map(b => (
                                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {selectedBuilding ? (
                <div className="grid gap-6">
                    {selectedBuilding.rooms?.map((room: any) => (
                        <RoomVisualizer
                            key={room.id}
                            room={room}
                            onAllocate={handleAllocate}
                            onVacate={handleVacate}
                        />
                    ))}
                </div>
            ) : (
                <div className="p-12 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-dashed border-white/10">
                    No building selected or found.
                </div>
            )}

            <AllocationModal
                isOpen={isAllocating}
                onClose={() => setIsAllocating(false)}
                onConfirm={handleConfirmAllocation}
            />

            <AlertDialog open={!!bunkToVacate} onOpenChange={(open) => !open && setBunkToVacate(null)}>
                <AlertDialogContent className="bg-slate-950 border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            This will remove the student from this bed space. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmVacate} className="bg-red-600 hover:bg-red-700 text-white">
                            Vacate Student
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
