"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowRight, Lock, CheckCircle, Smartphone, PlayCircle, ShieldCheck } from "lucide-react"
import { useExecutiveConversion } from "./executive-context"

// --- Mock Data ---
const revenueData = [
    { name: 'Mon', value: 4000 },
    { name: 'Tue', value: 3000 },
    { name: 'Wed', value: 5000 },
    { name: 'Thu', value: 4780 },
    { name: 'Fri', value: 5890 },
    { name: 'Sat', value: 6390 },
    { name: 'Sun', value: 7490 },
]

const velocityData = [
    { name: 'W1', value: 45 },
    { name: 'W2', value: 60 },
    { name: 'W3', value: 85 },
    { name: 'W4', value: 92 },
]

const securityLogs = [
    { id: 1, action: "GRADE_CHANGE", details: "Math 101: 65 -> 85", time: "10:42 AM", status: "BLOCKED" },
    { id: 2, action: "LOGIN_ATTEMPT", details: "User: bursar_01", time: "10:45 AM", status: "SUCCESS" },
    { id: 3, action: "FEE_OVERRIDE", details: "Inv #442: Manual", time: "11:02 AM", status: "FLAGGED" },
]

export function HeroFlowBuilder() {
    const { openTenantPreview, triggerVideoDemo } = useExecutiveConversion()
    // Parallax Logic
    const ref = useRef<HTMLDivElement>(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const mouseXSpring = useSpring(x)
    const mouseYSpring = useSpring(y)

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"])
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"])

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = ref.current?.getBoundingClientRect()
        const width = rect?.width
        const height = rect?.height

        if (!width || !height) return

        const mouseX = e.clientX - (rect.left + width / 2)
        const mouseY = e.clientY - (rect.top + height / 2)

        const xPct = mouseX / width
        const yPct = mouseY / height

        x.set(xPct)
        y.set(yPct)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    return (
        <section id="home" className="relative min-h-[100vh] flex items-center justify-center pt-32 pb-20 overflow-hidden bg-[#000000]">

            {/* 1. Background: 'Blue Obsidian' Canvas */}
            <div className="absolute inset-0 z-0 pointer-events-none bg-[#000000]">

                {/* Geometric Texture: Faint Grid (10% opacity for visibility) */}
                <div
                    className="absolute inset-0 opacity-[0.1]"
                    style={{
                        backgroundImage: `linear-gradient(#3B82F6 1px, transparent 1px), linear-gradient(90deg, #3B82F6 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                        maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)' // Fade edges only
                    }}
                />

                {/* Atmospheric Lighting 1: Behind Central Text */}
                <div
                    className="absolute top-[20%] left-[10%] w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-40 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #0066FF 0%, transparent 70%)' }}
                />

                {/* Atmospheric Lighting 2: Behind Right-Side Widgets */}
                <div
                    className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[120px] opacity-40 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #0066FF 0%, transparent 70%)' }}
                />
            </div>

            <div className="container relative z-10 px-4 md:px-6">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-12">

                    {/* LEFT: Copy & CTA */}
                    <div className="flex-1 text-center lg:text-left space-y-8 max-w-2xl mx-auto lg:mx-0 relative z-20">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-xs font-mono mb-4 backdrop-blur-md">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            v4.0 Obsidian Live
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-5xl md:text-7xl font-[800] tracking-tighter text-white leading-[1.05] drop-shadow-2xl">
                                <span className="text-blue-500">Supercharge</span> your campus, streamline your success.
                            </h1>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed"
                        >
                            Everything you need to run a top-tier institution. Automate finances, secure grades, and delight parents with a world-class experience.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start"
                        >
                            <button
                                onClick={openTenantPreview}
                                className="px-8 py-4 bg-[#3B82F6] hover:bg-cyan-500 hover:scale-105 transition-all duration-300 rounded-lg text-white font-bold text-lg shadow-[0_0_40px_-5px_#3B82F6] hover:shadow-[0_0_50px_-5px_#06b6d4] border border-blue-400/50 flex items-center gap-2 group ring-offset-2 ring-offset-black focus:ring-2 ring-blue-500"
                            >
                                Start Free
                            </button>
                            <button
                                onClick={triggerVideoDemo}
                                className="px-8 py-4 bg-transparent hover:bg-white/5 border border-white/20 hover:border-cyan-500/50 rounded-lg text-white font-medium text-lg backdrop-blur-md transition-all flex items-center gap-3 hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.2)]"
                            >
                                Set It in Action
                            </button>
                        </motion.div>
                    </div>

                    {/* RIGHT: The Master Bento Grid (3D Parallax) */}
                    <div
                        className="flex-1 w-full max-w-[650px] aspect-square relative perspective-1000 hidden lg:block"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        ref={ref}
                    >
                        <motion.div
                            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                            className="w-full h-full relative"
                        >
                            {/* Bento Grid Container */}
                            <div className="grid grid-cols-6 grid-rows-6 gap-4 h-full w-full p-4">

                                {/* 1. Main Center (Wide) - Proprietor Executive God-View */}
                                <div className="col-span-6 row-span-4 bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 flex flex-col justify-between relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-500"
                                    style={{
                                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                                        transform: "translateZ(30px)"
                                    }}>

                                    {/* Fake Chrome/Header */}
                                    <div className="h-10 border-b border-white/5 flex items-center px-4 justify-between bg-white/[0.02]">
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/50" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                                        </div>
                                        <div className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-500/20">
                                            proprietor_dashboard.exe
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 flex-1 flex flex-col relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Total Revenue</h3>
                                                <div className="flex items-baseline gap-2">
                                                    <p className="text-4xl font-bold text-white tracking-tight">₦42.5M</p>
                                                    <span className="text-green-400 text-xs font-mono bg-green-500/10 px-1.5 py-0.5 rounded">+12.4%</span>
                                                </div>
                                            </div>
                                            {/* Floating Label */}
                                            <motion.div
                                                initial={{ y: 0 }} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 4 }}
                                                className="px-3 py-1.5 rounded-lg bg-blue-600 shadow-lg shadow-blue-500/30 border border-white/10 flex items-center gap-2"
                                            >
                                                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center overflow-hidden">
                                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                                                </div>
                                                <div className="text-[10px] leading-tight text-white">
                                                    <span className="font-bold block">Proprietor</span>
                                                    <span className="opacity-80">God Mode Active</span>
                                                </div>
                                            </motion.div>
                                        </div>

                                        <div className="h-full w-full min-h-[160px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={revenueData}>
                                                    <defs>
                                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                                    <XAxis dataKey="name" hide />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                                        itemStyle={{ color: '#22d3ee' }}
                                                        cursor={{ stroke: '#ffffff10' }}
                                                    />
                                                    <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Border Glow */}
                                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />
                                </div>

                                {/* 2. Top Right (Small) - Security Integrity Log */}
                                <div className="col-span-2 row-span-3 bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 p-4 flex flex-col relative group"
                                    style={{ transform: "translateZ(50px)" }}>
                                    <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Audit Log</span>
                                    </div>
                                    <div className="space-y-2 font-mono text-[9px] text-slate-400">
                                        {securityLogs.map(log => (
                                            <div key={log.id} className="flex flex-col border-l border-white/5 pl-2">
                                                <div className="flex justify-between text-slate-300">
                                                    <span>{log.action}</span>
                                                    <span className={log.status === 'BLOCKED' ? 'text-red-400' : log.status === 'FLAGGED' ? 'text-amber-400' : 'text-emerald-400'}>
                                                        {log.status}
                                                    </span>
                                                </div>
                                                <span className="opacity-50 truncate">{log.details}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Alert Pulse */}
                                    <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#ef4444]" />
                                </div>

                                {/* 3. Bottom Left (Square) - Student Identity */}
                                <div className="col-span-2 row-span-2 bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 p-4 relative group hover:bg-white/[0.05] transition-colors"
                                    style={{ transform: "translateZ(20px)" }}>
                                    <div className="flex items-center justify-center h-full">
                                        <div className="relative">
                                            {/* Rings */}
                                            <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-[spin_10s_linear_infinite]" />
                                            <div className="absolute -inset-1 rounded-full border border-cyan-500/30 border-t-cyan-400 rotate-45" />

                                            <div className="w-14 h-14 rounded-full bg-slate-800 overflow-hidden border-2 border-slate-950 relative z-10">
                                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jude" alt="Student" className="w-full h-full object-cover" />
                                            </div>

                                            <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-black flex items-center justify-center z-20">
                                                <CheckCircle className="w-2.5 h-2.5 text-black fill-current" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-2 left-0 w-full text-center">
                                        <p className="text-[10px] font-bold text-white">Student ID Verified</p>
                                    </div>
                                </div>

                                {/* 4. Bottom Right (Tall) - Fee Collection Velocity */}
                                <div className="col-span-4 row-span-2 bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 p-4 flex items-center gap-6 relative overflow-hidden"
                                    style={{ transform: "translateZ(40px)" }}>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="text-white text-xs font-bold">Fee Velocity</h4>
                                            <span className="text-[10px] text-green-400 font-mono">98% Match</span>
                                        </div>
                                        <div className="h-16 w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={velocityData}>
                                                    <Bar dataKey="value" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Floating Label Style 2 */}
                                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded border border-white/10 bg-black/40 text-[9px] text-slate-400 font-mono">
                                        Lagos_Campus_01
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Bottom Fade Gradient to smooth transition */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020410] to-transparent z-10" />
        </section>
    )
}
