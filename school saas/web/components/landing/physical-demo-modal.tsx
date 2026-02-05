"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Building2, Users, GraduationCap, ArrowRight, CheckCircle2 } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useExecutiveConversion } from "./executive-context"
import { toast } from "sonner"

export function PhysicalDemoModal() {
    const { isPhysicalDemoOpen, closePhysicalDemo } = useExecutiveConversion()
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        // Simulate API call
        await new Promise(r => setTimeout(r, 1500))
        setLoading(false)
        setIsSubmitted(true)
        toast.success("Request Received", {
            description: "Our Lagos Executive Team will contact you shortly."
        })
    }

    return (
        <Dialog open={isPhysicalDemoOpen} onOpenChange={closePhysicalDemo}>
            <DialogContent className="sm:max-w-xl bg-[#0A0A0B] border border-white/10 text-white p-0 overflow-hidden shadow-2xl">
                {/* Visual Logic: Deep Blue Radial Glow Background */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.3)_0%,transparent_70%)]" />
                </div>

                <div className="relative z-10 p-8">
                    {!isSubmitted ? (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/50 border border-blue-500/30 text-blue-400 text-[10px] font-mono mb-4">
                                    HIGH_INTENT_REQUEST_V3
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Schedule Physical Demo</h2>
                                <p className="text-slate-400 text-sm">Experience the Platinum OS live at your campus or our VI Experience Center.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="school" className="text-xs font-mono text-slate-500 uppercase tracking-widest">School Name</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                        <Input
                                            id="school"
                                            required
                                            placeholder="e.g. British International School"
                                            className="pl-10 bg-white/5 border-white/10 text-white focus:border-blue-500/50 h-11"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="campuses" className="text-xs font-mono text-slate-500 uppercase tracking-widest">No. of Campuses</Label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                            <Input
                                                id="campuses"
                                                type="number"
                                                required
                                                placeholder="1"
                                                className="pl-10 bg-white/5 border-white/10 text-white focus:border-blue-500/50 h-11"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="students" className="text-xs font-mono text-slate-500 uppercase tracking-widest">Student Population</Label>
                                        <div className="relative">
                                            <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                                            <Input
                                                id="students"
                                                type="number"
                                                required
                                                placeholder="500+"
                                                className="pl-10 bg-white/5 border-white/10 text-white focus:border-blue-500/50 h-11"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {loading ? "Transmitting..." : "Initialize Executive Request"}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>

                            <p className="text-[10px] text-center text-slate-500 uppercase tracking-tighter">
                                Secured via EduFlow encrypted uplink • Response time &lt; 2hrs
                            </p>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12 space-y-6"
                        >
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Request Transmitted</h3>
                                <p className="text-slate-400 text-sm">
                                    Our Platinum onboarding lead for Lagos will <br /> reach out to schedule your immersion session.
                                </p>
                            </div>
                            <Button
                                onClick={closePhysicalDemo}
                                variant="outline"
                                className="border-white/10 hover:bg-white/5 text-white"
                            >
                                Close Window
                            </Button>
                        </motion.div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
