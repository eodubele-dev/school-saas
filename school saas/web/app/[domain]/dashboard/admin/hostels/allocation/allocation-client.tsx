"use client"

import { useState } from "react"
import { RoomVisualizer } from "@/components/hostel/room-visualizer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { allocateStudent } from "@/lib/actions/hostel"
import { toast } from "sonner"
import { AllocationModal } from "./allocation-modal"

export function AllocationClient({ initialBuildings }: { initialBuildings: any[] }) {
    const [buildings, setBuildings] = useState(initialBuildings)
    const [selectedBuildingId, setSelectedBuildingId] = useState(initialBuildings[0]?.id || "")
    const [isAllocating, setIsAllocating] = useState(false)
    const [activeBunk, setActiveBunk] = useState<string | null>(null)

    const selectedBuilding = buildings.find(b => b.id === selectedBuildingId)

    const handleAllocate = (bunkId: string) => {
        setActiveBunk(bunkId)
        setIsAllocating(true)
    }

    const handleConfirmAllocation = async (studentId: string) => {
        if (!activeBunk) return

        const res = await allocateStudent(studentId, activeBunk, "1st Term", "2023/2024")
        if (res.success) {
            toast.success("Student allocated successfully")
            setIsAllocating(false)
            setActiveBunk(null)
            // Ideally we'd refresh the data here
            window.location.reload()
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
                        <SelectContent>
                            {buildings.map(b => (
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
                            onVacate={(bunkId) => console.log("Vacate", bunkId)}
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
        </div>
    )
}
