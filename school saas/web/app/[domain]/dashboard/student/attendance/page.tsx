import { getStudentAttendanceHistory } from "@/lib/actions/student-attendance"
import { AttendanceCalendar } from "@/components/student/attendance/attendance-calendar"
import { ShieldCheck, Flame, Clock, CalendarDays, MapPin } from "lucide-react"

export default async function StudentAttendancePage() {
    const { history, stats } = await getStudentAttendanceHistory()

    const safeStats = stats || { present: 0, late: 0, absent: 0, excused: 0, streak: 0 }
    const safeHistory = history || []

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto min-h-screen bg-slate-950">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <ShieldCheck className="h-8 w-8 text-blue-500" />
                    Attendance Status
                </h1>
                <p className="text-slate-400">Track your punctuality and presence.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/50 border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center text-center group hover:bg-slate-900 transition-colors">
                    <div className="h-10 w-10 bg-amber-500/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Flame className="h-5 w-5 text-amber-500" />
                    </div>
                    <span className="text-3xl font-bold text-white">{safeStats.streak} Days</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Current Streak</span>
                </div>

                <div className="bg-slate-900/50 border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center text-center hover:bg-slate-900 transition-colors">
                    <div className="h-10 w-10 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3">
                        <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    </div>
                    <span className="text-3xl font-bold text-white">{safeStats.present}</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Present</span>
                </div>

                <div className="bg-slate-900/50 border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center text-center hover:bg-slate-900 transition-colors">
                    <div className="h-10 w-10 bg-amber-500/10 rounded-full flex items-center justify-center mb-3">
                        <Clock className="h-5 w-5 text-amber-500" />
                    </div>
                    <span className="text-3xl font-bold text-white">{safeStats.late}</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Late</span>
                </div>

                <div className="bg-slate-900/50 border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center text-center hover:bg-slate-900 transition-colors">
                    <div className="h-10 w-10 bg-red-500/10 rounded-full flex items-center justify-center mb-3">
                        <CalendarDays className="h-5 w-5 text-red-500" />
                    </div>
                    <span className="text-3xl font-bold text-white">{safeStats.absent}</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Absent</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <AttendanceCalendar history={safeHistory} />
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                    </div>

                    <div className="space-y-3">
                        {safeHistory.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">No records found.</div>
                        ) : (
                            safeHistory.slice(0, 5).map((record: any, i: number) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-slate-900/50">
                                    <div className={`h-2 w-2 rounded-full ${record.status === 'present' ? 'bg-emerald-500' :
                                        record.status === 'late' ? 'bg-amber-500' :
                                            record.status === 'absent' ? 'bg-red-500' : 'bg-blue-500'
                                        }`} />
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <p className="text-sm font-medium text-white capitalize">{record.status}</p>
                                            <span className="text-xs text-slate-500">{new Date(record.date).toLocaleDateString()}</span>
                                        </div>
                                        {record.remarks && (
                                            <p className="text-xs text-slate-400 mt-1 lines-clamp-1">{record.remarks}</p>
                                        )}
                                        {/* Mock Geofence Location for visuals */}
                                        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-600">
                                            <MapPin className="h-3 w-3" />
                                            Main Gate Scanner
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
