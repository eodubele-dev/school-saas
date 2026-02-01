
import { StaffAttendanceDashboard } from "@/components/admin/attendance/staff-attendance-dashboard"

export default function AdminStaffAttendancePage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="bg-blue-600 w-1 h-8 rounded-full block"></span>
                Staff Attendance & Leave Management
            </h1>
            <StaffAttendanceDashboard />
        </div>
    )
}
