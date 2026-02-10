"use client"

import { useState } from "react"
import { RollCallList } from "@/components/hostel/roll-call-list"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Calendar, Building } from "lucide-react"
import { submitRollCall } from "@/lib/actions/hostel"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function NightCheckClient({ initialBuildings }: { initialBuildings: any[] }) {
    const [buildings] = useState(initialBuildings)
    const [selectedBuildingId, setSelectedBuildingId] = useState(initialBuildings[0]?.id || "")
    const [students, setStudents] = useState<any[]>([])

    // Update students when building changes
    const handleBuildingChange = (id: string) => {
        setSelectedBuildingId(id)
        const b = buildings.find(b => b.id === id)
        const hostelStudents: any[] = []

        b?.rooms?.forEach((r: any) => {
            r.bunks?.forEach((bk: any) => {
                if (bk.student) {
                    hostelStudents.push({
                        id: bk.student.id,
                        name: bk.student.name,
                        room: r.name,
                        status: 'present'
                    })
                }
            })
        })
        setStudents(hostelStudents)
    }

    // Initialize students for first building
    if (students.length === 0 && selectedBuildingId) {
        handleBuildingChange(selectedBuildingId)
    }

    const handleStatusChange = (id: string, status: any) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s))
    }

    const handleSubmit = async () => {
        if (!selectedBuildingId) return

        const res = await submitRollCall({
            buildingId: selectedBuildingId,
            rollCallDate: new Date(),
            entries: students.map(s => ({ studentId: s.id, status: s.status }))
        })

        if (res.success) {
            const absentees = students.filter(s => s.status === 'absent')
            toast.success("Roll Call Submitted Successfully")
            if (absentees.length > 0) {
                toast.error(`ALERT: ${absentees.length} Students marked ABSENT! Notification sent.`)
            }
        } else {
            toast.error(res.error || "Failed to submit roll call")
        }
    }

    return (
        <div className="max-w-md mx-auto w-full space-y-6">
            <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Night Check</h2>
                    <div className="flex items-center text-sm text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-white/5">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date().toLocaleDateString()}
                    </div>
                </div>

                <div className="flex gap-2 items-center bg-slate-900 p-2 rounded-lg border border-white/5">
                    <Building className="h-4 w-4 text-slate-500 ml-2" />
                    <Select value={selectedBuildingId} onValueChange={handleBuildingChange}>
                        <SelectTrigger className="flex-1 bg-transparent border-none text-white focus:ring-0">
                            <SelectValue placeholder="Select Hall" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                            {buildings.map(b => (
                                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-4">
                {students.length > 0 ? (
                    <RollCallList students={students} onChange={handleStatusChange} />
                ) : (
                    <div className="py-12 text-center text-slate-500">
                        No students allocated to this building.
                    </div>
                )}
            </div>

            <Button
                onClick={handleSubmit}
                disabled={students.length === 0}
                className="w-full bg-[var(--school-accent)] hover:bg-blue-700 text-white font-bold h-12 text-lg shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50 disabled:shadow-none"
            >
                Submit Night Check
            </Button>
        </div>
    )
}
