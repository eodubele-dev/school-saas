"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, UserCheck, UserX, Clock, AlertCircle } from "lucide-react"
import { getStaffAttendanceStats } from "@/lib/actions/admin-attendance"
import { Input } from "@/components/ui/input"
import { LeaveRequestManager } from "./leave-request-manager"
import { format } from "date-fns"
import { toast } from "sonner"
import { SmartClockIn } from "@/components/attendance/smart-clock-in"
import { useRouter } from "next/navigation"
import { isDesktop } from "@/lib/utils/desktop"
import { printDirectly } from "@/lib/utils/printer"
import { Printer } from "lucide-react"

export function StaffAttendanceDashboard() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
    
    // Pagination & Search state
    const [currentPage, setCurrentPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")

    // Simple debounce for search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery)
            setCurrentPage(1) // Reset to page 1 on new search
        }, 500)
        return () => clearTimeout(timer)
    }, [searchQuery])

    useEffect(() => {
        loadStats(selectedDate, currentPage, debouncedSearch)
    }, [selectedDate, currentPage, debouncedSearch])

    const loadStats = async (date: string, page = 1, search = "") => {
        setLoading(true)
        const res = await getStaffAttendanceStats(date, page, 20, search)
        if (res.success && res.data) {
            setStats(res.data)
        } else {
            setError(res.error || "Failed to load stats")
            toast.error(res.error || "Failed to load stats")
        }
        setLoading(false)
    }

    const handlePrintLog = async () => {
        const logTable = document.getElementById('attendance-log-table');
        if (!logTable) return;

        const htmlContent = `
            <html>
                <head>
                    <title>Attendance_Log_${selectedDate}</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                        th { bg-color: #f4f4f4; }
                        h1 { text-align: center; }
                    </style>
                </head>
                <body>
                    <h1>Staff Attendance Log - ${format(new Date(selectedDate), 'PPPP')}</h1>
                    ${logTable.innerHTML}
                </body>
            </html>
        `;

        if (isDesktop()) {
            await printDirectly(htmlContent, { silent: true, jobName: `Attendance_Log_${selectedDate}` });
            toast.success("Attendance Log sent to printer! 🤙🏾📠");
        } else {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(htmlContent);
                printWindow.document.close();
                printWindow.print();
            }
        }
    }

    if (loading && !stats) return <div className="h-96 flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-blue-500" /></div>

    if (error && !stats) return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <div className="text-red-400">Failed to load statistics: {error}</div>
            <Button onClick={() => loadStats(selectedDate, currentPage, debouncedSearch)} variant="outline" className="border-border">Retry</Button>
        </div>
    )

    if (!stats) return <div className="text-foreground p-4">No statistics available.</div>

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* 1. Header & Stats Cards */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">Staff Attendance</h2>
                    <p className="text-muted-foreground">Monitor staff presence and punctuality.</p>
                </div>
                <div className="flex items-center gap-2 bg-card text-card-foreground border border-border p-1 rounded-lg">
                    <div className="px-3 text-sm text-muted-foreground font-medium">Date:</div>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                            setSelectedDate(e.target.value)
                            setCurrentPage(1)
                        }}
                        className="bg-transparent text-foreground text-sm border-none focus:ring-0 cursor-pointer [&::-webkit-calendar-picker-indicator]:invert"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                    label="Total Staff"
                    value={stats.summary.total}
                    icon={UserCheck}
                    color="text-muted-foreground"
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
                    loadStats(selectedDate, currentPage, debouncedSearch)
                    router.refresh()
                }} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2. Live Attendance Table */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="bg-card text-card-foreground border-border/50 overflow-hidden">
                        <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Attendance Log</h3>
                                <p className="text-sm text-muted-foreground">{format(new Date(selectedDate), 'EEEE, MMMM do, yyyy')}</p>
                            </div>
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <Input 
                                    placeholder="Search staff..." 
                                    className="bg-slate-900 border-border max-w-[200px]"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Badge variant="outline" className={`animate-pulse whitespace-nowrap ${selectedDate === new Date().toISOString().split('T')[0] ? 'bg-green-500/20 text-green-400 border-green-500/40' : 'bg-slate-500/20 text-muted-foreground border-slate-500/40'}`}>
                                    {selectedDate === new Date().toISOString().split('T')[0] ? '● Live' : '○ History'}
                                </Badge>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="border-border hover:bg-slate-800 text-foreground hidden sm:flex"
                                    onClick={handlePrintLog}
                                >
                                    <Printer className="h-4 w-4 mr-2" />
                                    Print Log
                                </Button>
                            </div>
                        </div>

                        <div className="overflow-x-auto" id="attendance-log-table">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase bg-slate-950/50">
                                    <tr>
                                        <th className="px-6 py-3">Staff Member</th>
                                        <th className="px-6 py-3">Role</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Time In</th>
                                        <th className="px-6 py-3">Time Out</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {stats.list.length > 0 ? (
                                        stats.list.map((staff: any) => (
                                            <tr key={staff.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={staff.photo_url} />
                                                        <AvatarFallback>{staff.first_name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium text-slate-200">{staff.first_name} {staff.last_name}</span>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground capitalize">{staff.role}</td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={staff.status} />
                                                </td>
                                                <td className="px-6 py-4 font-mono text-muted-foreground">
                                                    <span className="text-[10px] text-emerald-500/70 block uppercase leading-none mb-1">In</span>
                                                    {staff.checkInTime ? staff.checkInTime.slice(0, 5) : '--:--'}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-muted-foreground">
                                                    <span className="text-[10px] text-orange-500/70 block uppercase leading-none mb-1">Out</span>
                                                    {staff.checkOutTime ? staff.checkOutTime.slice(0, 5) : '--:--'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground italic">
                                                {loading ? 'Fetching records...' : 'No staff records found matching your criteria.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Pagination Controls */}
                    {stats.pagination && stats.pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between px-2">
                            <p className="text-xs text-muted-foreground">
                                Showing <span className="text-foreground font-medium">{stats.list.length}</span> of <span className="text-foreground font-medium">{stats.pagination.totalCount}</span> staff members
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1 || loading}
                                    className="h-8 border-border"
                                >
                                    Previous
                                </Button>
                                <div className="text-xs text-muted-foreground px-2">
                                    Page {currentPage} of {stats.pagination.totalPages}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(stats.pagination.totalPages, p + 1))}
                                    disabled={currentPage === stats.pagination.totalPages || loading}
                                    className="h-8 border-border"
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
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
        <Card className={`p-4 border border-border/50 flex items-center justify-between ${bg}`}>
            <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">{label}</p>
                <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            </div>
            <div className={`p-2 rounded-full bg-secondary/50 ${color}`}>
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
