"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldAlert, Key, Loader2, CheckCircle, RefreshCcw } from "lucide-react"
import { updateKioskPin } from "@/lib/actions/kiosk"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SecuritySettingsProps {
    tenantId: string
    currentPin?: string
}

/**
 * SecuritySettings: The administrative hub for workstation lockdown.
 * Allows proprietors to reset the Kiosk Master PIN.
 */
export function SecuritySettings({ tenantId, currentPin = "1234" }: SecuritySettingsProps) {
    const [pin, setPin] = useState("")
    const [isUpdating, setIsUpdating] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    const handleUpdatePin = async () => {
        if (!/^\d{4}$/.test(pin)) {
            toast.error("Invalid Configuration", {
                description: "Master PIN must be exactly 4 digits. 🤙🏾🔢",
            })
            return
        }

        setIsUpdating(true)
        try {
            const res = await updateKioskPin(tenantId, pin)
            if (res.success) {
                toast.success("Security Protocols Updated", {
                    description: "Kiosk Master PIN has been reset successfully. 🤙🏾🔐",
                })
                setLastUpdated(new Date())
                setPin("")
            } else {
                toast.error("Protocol Update Failed", {
                    description: res.error || "A system error occurred.",
                })
            }
        } catch (err) {
            toast.error("Critical System Error", {
                description: "Failed to reach the security vault.",
            })
        } finally {
            setIsUpdating(false)
        }
    }

    return (
        <Card className="bg-slate-900/40 border-white/5 backdrop-blur-sm shadow-2xl relative overflow-hidden group">
            {/* Background Aesthetic */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full transform translate-x-10 -translate-y-10 group-hover:bg-amber-500/10 transition-colors duration-700" />
            
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5 bg-white/[0.01]">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20 translate-y-[-2px]">
                            <ShieldAlert className="h-6 w-6 text-amber-500" />
                        </div>
                        <div>
                            <CardTitle className="text-white text-xl tracking-tight">Workstation Lockdown</CardTitle>
                            <CardDescription className="text-slate-400 text-xs">Manage your school's Master PIN for Kiosk Mode.</CardDescription>
                        </div>
                    </div>
                </div>
                <div className="px-2 py-1 rounded-full bg-slate-950/50 border border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    Security_Level_0
                </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
                <div className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">New Master PIN</label>
                        <div className="relative">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <Input
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                placeholder="E.g., 5678"
                                className="bg-white/5 border-white/10 rounded-xl pl-12 h-12 text-lg font-mono tracking-widest text-white focus:ring-amber-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <Button 
                        onClick={handleUpdatePin}
                        disabled={isUpdating || pin.length !== 4}
                        className="h-12 px-8 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-500"
                    >
                        {isUpdating ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                RESET PIN
                            </>
                        )}
                    </Button>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mt-0.5">
                            <CheckCircle className="h-3 w-3 text-blue-500" />
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            The **Master PIN** is used to exit Kiosk Mode on all workstations. Keep this PIN confidential—only share it with authorized academic and security personnel.
                        </p>
                    </div>

                    {lastUpdated && (
                        <div className="text-[9px] font-mono text-emerald-500 uppercase tracking-tighter flex items-center gap-1.5 pl-8">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                            VAULT_UPDATED: {lastUpdated.toLocaleTimeString()}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
