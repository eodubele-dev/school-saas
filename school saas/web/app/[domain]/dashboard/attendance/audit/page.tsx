import { ParentAttendanceAudit } from "@/components/attendance/parent-attendance-audit-client"
import { getStudentAttendanceAudit } from "@/lib/actions/parent-portal"
import { getAuditStudents } from "@/lib/actions/admin-attendance-audit"
import { redirect } from "next/navigation"
import { StudentSearch } from "@/components/attendance/student-search"
import { StudentSelector } from "@/components/attendance/student-selector"

export default async function AttendanceAuditPage({
    searchParams
}: {
    searchParams: { studentId?: string }
}) {
    // 1. Get Accessible Students (Parents sees kids, Staff sees all)
    const students = await getAuditStudents()

    if (!students || students.length === 0) {
        return (
            <div className="p-8 text-center text-slate-500">
                <p>No students linked to your account.</p>
            </div>
        )
    }

    // 2. Determine Scope (Default to first or use searchParam)
    const selectedStudentId = searchParams.studentId || students[0].id
    const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0]

    // 3. Fetch Audit Logs
    const { success, data: logs, error } = await getStudentAttendanceAudit(selectedStudent.id)

    if (!success) {
        return (
            <div className="p-8 text-center text-red-500">
                <p>Error loading audit logs: {error}</p>
            </div>
        )
    }

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">Attendance Transparency</h1>
                <p className="text-slate-400 mt-2">Verify daily arrival times and geofence integrity.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <StudentSearch students={students} />
                </div>
                <div>
                    <StudentSelector students={students} />
                </div>
            </div>

            <ParentAttendanceAudit
                studentName={selectedStudent.full_name}
                auditLogs={logs || []}
            />
        </div>
    )
}
