"use client"

import { useState } from "react"
import { RoomVisualizer } from "@/components/hostel/room-visualizer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AllocationPage() {
    const [selectedBuilding, setSelectedBuilding] = useState("b1")

    // Mock Data (In real app, fetch via server action)
    const building = {
        id: "b1",
        name: "Murtala Hall (Boys)",
        rooms: [
            {
                id: "r1", name: "Room 101", capacity: 4,
                bunks: [
                    {
                        id: "bk1", label: "Top-Left", type: "top", is_serviceable: true,
                        student: { id: "s1", name: "David O.", class: "SS3 A" }
                    }, // Type casting fix needed in real code
                    { id: "bk2", label: "Bottom-Left", type: "bottom", is_serviceable: true, student: null },
                    { id: "bk3", label: "Top-Right", type: "top", is_serviceable: true, student: null },
                    { id: "bk4", label: "Bottom-Right", type: "bottom", is_serviceable: false, student: null },
                ]
            }
        ]
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-white/5">
                <div className="flex gap-4 items-center">
                    <h2 className="text-white font-bold">Select Hall:</h2>
                    <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                        <SelectTrigger className="w-[180px] bg-slate-950 border-white/10">
                            <SelectValue placeholder="Building" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="b1">Murtala Hall</SelectItem>
                            <SelectItem value="b2">Queen Amina</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="text-slate-400 text-sm">
                    Drag and drop functionality coming soon.
                </div>
            </div>

            <div className="grid gap-6">
                {/* Note: In real app, map through rooms */}
                {building.rooms.map(room => (
                    // @ts-ignore
                    <RoomVisualizer
                        key={room.id}
                        room={room}
                        onAllocate={(bunkId) => console.log("Allocate", bunkId)}
                        onVacate={(bunkId) => console.log("Vacate", bunkId)}
                    />
                ))}
            </div>
        </div>
    )
}
