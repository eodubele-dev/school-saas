"use client"

import { useState } from "react"
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
    Zap
} from "lucide-react"

// --- Mock Data ---

const metrics = [
    { title: "Total Active Schools", value: "84", change: "+12% this month", icon: Building2, color: "text-blue-400" },
    { title: "Total Student Pop.", value: "42,500", change: "+850 this week", icon: Users, color: "text-cyan-400" },
    { title: "Monthly Recurring Revenue", value: "₦125M", change: "+15% vs last month", icon: TrendingUp, color: "text-emerald-400" },
    { title: "Platform Integrity Score", value: "99.9%", change: "All Systems Forensic", icon: ShieldAlert, color: "text-purple-400" },
]

const tenants = [
    { id: 1, name: "Lekki British International", subdomain: "lekki.eduflow.ng", tier: "Platinum", status: "Active", lastAudit: "2 mins ago" },
    { id: 2, name: "Greensprings School", subdomain: "greensprings.eduflow.ng", tier: "Platinum", status: "Active", lastAudit: "15 mins ago" },
    { id: 3, name: "Corona Schools Trust", subdomain: "corona.eduflow.ng", tier: "Professional", status: "Active", lastAudit: "1 hour ago" },
    { id: 4, name: "Day Waterman College", subdomain: "dwc.eduflow.ng", tier: "Platinum", status: "Active", lastAudit: "5 mins ago" },
    { id: 5, name: "Meadow Hall", subdomain: "meadowhall.eduflow.ng", tier: "Starter", status: "Payment Due", lastAudit: "1 day ago" },
]

const securityEvents = [
    { id: 1, school: "Meadow Hall", event: "Manual SQL Injection Attempt", severity: "CRITICAL", time: "10:42 AM" },
    { id: 2, school: "Lekki British", event: "Grade Alteration (Post-Lock)", severity: "HIGH", time: "10:15 AM" },
    { id: 3, school: "Corona Schools", event: "Multiple Failed Admin Logins", severity: "MEDIUM", time: "09:30 AM" },
    { id: 4, school: "Greensprings", event: "Unauthorized IP Access Blocked", severity: "HIGH", time: "08:45 AM" },
]

export default function SuperAdminDashboard() {
    const [searchTerm, setSearchTerm] = useState("")

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
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            PLATFORM_OPERATIONAL
                        </div>
                        <div className="px-3 py-1 rounded bg-white/5 border border-white/5">v4.2.0-RC1</div>
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
                            <div className="mt-3 text-xs font-mono text-emerald-400 flex items-center gap-1">
                                {metric.change.includes("+") ? "↑" : ""} {metric.change}
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
                                Active Tenants
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
                                placeholder="Search by school name, subdomain, or tenant ID..."
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
                                        <th className="px-6 py-4">Subdomain</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {tenants.map((tenant) => (
                                        <tr key={tenant.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4 font-medium text-white">{tenant.name}</td>
                                            <td className="px-6 py-4 text-slate-500 font-mono text-xs">{tenant.subdomain}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${tenant.status === 'Active'
                                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                        : "bg-red-500/10 text-red-400 border-red-500/20"
                                                    }`}>
                                                    {tenant.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors" title="Impersonate">
                                                        <Search className="w-4 h-4" />
                                                    </button>
                                                    <button className="text-xs text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 transition-all">
                                                        Manage
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 3. Security & Platform Health (Side Panel) */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-red-500" />
                                Global Security Feed
                            </h2>
                            <span className="text-xs text-red-400 animate-pulse font-mono">LIVE</span>
                        </div>

                        {/* Audit Feed */}
                        <div className="bg-[#0F1115] border border-red-900/20 rounded-xl p-4 space-y-4 max-h-[400px] overflow-y-auto">
                            {securityEvents.map((event) => (
                                <div key={event.id} className="p-3 rounded bg-red-950/10 border border-red-500/10 flex gap-3 items-start">
                                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-xs font-mono text-red-400 mb-0.5">{event.time} • {event.severity}</div>
                                        <div className="text-sm font-medium text-white">{event.event}</div>
                                        <div className="text-xs text-slate-500 mt-1">{event.school}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Global Override Controls */}
                        <div className="p-6 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <Zap className="w-5 h-5 text-indigo-400" />
                                <h3 className="font-bold text-white">Global Overrides</h3>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded bg-black/20 border border-white/5">
                                <div>
                                    <div className="text-sm font-medium text-white">Maintenance Mode</div>
                                    <div className="text-xs text-slate-500">Push "Under Maintenance" to all nodes</div>
                                </div>
                                <div className="w-10 h-6 rounded-full bg-slate-700 relative cursor-pointer">
                                    <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white" />
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded bg-black/20 border border-white/5">
                                <div>
                                    <div className="text-sm font-medium text-white">Force Logout All</div>
                                    <div className="text-xs text-slate-500">Revoke all active session tokens</div>
                                </div>
                                <button className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20 hover:bg-red-500/20">
                                    EXECUTE
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

            </main>
        </div>
    )
}
