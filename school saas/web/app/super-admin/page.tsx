import { useEffect, useState } from "react"
import { motion } from "framer-motion"
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
    RefreshCw
} from "lucide-react"
import { getAdminStats, getAllTenants } from "@/lib/actions/admin"
import { AdminSmsAdjustModal } from "@/components/admin/sms-adjust-modal"
import { toast } from "sonner"

export default function SuperAdminDashboard() {
    const [searchTerm, setSearchTerm] = useState("")
    const [stats, setStats] = useState<any>(null)
    const [tenants, setTenants] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    
    // SMS Adjustment State
    const [adjustModalOpen, setAdjustModalOpen] = useState(false)
    const [selectedTenant, setSelectedTenant] = useState<any>(null)

    const fetchData = async () => {
        setRefreshing(true)
        try {
            const [statsRes, tenantsRes] = await Promise.all([
                getAdminStats(),
                getAllTenants()
            ])
            
            if (statsRes.success) setStats(statsRes)
            if (tenantsRes.success) setTenants(tenantsRes.data || [])
        } catch (error) {
            toast.error("Failed to sync platform data")
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const filteredTenants = tenants.filter(t => 
        t.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const metrics = [
        { title: "Total Schools", value: stats?.schoolCount || "0", change: "Registered Tenants", icon: Building2, color: "text-blue-400" },
        { title: "Global SMS Balance", value: (stats?.totalSmsBalance || 0).toLocaleString(), change: "Units across nodes", icon: MessageSquare, color: "text-cyan-400" },
        { title: "Recent Activity", value: stats?.recentTrxCount || "0", change: "Transactions (24h)", icon: TrendingUp, color: "text-emerald-400" },
        { title: "Platform Integrity", value: "99.9%", change: "All Systems Operational", icon: ShieldAlert, color: "text-purple-400" },
    ]

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-100">
            {/* Top Navigation Bar */}
            <header className="border-b border-white/5 bg-[#0A0A0B]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-600/20 flex items-center justify-center border border-red-500/30">
                            <ShieldAlert className="w-5 h-5 text-red-500" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">EduFlow <span className="text-slate-500 font-normal">Super-Admin</span></span>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-mono text-slate-400">
                        <button 
                            onClick={fetchData} 
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
                            className="p-6 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors group"
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
                            </h2>
                            <div className="flex gap-3">
                                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all flex items-center gap-2">
                                    <Database className="w-4 h-4" />
                                    Provision New Campus
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
                        <div className="bg-[#0F1115] border border-white/5 rounded-xl overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white/5 text-slate-400 font-medium">
                                    <tr>
                                        <th className="px-6 py-4">School Name</th>
                                        <th className="px-6 py-4">Context (Slug)</th>
                                        <th className="px-6 py-4">SMS Balance</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                                                Hydrating platform state...
                                            </td>
                                        </tr>
                                    ) : filteredTenants.length > 0 ? (
                                        filteredTenants.map((tenant) => (
                                            <tr key={tenant.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4 font-medium text-white">{tenant.name}</td>
                                                <td className="px-6 py-4 text-slate-500 font-mono text-xs">{tenant.slug}.eduflow.ng</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-mono font-bold ${tenant.sms_balance < 500 ? 'text-amber-500 bg-amber-500/5' : 'text-emerald-400 bg-emerald-500/5'}`}>
                                                        {tenant.sms_balance?.toLocaleString() || 0} Units
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button 
                                                            onClick={() => {
                                                                setSelectedTenant(tenant)
                                                                setAdjustModalOpen(true)
                                                            }}
                                                            className="text-xs text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 transition-all flex items-center gap-1.5"
                                                        >
                                                            <Zap className="w-3.5 h-3.5" /> Adjust SMS
                                                        </button>
                                                        <button 
                                                            onClick={() => window.open(`https://${tenant.slug}.eduflow.ng`, '_blank')}
                                                            className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors" 
                                                            title="Impersonate / Visit"
                                                        >
                                                            <Search className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                                No tenants found matching "{searchTerm}"
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 3. Security & Platform Health (Side Panel) */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-red-500" />
                                Global Security
                            </h2>
                            <span className="text-xs text-red-400 animate-pulse font-mono">LIVE</span>
                        </div>

                        {/* Quick Actions */}
                        <div className="p-6 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Zap className="w-5 h-5 text-indigo-400" />
                                <h3 className="font-bold text-white">Global Overrides</h3>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded bg-black/20 border border-white/5 opacity-50 cursor-not-allowed">
                                <div>
                                    <div className="text-sm font-medium text-white">Maintenance Mode</div>
                                    <div className="text-xs text-slate-500">System-wide blackout</div>
                                </div>
                                <div className="w-10 h-6 rounded-full bg-slate-700 relative">
                                    <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white/20" />
                                </div>
                            </div>

                            <button className="w-full text-xs bg-red-500/10 text-red-400 px-4 py-3 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-all font-bold uppercase tracking-widest">
                                Revoke Global Sessions
                            </button>
                        </div>

                        {/* Platform Health */}
                        <div className="p-6 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-4">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Server className="w-4 h-4 text-emerald-400" />
                                API Integrity
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400">Paystack Gateway</span>
                                    <span className="text-emerald-400 font-mono">OPERATIONAL</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400">Termii SMS Bridge</span>
                                    <span className="text-emerald-400 font-mono">OPERATIONAL</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400">Supabase DB Cluster</span>
                                    <span className="text-emerald-400 font-mono">HEALTHY</span>
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
                onSuccess={fetchData}
            />
        </div>
    )
}
