"use client"

import { useState } from "react"
import { RollCallList } from "@/components/hostel/roll-call-list"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Calendar } from "lucide-react"

export default function NightCheckPage() {
    // Mock Data
    const [students, setStudents] = useState<any[]>([
        { id: "1", name: "Ahmed Musa", room: "Room 101", status: "present" },
        { id: "2", name: "Chinedu Eze", room: "Room 101", status: "present" },
        { id: "3", name: "Sarah Doe", room: "Room 102", status: "exeat" },
        { id: "4", name: "John Smith", room: "Room 103", status: "absent" },
    ])

    const handleStatusChange = (id: string, status: any) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s))
    }

    const handleSubmit = () => {
        const absentees = students.filter(s => s.status === 'absent')

        toast.success("Roll Call Submitted Successfully")

        if (absentees.length > 0) {
            toast.error(`ALERT: ${absentees.length} Students marked ABSENT! Notification sent to Proprietor.`)
        }
    }

    return (
        <div className="max-w-md mx-auto w-full space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Night Check</h2>
                <div className="flex items-center text-sm text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-white/5">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date().toLocaleDateString()}
                </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-4">
                <RollCallList students={students} onChange={handleStatusChange} />
            </div>

            <Button
                onClick={handleSubmit}
                className="w-full bg-[var(--school-accent)] hover:bg-blue-700 text-white font-bold h-12 text-lg shadow-[0_0_20px_rgba(37,99,235,0.3)]"
            >
                Submit Night Check
            </Button>
        </div>
    )
}
