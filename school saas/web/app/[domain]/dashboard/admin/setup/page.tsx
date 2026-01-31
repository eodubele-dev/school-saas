"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarDays, DollarSign, CheckCircle2, ChevronRight, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

export default function AcademicSetupWizard() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [termName, setTermName] = useState("")
    const [tuitionFee, setTuitionFee] = useState("")
    const [devLevy, setDevLevy] = useState("5000") // Default

    // Step 1: Term Confirmation
    const handleInitializeTerm = () => {
        if (!termName) return toast.error("Please enter a term name")
        setStep(2)
    }

    // Step 2: Fee Schedule
    const handleSaveFees = async () => {
        if (!tuitionFee) return toast.error("Please enter base tuition fee")
        setStep(3)
    }

    // Step 3: Finalize & Generate Invoices
    const handleFinalize = async () => {
        setLoading(true)
        try {
            // Simulate API / RPC Call
            await new Promise(r => setTimeout(r, 2000))

            toast.success("Academic Term Initialized!", {
                description: "Invoices have been generated for all active students."
            })
            // Reset or Redirect
        } catch (error) {
            toast.error("Failed to initialize term")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white font-serif">Academic & Fee Setup</h2>
                <p className="text-slate-400">Configure the active term and automate billing for the new session.</p>
            </div>

            {/* Steps Indicator */}
            <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                <span className={step >= 1 ? "text-cyan-400" : ""}>1. Active Term</span>
                <ChevronRight className="h-4 w-4" />
                <span className={step >= 2 ? "text-cyan-400" : ""}>2. Fee Schedule</span>
                <ChevronRight className="h-4 w-4" />
                <span className={step >= 3 ? "text-cyan-400" : ""}>3. Initialize</span>
            </div>

            <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl">
                <CardContent className="p-8">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="h-12 w-12 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20">
                                <CalendarDays className="h-6 w-6 text-purple-400" />
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Term Name</Label>
                                    <Input
                                        value={termName}
                                        onChange={(e) => setTermName(e.target.value)}
                                        placeholder="e.g. 2025/2026 First Term"
                                        className="bg-slate-950 border-white/10 text-white"
                                    />
                                </div>
                            </div>
                            <Button onClick={handleInitializeTerm} className="bg-purple-600 hover:bg-purple-500 text-white">
                                Continue to Fees <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-8 fade-in">
                            <div className="h-12 w-12 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                                <DollarSign className="h-6 w-6 text-emerald-400" />
                            </div>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Base Tuition Fee (₦)</Label>
                                    <Input
                                        type="number"
                                        value={tuitionFee}
                                        onChange={(e) => setTuitionFee(e.target.value)}
                                        placeholder="0.00"
                                        className="bg-slate-950 border-white/10 text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Development Levy (₦)</Label>
                                    <Input
                                        type="number"
                                        value={devLevy}
                                        onChange={(e) => setDevLevy(e.target.value)}
                                        className="bg-slate-950 border-white/10 text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="ghost" onClick={() => setStep(1)} className="text-slate-400">Back</Button>
                                <Button onClick={handleSaveFees} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                                    Review & Generate <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-8 fade-in text-center py-8">
                            <div className="mx-auto h-20 w-20 bg-cyan-500/10 rounded-full flex items-center justify-center border border-cyan-500/20 mb-4 animate-pulse">
                                <CheckCircle2 className="h-10 w-10 text-cyan-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Ready to Launch</h3>
                            <p className="text-slate-400 max-w-md mx-auto">
                                You are about to start <strong>{termName}</strong> and generate invoices totaling
                                <span className="text-emerald-400 font-mono ml-2">₦{(Number(tuitionFee) + Number(devLevy)).toLocaleString()}</span> per student.
                            </p>

                            <div className="flex justify-center gap-4 pt-4">
                                <Button variant="ghost" onClick={() => setStep(2)} className="text-slate-400">Back</Button>
                                <Button
                                    onClick={handleFinalize}
                                    disabled={loading}
                                    className="bg-cyan-600 hover:bg-cyan-500 text-white h-12 px-8 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                                >
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Initialize Term & Send Bills"}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
