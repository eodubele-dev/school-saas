"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Users,
    Building2,
    TrendingUp,
    ShieldAlert,
    Activity,
    Search,
    MoreHorizontal,
    Server,
    Globe,
    AlertTriangle,
    Database,
    Zap,
    MessageSquare,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight,
    Calendar,
    Sliders,
    Ban,
    CheckCircle
} from "lucide-react"
import { getAdminStats, getAllTenants, getRevenueStats, toggleTenantActiveStatus } from "@/lib/actions/admin"
import { AdminSmsAdjustModal } from "@/components/admin/sms-adjust-modal"
import { AdminProvisionModal } from "@/components/admin/provision-modal"
import { toast } from "sonner"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts'

export default function SuperAdminDashboard() {
    const [searchTerm, setSearchTerm] = useState("")
    const [stats, setStats] = useState<any>(null)
    const [tenants, setTenants] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    
    // Pagination State
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalTenants, setTotalTenants] = useState(0)

    // Chart State
    const [revenueData, setRevenueData] = useState<any[]>([])
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
    const [loadingChart, setLoadingChart] = useState(true)

    // Modals State
    const [adjustModalOpen, setAdjustModalOpen] = useState(false)
    const [selectedTenant, setSelectedTenant] = useState<any>(null)
    const [provisionModalOpen, setProvisionModalOpen] = useState(false)
    
    // Suspension State
    const [suspendDialogOpen, setSuspendDialogOpen] = useState(false)
    const [tenantToToggle, setTenantToToggle] = useState<any>(null)
    const [togglingStatus, setTogglingStatus] = useState(false)

    const fetchData = async (targetPage = page) => {
        setRefreshing(true)
        try {
            const [statsRes, tenantsRes] = await Promise.all([
                getAdminStats(),
                getAllTenants(targetPage, 10)
            ])
            
            if (statsRes.success) setStats(statsRes)
            if (tenantsRes.success) {
                setTenants(tenantsRes.data || [])
                setTotalPages(tenantsRes.totalPages || 1)
                setTotalTenants(tenantsRes.count || 0)
            }
        } catch (error) {
            toast.error("Failed to sync platform data")
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const fetchChartData = async () => {
        setLoadingChart(true)
        try {
            const res = await getRevenueStats(timeRange)
            if (res.success) setRevenueData(res.data)
        } finally {
            setLoadingChart(false)
        }
    }

    const handleToggleStatus = async () => {
        if (!tenantToToggle) return
        const targetId = tenantToToggle.id
        const newStatus = !tenantToToggle.is_active
        
        // Optimistic Update
        setTenants(prev => prev.map(t => t.id === targetId ? { ...t, is_active: newStatus } : t))
        
        setTogglingStatus(true)
        try {
            const res = await toggleTenantActiveStatus(targetId, tenantToToggle.is_active)
            if (res.success) {
                const finalStatus = res.newStatus
                // Update local state precisely
                setTenants(prev => prev.map(t => t.id === targetId ? { ...t, is_active: finalStatus } : t))
                toast.success(`School ${finalStatus ? 'activated' : 'suspended'} successfully`)
                await fetchData(page)
            } else {
                // Revert on error
                setTenants(prev => prev.map(t => t.id === targetId ? { ...t, is_active: !newStatus } : t))
                toast.error(res.error || "Action failed")
            }
        } catch (err) {
            // Revert on error
            setTenants(prev => prev.map(t => t.id === targetId ? { ...t, is_active: !newStatus } : t))
            toast.error("An unexpected error occurred")
        } finally {
            setTogglingStatus(false)
            setSuspendDialogOpen(false)
            setTenantToToggle(null)
        }
    }

    useEffect(() => {
        fetchData(page)
    }, [page])

    useEffect(() => {
        fetchChartData()
    }, [timeRange])

    const filteredTenants = tenants.filter(t => 
        t.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const metrics = [
        { title: "Total Schools", value: stats?.schoolCount || "0", change: "Registered Tenants", icon: Building2, color: "text-blue-400", border: "border-t-blue-500" },
        { title: "Global SMS Balance", value: (stats?.totalSmsBalance || 0).toLocaleString(), change: "Units across nodes", icon: MessageSquare, color: "text-cyan-400", border: "border-t-cyan-500" },
        { title: "Recent Activity", value: stats?.recentTrxCount || "0", change: "Transactions (24h)", icon: TrendingUp, color: "text-emerald-400", border: "border-t-emerald-500" },
        { title: "Platform Integrity", value: "99.9%", change: "All Systems Operational", icon: ShieldAlert, color: "text-purple-400", border: "border-t-purple-500" },
    ]

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-100">
            {/* Top Navigation Bar */}
            <header className="border-b border-white/5 bg-[#0A0A0B]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="font-bold text-2xl tracking-tight text-slate-100">Super-Admin <span className="text-slate-500 font-normal">Console</span></span>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-mono text-slate-400">
                        <button 
                            onClick={() => fetchData(page)} 
                            disabled={refreshing}
                            className="flex items-center gap-2 hover:text-white transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            {refreshing ? 'SYNCING...' : 'SYNC_PLATFORM'}
                        </button>
                        <div className="px-3 py-1 rounded bg-white/5 border border-white/5">v4.2.0-PROD</div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8 space-y-8">

                {/* 1. Business Pulse Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {metrics.map((metric, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`p-6 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group ${metric.border} border-t-4`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2 rounded-lg bg-white/5 ${metric.color}`}>
                                    <metric.icon className="w-5 h-5" />
                                </div>
                                <Activity className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                            </div>
                            <div className="text-2xl font-bold mb-1">{metric.value}</div>
                            <div className="text-xs text-slate-400">{metric.title}</div>
                            <div className="mt-3 text-xs font-mono text-slate-500 flex items-center gap-1">
                                {metric.change}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* 2. Tenant Management (Main Column) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-slate-400" />
                                Registered Schools
                                <span className="text-xs font-mono text-slate-500 font-normal ml-2">({totalTenants} total)</span>
                            </h2>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setProvisionModalOpen(true)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all flex items-center gap-2 group"
                                >
                                    <Database className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    Provision New School
                                </button>
                            </div>
                        </div>

                        {/* Search & Filter */}
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search by school name, slug, or tenant ID..."
                                className="w-full bg-[#0F1115] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Tenant Table */}
                        <div className="bg-[#0F1115] border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white/5 text-slate-400 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">School Name</th>
                                        <th className="px-6 py-4">Context (Slug)</th>
                                        <th className="px-6 py-4">SMS Balance</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    <AnimatePresence mode="wait">
                                        {loading ? (
                                            <tr key="loading">
                                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                                                    Hydrating platform state...
                                                </td>
                                            </tr>
                                        ) : filteredTenants.length > 0 ? (
                                            filteredTenants.map((tenant) => (
                                                <motion.tr 
                                                    key={tenant.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="hover:bg-white/[0.02] transition-colors"
                                                >
                                                    <td className="px-6 py-4 font-medium text-white">{tenant.name}</td>
                                                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{tenant.slug}.eduflow.ng</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${tenant.sms_balance < 500 ? 'text-amber-500 bg-amber-500/10 border border-amber-500/20' : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'}`}>
                                                            {tenant.sms_balance?.toLocaleString() || 0} Units
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Switch 
                                                                key={`${tenant.id}-${tenant.is_active}`}
                                                                checked={!!tenant.is_active} 
                                                                onCheckedChange={() => {
                                                                    setTenantToToggle(tenant)
                                                                    setSuspendDialogOpen(true)
                                                                }}
                                                                className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-700"
                                                            />
                                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${tenant.is_active ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                {tenant.is_active ? 'Active' : 'Suspended'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 bg-[#0F1115] border border-white/10 text-slate-200">
                                                            <DropdownMenuItem 
                                                                onSelect={() => {
                                                                    setSelectedTenant(tenant)
                                                                    setAdjustModalOpen(true)
                                                                }}
                                                                className="flex items-center gap-2 cursor-pointer focus:bg-white/5 focus:text-blue-400"
                                                            >
                                                                <Zap className="w-3.5 h-3.5" /> Adjust SMS Balance
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onSelect={() => window.open(`https://${tenant.slug}.eduflow.ng`, '_blank')}
                                                                className="flex items-center gap-2 cursor-pointer focus:bg-white/5 focus:text-emerald-400"
                                                            >
                                                                <ArrowUpRight className="w-3.5 h-3.5" /> Visit Dashboard
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="bg-white/5" />
                                                            <DropdownMenuItem className="text-slate-500 focus:bg-white/5 cursor-not-allowed">
                                                                <ShieldAlert className="w-3.5 h-3.5" /> Forensic Logs
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                                </motion.tr>
                                            ))
                                        ) : (
                                            <tr key="empty">
                                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                                    No tenants found matching "{searchTerm}"
                                                </td>
                                            </tr>
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                            
                            {/* Pagination Controls */}
                            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
                                <div className="text-xs text-slate-500">
                                    Showing page {page} of {totalPages}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-2 rounded-lg border border-white/5 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="p-2 rounded-lg border border-white/5 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Revenue Analytics (Side Panel) */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
                                <TrendingUp className="w-5 h-5" />
                                Platform Revenue
                            </h2>
                            <select 
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value as any)}
                                className="bg-[#0F1115] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50"
                            >
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                                <option value="90d">Last 90 Days</option>
                            </select>
                        </div>

                        {/* Revenue Chart */}
                        <div className="p-6 rounded-xl bg-emerald-950/10 border border-emerald-500/20 h-[350px] relative">
                            {loadingChart ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                                </div>
                            ) : revenueData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueData}>
                                        <defs>
                                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                        <XAxis 
                                            dataKey="date" 
                                            stroke="#64748b" 
                                            fontSize={10} 
                                            tickFormatter={(val) => val.split('-').slice(1).join('/')}
                                        />
                                        <YAxis 
                                            stroke="#64748b" 
                                            fontSize={10} 
                                            tickFormatter={(val) => `₦${val >= 1000 ? (val/1000) + 'k' : val}`}
                                        />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#0F1115', border: '1px solid #10b98130', borderRadius: '8px' }}
                                            itemStyle={{ color: '#10b981', fontSize: '12px' }}
                                            labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px' }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="amount" 
                                            stroke="#10b981" 
                                            strokeWidth={2}
                                            fillOpacity={1} 
                                            fill="url(#colorAmount)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 gap-2">
                                    <Calendar className="w-8 h-8 opacity-20" />
                                    <span className="text-xs">No revenue data for this period</span>
                                </div>
                            )}
                        </div>

                        {/* Quick Platform Controls */}
                        <div className="p-6 rounded-xl bg-indigo-950/10 border border-indigo-500/20 space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Sliders className="w-5 h-5 text-indigo-400" />
                                <h3 className="font-bold text-white">Global Controls</h3>
                            </div>

                            <button className="w-full text-xs bg-red-500/10 text-red-400 px-4 py-3 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-all font-bold uppercase tracking-widest opacity-50 cursor-not-allowed">
                                Emergency Blackout
                            </button>
                            
                            <div className="p-3 rounded bg-black/20 border border-white/5 space-y-2">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase tracking-tighter">API Response Time</span>
                                    <span className="text-emerald-400 font-mono">24ms</span>
                                </div>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[85%]" />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </main>

            <AdminSmsAdjustModal 
                open={adjustModalOpen}
                onOpenChange={setAdjustModalOpen}
                tenant={selectedTenant}
                onSuccess={() => fetchData(page)}
            />

            <AdminProvisionModal 
                open={provisionModalOpen}
                onOpenChange={setProvisionModalOpen}
                onSuccess={() => fetchData(page)}
            />

            {/* Confirmation Dialog for Suspension/Activation */}
            <AlertDialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
                <AlertDialogContent className="bg-slate-950 border-slate-800 text-slate-100">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            {tenantToToggle?.is_active ? (
                                <><Ban className="text-red-500" /> Suspend Institutional Access?</>
                            ) : (
                                <><CheckCircle className="text-emerald-500" /> Re-Activate Institution?</>
                            )}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            {tenantToToggle?.is_active ? (
                                `Are you sure you want to suspend ${tenantToToggle?.name}? This will immediately block all teachers, students, and parents from accessing their dashboards.`
                            ) : (
                                `Are you sure you want to restore access for ${tenantToToggle?.name}? All users will regain immediate access to their accounts.`
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-slate-800 text-slate-400 hover:bg-white/5">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={(e) => {
                                e.preventDefault()
                                handleToggleStatus()
                            }}
                            className={tenantToToggle?.is_active ? "bg-red-600 hover:bg-red-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}
                        >
                            {togglingStatus ? <RefreshCw className="animate-spin w-4 h-4 mr-2" /> : null}
                            Confirm Action
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

function Loader2(props: any) {
    return (
        <RefreshCw {...props} className={`animate-spin ${props.className}`} />
    )
}
