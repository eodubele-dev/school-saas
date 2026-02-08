"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Trophy, Shield, Activity, BookOpen, MessageSquare,
    Headphones, CreditCard, Star,
    AlertTriangle, Bell, Clock
} from "lucide-react"

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
                <TabsList className="grid w-full grid-cols-6 bg-slate-900/50 border border-white/5 p-1 mb-6">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">Overview</TabsTrigger>
                    <TabsTrigger value="security" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">Security</TabsTrigger>
                    <TabsTrigger value="health" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">Health</TabsTrigger>
                    <TabsTrigger value="academics" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">Academics</TabsTrigger>
                    <TabsTrigger value="voice" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">Voice</TabsTrigger>
                    <TabsTrigger value="support" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">Support</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card className="bg-slate-900/50 border-white/5 hover:border-cyan-500/20 transition-colors cursor-pointer group">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-300">Active Gate Pass</CardTitle>
                                <Shield className="h-4 w-4 text-cyan-400 group-hover:drop-shadow-[0_0_5px_rgba(34,211,238,0.8)] transition-all" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">--</div>
                                <p className="text-xs text-slate-500">No active passes</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-900/50 border-white/5 hover:border-cyan-500/20 transition-colors cursor-pointer group">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-300">Health Alerts</CardTitle>
                                <Activity className="h-4 w-4 text-rose-400 group-hover:drop-shadow-[0_0_5px_rgba(244,63,94,0.8)] transition-all" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${activeAlerts > 0 ? 'text-rose-400' : 'text-white'}`}>{activeAlerts}</div>
                                <p className="text-xs text-slate-500">Active conditions</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-900/50 border-white/5 hover:border-cyan-500/20 transition-colors cursor-pointer group">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-300">Assignments</CardTitle>
                                <BookOpen className="h-4 w-4 text-emerald-400 group-hover:drop-shadow-[0_0_5px_rgba(52,211,153,0.8)] transition-all" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">{pendingAssignments}</div>
                                <p className="text-xs text-slate-500">Due soon</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-900/50 border-white/5 hover:border-cyan-500/20 transition-colors cursor-pointer group">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-300">Next PTA</CardTitle>
                                <MessageSquare className="h-4 w-4 text-amber-400 group-hover:drop-shadow-[0_0_5px_rgba(251,191,36,0.8)] transition-all" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-lg font-bold text-white truncate">
                                    {upcomingPTA ? new Date(upcomingPTA).toLocaleDateString() : 'Not Scheduled'}
                                </div>
                                <p className="text-xs text-slate-500">Next session</p>
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
                            <CurriculumRoadmap milestones={curriculum} />
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
                                    className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold h-20 flex flex-col items-center justify-center gap-2"
                                    onClick={() => setIsSupportOpen(true)}
                                >
                                    <Headphones className="h-6 w-6" />
                                    <span>Contact Support</span>
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="bg-transparent border-white/10 hover:bg-white/10 hover:text-white text-white h-20 flex flex-col items-center justify-center gap-2"
                                >
                                    <CreditCard className="h-6 w-6 text-slate-400 group-hover:text-white transition-colors" />
                                    <span>Billing & Invoices</span>
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="bg-transparent border-white/10 hover:bg-white/10 hover:text-white text-white h-20 flex flex-col items-center justify-center gap-2"
                                >
                                    <Shield className="h-6 w-6 text-slate-400 group-hover:text-white transition-colors" />
                                    <span>Audit Logs</span>
                                </Button>
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
