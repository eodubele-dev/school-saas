"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Activity, AlertTriangle, ShieldAlert, Clock, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IncidentForm } from "./incident-form"
import { AllergyAlertForm } from "./allergy-alert-form"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export function HealthDashboardClient({ initialData }: { initialData: any }) {
    const { students, incidents, alerts } = initialData

    const [isIncidentModalOpen, setIncidentModalOpen] = useState(false)
    const [isAlertModalOpen, setAlertModalOpen] = useState(false)

    return (
        <div className="space-y-6">
            <Tabs defaultValue="incidents" className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <TabsList className="bg-slate-900/50 border border-slate-800 p-1">
                        <TabsTrigger
                            value="incidents"
                            className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-300 transition-all font-medium"
                        >
                            <Activity className="w-4 h-4 mr-2" />
                            Daily Infirmary Log
                        </TabsTrigger>
                        <TabsTrigger
                            value="alerts"
                            className="data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-300 transition-all font-medium"
                        >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Allergy & Condition Profiles
                        </TabsTrigger>
                    </TabsList>

                    {/* Responsive Actions */}
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => setIncidentModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white border-none shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all font-semibold"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Log Incident
                        </Button>
                        <Button
                            onClick={() => setAlertModalOpen(true)}
                            variant="outline"
                            className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 font-semibold"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Add Health Alert
                        </Button>
                    </div>
                </div>

                <TabsContent value="incidents" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-slate-950/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />

                        <div className="p-6 border-b border-white/5 bg-slate-900/40">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-indigo-400" /> Recent Medical Incidents
                            </h3>
                            <p className="text-slate-400 text-sm mt-1">Real-time tracking of student clinic visits.</p>
                        </div>

                        <div className="p-0 sm:p-6 pb-2">
                            {incidents.length === 0 ? (
                                <div className="text-center py-12">
                                    <Stethoscope className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                    <h4 className="text-slate-300 font-medium tracking-wide">No Medical Incidents</h4>
                                    <p className="text-slate-500 text-sm mt-1">The clinic log is currently empty.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {incidents.map((incident: any) => (
                                        <div key={incident.id} className="bg-slate-900/40 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="mt-1 bg-slate-800 p-2.5 rounded-lg border border-slate-700">
                                                        <Activity className="w-4 h-4 text-indigo-400" />
                                                    </div>
                                                    <div>
                                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                                            <h4 className="text-white font-bold">{incident.student?.full_name}</h4>
                                                            <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-widest ${incident.type === 'Injury' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                                                incident.type === 'Emergency' ? 'bg-red-500/20 text-red-500 border-red-500/30 animate-pulse' :
                                                                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                                }`}>
                                                                {incident.type}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-slate-300 text-sm font-medium">{incident.title}</p>
                                                        <p className="text-slate-400 text-xs mt-2 leading-relaxed max-w-2xl"><span className="text-slate-500 uppercase text-[10px] font-bold tracking-widest mr-2">Treatment:</span>{incident.treatment}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-start md:items-end gap-2 shrink-0 md:min-w-[150px]">
                                                    <div className="flex items-center text-xs text-slate-500 font-mono bg-black/40 px-2.5 py-1 rounded-md">
                                                        <Clock className="w-3 h-3 mr-1.5" />
                                                        {incident.incident_date} • {incident.incident_time}
                                                    </div>
                                                    <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-3 mt-1">
                                                        <span className="text-[10px] text-slate-500 uppercase tracking-widest bg-slate-900 px-2 py-0.5 rounded border border-white/5">{incident.nurse_name}</span>
                                                        <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-widest ${incident.status === 'Back to Class' ? 'text-emerald-400 border-emerald-500/20' : 'text-amber-400 border-amber-500/20'
                                                            }`}>
                                                            {incident.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="alerts" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-slate-950/40 backdrop-blur-md border border-rose-500/10 rounded-2xl overflow-hidden shadow-2xl relative">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[80px] pointer-events-none" />

                        <div className="p-6 border-b border-rose-500/10 bg-rose-950/20">
                            <h3 className="text-lg font-bold text-rose-100 flex items-center gap-2">
                                <ShieldAlert className="w-5 h-5 text-rose-500" /> Active Health Alerts
                            </h3>
                            <p className="text-rose-200/50 text-sm mt-1">Critical allergies and conditions for duty of care.</p>
                        </div>

                        <div className="p-6">
                            {alerts.length === 0 ? (
                                <div className="text-center py-12">
                                    <ShieldAlert className="w-12 h-12 text-rose-900 mx-auto mb-3" />
                                    <h4 className="text-rose-200/80 font-medium tracking-wide">No Active Alerts</h4>
                                    <p className="text-rose-200/40 text-sm mt-1">There are no critical conditions logged.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {alerts.map((alert: any) => (
                                        <div key={alert.id} className="bg-rose-950/20 border border-rose-500/10 rounded-xl p-5 hover:border-rose-500/30 transition-all group relative overflow-hidden">
                                            <div className={`absolute top-0 left-0 w-1 h-full ${alert.severity === 'Severe' || alert.severity === 'Critical' ? 'bg-red-500' : 'bg-amber-400'}`} />

                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="text-white font-bold">{alert.student?.full_name}</h4>
                                                    <p className="text-slate-500 font-mono text-xs mt-0.5">{alert.student?.admission_number}</p>
                                                </div>
                                                <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-widest ${alert.severity === 'Severe' || alert.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                                                    {alert.severity}
                                                </Badge>
                                            </div>

                                            <div className="mb-3">
                                                <p className={`font-black uppercase tracking-widest text-sm mb-1 ${alert.severity === 'Severe' || alert.severity === 'Critical' ? 'text-red-400' : 'text-amber-400'}`}>
                                                    {alert.condition}
                                                </p>
                                            </div>

                                            <p className="text-slate-400 text-xs leading-relaxed">
                                                {alert.notes}
                                            </p>

                                            <div className="mt-4 pt-4 border-t border-rose-500/10 flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest">
                                                <span>Logged: {new Date(alert.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Modals */}
            <Dialog open={isIncidentModalOpen} onOpenChange={setIncidentModalOpen}>
                <DialogContent className="sm:max-w-[500px] bg-slate-950 border-slate-800 text-slate-200">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Log Medical Incident</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Record a new clinic visit or treatment administered to a student.
                        </DialogDescription>
                    </DialogHeader>
                    <IncidentForm students={students} onSuccess={() => setIncidentModalOpen(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={isAlertModalOpen} onOpenChange={setAlertModalOpen}>
                <DialogContent className="sm:max-w-[500px] bg-slate-950 border-rose-500/20 text-slate-200">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-rose-100 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-rose-500" /> Add Health Alert
                        </DialogTitle>
                        <DialogDescription className="text-rose-200/50">
                            Register a critical allergy or chronic condition for duty of care.
                        </DialogDescription>
                    </DialogHeader>
                    <AllergyAlertForm students={students} onSuccess={() => setAlertModalOpen(false)} />
                </DialogContent>
            </Dialog>
        </div>
    )
}
