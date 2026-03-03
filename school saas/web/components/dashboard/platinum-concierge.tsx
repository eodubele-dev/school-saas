"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Trophy, Shield, Activity, BookOpen, MessageSquare,
    Headphones, CreditCard, Star,
    AlertTriangle, Bell, Clock
} from "lucide-react"
import Link from "next/link"

import { PickupAuthorization } from "@/components/security/pickup-authorization"
import { GatePassGenerator } from "@/components/security/gate-pass-generator"
import { MedicalIncidentLog } from "@/components/health/medical-incident-log"
import { AllergyAlertManager } from "@/components/health/allergy-alert-manager"
import { CurriculumRoadmap } from "@/components/learning/curriculum-roadmap"
import { HomeworkTracker } from "@/components/learning/homework-tracker"
import { PTAScheduler } from "@/components/feedback/pta-scheduler"
import { FeedbackHub } from "@/components/feedback/feedback-hub"
import { SupportModal } from "@/components/modals/support-modal"

interface PlatinumConciergeProps {
    studentId: string
    pickupAuth: any[]
    medicalLogs: any[]
    healthAlerts: any[]
    curriculum: any[]
    assignments: any[]
    ptaSlots: any[]
    tenantName?: string // Optional, for support modal
}

export function PlatinumConcierge({
    studentId,
    pickupAuth,
    medicalLogs,
    healthAlerts,
    curriculum,
    assignments,
    ptaSlots,
    tenantName = "EduFlow Academy"
}: PlatinumConciergeProps) {
    const [isSupportOpen, setIsSupportOpen] = useState(false)
    const [liveCurriculum, setLiveCurriculum] = useState(curriculum)
    const supabase = createClient()

    useEffect(() => {
        const channel = supabase
            .channel('platinum-curriculum')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'curriculum_milestones',
                    filter: `student_id=eq.${studentId}`
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setLiveCurriculum((prev) => [payload.new as any, ...prev].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
                    } else if (payload.eventType === 'UPDATE') {
                        setLiveCurriculum((prev) => prev.map((item) => item.id === payload.new.id ? payload.new as any : item))
                    } else if (payload.eventType === 'DELETE') {
                        setLiveCurriculum((prev) => prev.filter((item) => item.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [studentId, supabase])

    // Calculate some quick stats for the Overview
    const pendingAssignments = assignments.filter(a => !a.completed).length
    const upcomingPTA = ptaSlots.find(s => s.is_available)?.start_time
    const activeAlerts = healthAlerts.length

    return (
        <div className="space-y-6 pt-8 border-t border-white/10 animate-in slide-in-from-bottom-5 duration-700">
            <div className="flex items-center justify-between mb-6">
                <Badge variant="outline" className="bg-cyan-950/30 text-cyan-400 border-cyan-500/30 px-3 py-1 font-mono text-xs tracking-widest uppercase ml-auto">
                    Status: Active
                </Badge>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-6 bg-[#0A0A0B]/80 backdrop-blur-xl border border-white/10 p-1.5 mb-8 rounded-xl shadow-lg">
                    <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-400 data-[state=active]:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all duration-300">Overview</TabsTrigger>
                    <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-400 data-[state=active]:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all duration-300">Security</TabsTrigger>
                    <TabsTrigger value="health" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-400 data-[state=active]:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all duration-300">Health</TabsTrigger>
                    <TabsTrigger value="academics" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-400 data-[state=active]:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all duration-300">Academics</TabsTrigger>
                    <TabsTrigger value="voice" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-400 data-[state=active]:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all duration-300">Voice</TabsTrigger>
                    <TabsTrigger value="support" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-400 data-[state=active]:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all duration-300">Support</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card className="bg-gradient-to-br from-cyan-950/40 via-[#0A0A0B] to-[#0A0A0B] border-cyan-900/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden group hover:-translate-y-1 hover:shadow-cyan-900/20 hover:border-cyan-700/50 transition-all duration-500 cursor-pointer pt-1">
                            {/* 🌈 Thick Top Border Action */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:h-1.5 transition-all duration-300" />
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-cyan-500/10 transition-all duration-500" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                                <CardTitle className="text-sm font-bold text-cyan-200/70 tracking-widest uppercase font-mono">Active Gate Pass</CardTitle>
                                <Shield className="h-5 w-5 text-cyan-400 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all duration-500" />
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-cyan-200">--</div>
                                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">No active passes</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-rose-950/40 via-[#0A0A0B] to-[#0A0A0B] border-rose-900/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden group hover:-translate-y-1 hover:shadow-rose-900/20 hover:border-rose-700/50 transition-all duration-500 cursor-pointer pt-1">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 to-pink-500 group-hover:h-1.5 transition-all duration-300" />
                            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-rose-500/10 transition-all duration-500" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                                <CardTitle className="text-sm font-bold text-rose-200/70 tracking-widest uppercase font-mono">Health Alerts</CardTitle>
                                <Activity className="h-5 w-5 text-rose-400 group-hover:drop-shadow-[0_0_8px_rgba(244,63,94,0.8)] transition-all duration-500" />
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className={`text-3xl font-black ${activeAlerts > 0 ? 'text-transparent bg-clip-text bg-gradient-to-br from-rose-400 to-red-500' : 'text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400'}`}>{activeAlerts}</div>
                                <p className="text-xs text-rose-500/50 uppercase tracking-widest font-bold mt-1">Active conditions</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-emerald-950/40 via-[#0A0A0B] to-[#0A0A0B] border-emerald-900/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden group hover:-translate-y-1 hover:shadow-emerald-900/20 hover:border-emerald-700/50 transition-all duration-500 cursor-pointer pt-1">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 group-hover:h-1.5 transition-all duration-300" />
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-all duration-500" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                                <CardTitle className="text-sm font-bold text-emerald-200/70 tracking-widest uppercase font-mono">Assignments</CardTitle>
                                <BookOpen className="h-5 w-5 text-emerald-400 group-hover:drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] transition-all duration-500" />
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-emerald-200">{pendingAssignments}</div>
                                <p className="text-xs text-emerald-500/50 uppercase tracking-widest font-bold mt-1">Due soon</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-amber-950/40 via-[#0A0A0B] to-[#0A0A0B] border-amber-900/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden group hover:-translate-y-1 hover:shadow-amber-900/20 hover:border-amber-700/50 transition-all duration-500 cursor-pointer pt-1">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 group-hover:h-1.5 transition-all duration-300" />
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-amber-500/10 transition-all duration-500" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                                <CardTitle className="text-sm font-bold text-amber-200/70 tracking-widest uppercase font-mono">Next PTA</CardTitle>
                                <MessageSquare className="h-5 w-5 text-amber-400 group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] transition-all duration-500" />
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <div suppressHydrationWarning className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-amber-200 truncate">
                                    {upcomingPTA ? new Date(upcomingPTA).toLocaleDateString() : 'Not Scheduled'}
                                </div>
                                <p className="text-xs text-amber-500/50 uppercase tracking-widest font-bold mt-1">Next session</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Launch Banner */}
                    <div className="relative overflow-hidden rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 to-slate-950 p-6">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Headphones size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Executive Service</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Need immediate assistance?</h3>
                            <p className="text-slate-400 text-sm max-w-lg mb-4">
                                Use your Platinum Priority Uplink to contact the executive support team directly. Bypass standard queues.
                            </p>
                            <Button
                                className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold"
                                onClick={() => setIsSupportOpen(true)}
                            >
                                <Headphones className="mr-2 h-4 w-4" />
                                Open Priority Support
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                {/* SECURITY TAB */}
                <TabsContent value="security" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Shield className="h-5 w-5 text-cyan-400" /> Pickup Authorization
                            </h3>
                            <PickupAuthorization data={pickupAuth} />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Clock className="h-5 w-5 text-cyan-400" /> Gate Pass Generator
                            </h3>
                            <GatePassGenerator studentId={studentId} />
                        </div>
                    </div>
                </TabsContent>

                {/* HEALTH TAB */}
                <TabsContent value="health" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Activity className="h-5 w-5 text-rose-400" /> Medical Log
                            </h3>
                            <MedicalIncidentLog outcomes={medicalLogs} />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-rose-400" /> Allergy Alerts
                            </h3>
                            <AllergyAlertManager alerts={healthAlerts} />
                        </div>
                    </div>
                </TabsContent>

                {/* ACADEMICS TAB */}
                <TabsContent value="academics" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <BookOpen className="h-5 w-5 text-emerald-400" /> Curriculum Roadmap
                            </h3>
                            <CurriculumRoadmap milestones={liveCurriculum} />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Bell className="h-5 w-5 text-emerald-400" /> Homework Tracker
                            </h3>
                            <HomeworkTracker tasks={assignments} />
                        </div>
                    </div>
                </TabsContent>

                {/* VOICE TAB */}
                <TabsContent value="voice" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-amber-400" /> PTA Scheduler
                            </h3>
                            <PTAScheduler slots={ptaSlots} studentId={studentId} />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Star className="h-5 w-5 text-amber-400" /> Feedback Hub
                            </h3>
                            <FeedbackHub studentId={studentId} />
                        </div>
                    </div>
                </TabsContent>

                {/* SUPPORT TAB */}
                <TabsContent value="support" className="space-y-6">
                    <Card className="bg-slate-950 border-white/5">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Headphones className="h-5 w-5 text-cyan-400" /> Executive Support Suite
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-slate-400 text-sm">
                                As a Platinum member, you have 24/7 access to our dedicated executive support team.
                                Resolve issues instantly with your private priority channel.
                            </p>

                            <div className="grid gap-4 md:grid-cols-3">
                                <Button
                                    size="lg"
                                    className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold h-20 flex flex-col items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all hover:-translate-y-1"
                                    onClick={() => setIsSupportOpen(true)}
                                >
                                    <Headphones className="h-6 w-6" />
                                    <span>Contact Support</span>
                                </Button>
                                <Link href="/dashboard/billing/family" className="w-full">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="w-full bg-transparent border-white/10 hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:text-cyan-400 text-white h-20 flex flex-col items-center justify-center gap-2 transition-all group"
                                    >
                                        <CreditCard className="h-6 w-6 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                                        <span>Billing & Invoices</span>
                                    </Button>
                                </Link>
                                <Link href="/dashboard/attendance/audit" className="w-full">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="w-full bg-transparent border-white/10 hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:text-cyan-400 text-white h-20 flex flex-col items-center justify-center gap-2 transition-all group"
                                    >
                                        <Shield className="h-6 w-6 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                                        <span>Audit Logs</span>
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <SupportModal
                isOpen={isSupportOpen}
                onClose={() => setIsSupportOpen(false)}
                tenantName={tenantName}
            />
        </div>
    )
}
