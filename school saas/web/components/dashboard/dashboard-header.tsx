"use client"

import React from 'react'

interface DashboardHeaderProps {
    user: {
        id: string
    }
    role: string
    schoolName: string
}

import { motion } from 'framer-motion'

export const DashboardHeader = ({ user, role, schoolName }: DashboardHeaderProps) => {
    const normalizedRole = role.toLowerCase()

    const getHeaderContent = (r: string) => {
        switch (r) {
            case 'admin':
            case 'proprietor':
                return {
                    title: "Command Center",
                    subtext: "Real-time school performance and financial analysis",
                    accent: "from-amber-500/20 to-transparent",
                    border: "border-amber-500/30",
                    glow: "shadow-[0_0_20px_rgba(245,158,11,0.2)]",
                    textColor: "text-amber-400"
                }
            case 'teacher':
                return {
                    title: "Academic & Behavioral Hub",
                    subtext: "Managing classroom engagement and student vitals",
                    accent: "from-purple-500/20 to-transparent",
                    border: "border-purple-500/30",
                    glow: "shadow-[0_0_20px_rgba(168,85,247,0.2)]",
                    textColor: "text-purple-400"
                }
            case 'bursar':
                return {
                    title: "Reconciliation & Audit Portal",
                    subtext: "Financial ledger and revenue recovery oversight",
                    accent: "from-cyan-500/20 to-transparent",
                    border: "border-cyan-500/30",
                    glow: "shadow-[0_0_20px_rgba(6,182,212,0.2)]",
                    textColor: "text-cyan-400"
                }
            case 'parent':
                return {
                    title: "Family Engagement & Progress Portal",
                    subtext: "Real-time updates on your child's academic journey and school vitals",
                    accent: "from-emerald-500/20 to-transparent",
                    border: "border-emerald-500/30",
                    glow: "shadow-[0_0_20px_rgba(16,185,129,0.2)]",
                    textColor: "text-emerald-400"
                }
            case 'student':
                return {
                    title: "My Achievement & Growth Portfolio",
                    subtext: "Tracking my badges, academic milestones, and character development",
                    accent: "from-indigo-500/20 to-transparent",
                    border: "border-indigo-500/30",
                    glow: "shadow-[0_0_20px_rgba(99,102,241,0.2)]",
                    textColor: "text-indigo-400"
                }
            default:
                return {
                    title: "Portfolio",
                    subtext: "Accessing your personal academic resources",
                    accent: "from-slate-500/20 to-transparent",
                    border: "border-slate-500/30",
                    glow: "shadow-[0_0_20px_rgba(148,163,184,0.2)]",
                    textColor: "text-slate-400"
                }
        }
    }

    const content = getHeaderContent(normalizedRole)

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-12 relative z-10 p-8 rounded-[2rem] border ${content.border} bg-gradient-to-br ${content.accent} backdrop-blur-xl ${content.glow}`}
        >
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white uppercase italic">
                    {schoolName} <span className="font-light text-slate-400">{content.title}</span>
                </h1>

                <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase">
                    <span className="text-slate-500">Role:</span>
                    <span className={`${content.textColor} font-black`}>{role}</span>
                    <span className="text-slate-700 mx-1">//</span>
                    <span className="text-slate-500">System_ID:</span>
                    <span className="text-slate-300">{user.id.slice(0, 8)}</span>
                    <span className="ml-2 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] text-slate-500">IDENTITY_VERIFIED</span>
                </div>

                <p className="mt-2 text-sm text-slate-400 font-medium tracking-wide">
                    {content.subtext}
                </p>
            </div>

            {/* Cyber Decorative Elements */}
            <div className="absolute top-4 right-4 flex gap-1">
                <div className={`w-1 h-1 rounded-full ${content.textColor.replace('text-', 'bg-')} animate-pulse`} />
                <div className="w-1 h-1 rounded-full bg-slate-800" />
                <div className="w-1 h-1 rounded-full bg-slate-800" />
            </div>
        </motion.header>
    )
}
