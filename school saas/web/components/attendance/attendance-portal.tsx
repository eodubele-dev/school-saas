"use client"

import { useState } from "react"
import { SmartClockIn } from "./smart-clock-in"
import { PremiumStudentRegister } from "./premium-student-register"
import { AttendanceHistory } from "./attendance-history"

export function AttendancePortal() {
    const [refreshKey, setRefreshKey] = useState(0)

    const handleClockInSuccess = () => {
        setRefreshKey(prev => prev + 1)
    }

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto animate-in fade-in duration-700 pb-24">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Left Column: Clock In & Students */}
                <div className="flex-1 space-y-6">
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                            <span className="bg-[hsl(var(--school-accent))] w-1 h-6 rounded-full block"></span>
                            Staff Clock-In
                        </h2>
                        <SmartClockIn onClockIn={handleClockInSuccess} />
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                            <span className="bg-[hsl(var(--school-accent))] w-1 h-6 rounded-full block"></span>
                            Student Register
                        </h2>
                        <PremiumStudentRegister key={refreshKey} />
                    </section>
                </div>

                {/* Right Column: History (Sidebar on desktop, stacked on mobile) */}
                <div className="w-full md:w-80 space-y-6">
                    <section>
                        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                            <span className="bg-[hsl(var(--school-accent))] w-1 h-6 rounded-full block"></span>
                            Attendance History
                        </h2>
                        <AttendanceHistory />
                    </section>
                </div>
            </div>
        </div>
    )
}
