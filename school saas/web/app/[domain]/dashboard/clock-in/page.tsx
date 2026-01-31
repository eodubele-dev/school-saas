import { StaffClockIn } from "@/components/geofencing/staff-clock-in"

export default function ClockInPage() {
    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Staff Attendance</h1>
                <p className="text-muted-foreground">
                    Clock in securely when you are within the school premises.
                </p>
            </div>

            <StaffClockIn />
        </div>
    )
}
