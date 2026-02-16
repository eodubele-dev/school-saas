"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, UserCheck, UserX, Clock, AlertCircle } from "lucide-react"
import { getStaffAttendanceStats } from "@/lib/actions/admin-attendance"
import { LeaveRequestManager } from "./leave-request-manager"
import { format } from "date-fns"
import { toast } from "sonner"
import { SmartClockIn } from "@/components/attendance/smart-clock-in"
import { useRouter } from "next/navigation"

export function StaffAttendanceDashboard() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])

    useEffect(() => {
        loadStats(selectedDate)
    }, [selectedDate])

    const loadStats = async (date: string) => {
        setLoading(true)
        const res = await getStaffAttendanceStats(date)
        if (res.success && res.data) {
            setStats(res.data)
        } else {
            setError(res.error || "Failed to load stats")
            toast.error(res.error || "Failed to load stats")
        }
        setLoading(false)
    }

    if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-500" /></div>

    if (error) return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <div className="text-red-400">Failed to load statistics: {error}</div>
            <Button onClick={() => loadStats(selectedDate)} variant="outline" className="border-white/10">Retry</Button>
        </div>
    )

    if (!stats) return <div className="text-white p-4">No statistics available.</div>

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* 1. Header & Stats Cards */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Staff Attendance</h2>
                    <p className="text-slate-400">Monitor staff presence and punctuality.</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 border border-white/10 p-1 rounded-lg">
                    <div className="px-3 text-sm text-slate-400 font-medium">Date:</div>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-transparent text-white text-sm border-none focus:ring-0 cursor-pointer [&::-webkit-calendar-picker-indicator]:invert"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                    label="Total Staff"
                    value={stats.summary.total}
                    icon={UserCheck}
                    color="text-slate-400"
                    bg="bg-slate-800/50"
                />
                <StatsCard
                    label="Present"
                    value={stats.summary.present}
                    icon={UserCheck}
                    color="text-emerald-400"
                    bg="bg-emerald-500/10 border-emerald-500/20"
                />
                <StatsCard
                    label="Late Arrivals"
                    value={stats.summary.late}
                    icon={Clock}
                    color="text-amber-400"
                    bg="bg-amber-500/10 border-amber-500/20"
                />
                <StatsCard
                    label="Absent"
                    value={stats.summary.absent}
                    icon={UserX}
                    color="text-red-400"
                    bg="bg-red-500/10 border-red-500/20"
                />
            </div>

            {/* NEW: Smart Clock In for Admin/Staff */}
            <div className="mb-8">
                <SmartClockIn onClockIn={() => {
                    loadStats(selectedDate)
                    router.refresh()
                }} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2. Live Attendance Table */}
                <div className="lg:col-span-2">
                    <Card className="bg-slate-900 border-white/5 overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-white">Attendance Log</h3>
                                <p className="text-sm text-slate-500">{format(new Date(selectedDate), 'EEEE, MMMM do, yyyy')}</p>
                            </div>
                            <Badge variant="outline" className={`animate-pulse ${selectedDate === new Date().toISOString().split('T')[0] ? 'bg-green-500/20 text-green-400 border-green-500/40' : 'bg-slate-500/20 text-slate-400 border-slate-500/40'}`}>
                                {selectedDate === new Date().toISOString().split('T')[0] ? '● Live' : '○ History'}
                            </Badge>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-400 uppercase bg-slate-950/50">
                                    <tr>
                                        <th className="px-6 py-3">Staff Member</th>
                                        <th className="px-6 py-3">Role</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Time In</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {stats.list.map((staff: any) => (
                                        <tr key={staff.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4 flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={staff.photo_url} />
                                                    <AvatarFallback>{staff.first_name[0]}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium text-slate-200">{staff.first_name} {staff.last_name}</span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 capitalize">{staff.role}</td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={staff.status} />
                                            </td>
                                            <td className="px-6 py-4 font-mono text-slate-400">
                                                {staff.checkInTime ? staff.checkInTime.slice(0, 5) : '--:--'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* 3. Leave Manager - Sidebar */}
                <div className="lg:col-span-1">
                    <LeaveRequestManager />
                </div>
            </div>
        </div>
    )
}

interface StatsCardProps {
    label: string
    value: number | string
    icon: any
    color: string
    bg: string
}

function StatsCard({ label, value, icon: Icon, color, bg }: StatsCardProps) {
    return (
        <Card className={`p-4 border border-white/5 flex items-center justify-between ${bg}`}>
            <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">{label}</p>
                <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            </div>
            <div className={`p-2 rounded-full bg-white/5 ${color}`}>
                <Icon className="h-6 w-6" />
            </div>
        </Card>
    )
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'present') {
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Present</span>
    }
    if (status === 'late') {
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Late</span>
    }
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">Absent</span>
}
