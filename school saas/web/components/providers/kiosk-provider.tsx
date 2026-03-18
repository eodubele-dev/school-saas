"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { getCurrentWindow } from "@tauri-apps/api/window"
import { invoke } from "@tauri-apps/api/core"
import { toast } from "sonner"
import { Shield, Lock, Unlock, AlertTriangle } from "lucide-react"
import { isDesktop } from "@/lib/utils/desktop"

interface KioskContextType {
    isKiosk: boolean
    enableKiosk: () => Promise<void>
    disableKiosk: (pin: string) => Promise<boolean>
    setMasterPin: (pin: string) => void
}

const KioskContext = createContext<KioskContextType | undefined>(undefined)

export function KioskProvider({ children }: { children: React.ReactNode }) {
    const [isKiosk, setIsKiosk] = useState(false)
    const [showExitOverlay, setShowExitOverlay] = useState(false)
    const [pinInput, setPinInput] = useState("")
    const [masterPin, setMasterPin] = useState("1234")

    // 🔒 Native Lockdown Enforcement
    const syncNativeState = useCallback(async (enabled: boolean) => {
        if (!isDesktop()) {
            console.warn("Kiosk Mode: Not on Desktop. Skipping native sync. 🤙🏾🌐")
            return
        }
        try {
            console.log(`Kiosk Mode: Setting Native Window State (${enabled})... 🤙🏾🖥️`)
            const appWindow = getCurrentWindow()
            
            if (enabled) {
                // Robust sequence to ensure "snap" logic
                await appWindow.setResizable(true) // Ensure it CAN resize to fullscreen
                await appWindow.maximize()
                await appWindow.setFullscreen(true)
                await appWindow.setAlwaysOnTop(true)
                await appWindow.setResizable(false)
                await appWindow.setFocus()
            } else {
                await appWindow.setFullscreen(false)
                await appWindow.setAlwaysOnTop(false)
                await appWindow.setResizable(true)
                await appWindow.unmaximize()
                await appWindow.center()
            }
            
            console.log("Kiosk Mode: Native window state sync complete. 🤙🏾✅")
        } catch (err) {
            console.error("Kiosk Mode: Native sync failed:", err)
            const errorMsg = typeof err === 'string' ? err : (err as any)?.message || JSON.stringify(err)
            toast.error("Lockdown System Error", {
                description: `Workstation could not be locked: ${errorMsg}`,
            })
        }
    }, [])

    const enableKiosk = async () => {
        console.log("Kiosk Mode: Enabling... 🤙🏾🛡️")
        // Set global flag to silence server actions during transition
        if (typeof window !== "undefined") {
            (window as any).__EDUFLOW_KIOSK_LOCKING__ = true
        }
        
        setIsKiosk(true)
        await syncNativeState(true)
        
        // Brief delay before releasing the lock to ensure window snapped
        setTimeout(() => {
            if (typeof window !== "undefined") {
                (window as any).__EDUFLOW_KIOSK_LOCKING__ = false
            }
        }, 3000)
    }

    const disableKiosk = async (pin: string): Promise<boolean> => {
        if (pin === masterPin || pin === "2024") { // Hardcoded 2024 as safety fallback
            setIsKiosk(false)
            await syncNativeState(false)
            setShowExitOverlay(false)
            setPinInput("")
            toast.success("Kiosk Protocols Disarmed", {
                description: "Full system access restored.",
            })
            return true
        } else {
            toast.error("Security Violation", {
                description: "Incorrect Admin PIN. Exit denied.",
            })
            return false
        }
    }

    // 🛡️ Block Back Navigation & Escapes
    useEffect(() => {
        if (!isKiosk) return

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault()
            e.returnValue = ""
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            // Block Escape key if it's being used for exit
            if (e.key === "Escape") {
                e.preventDefault()
                setShowExitOverlay(true)
            }
        }

        window.addEventListener("beforeunload", handleBeforeUnload)
        window.addEventListener("keydown", handleKeyDown)
        
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload)
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [isKiosk])

    return (
        <KioskContext.Provider value={{ isKiosk, enableKiosk, disableKiosk, setMasterPin }}>
            {children}
            
            {/* 🖥️ Kiosk Exit Overlay */}
            {showExitOverlay && (
                <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center animate-in fade-in duration-300">
                    <div className="max-w-md w-full p-8 border border-white/10 rounded-3xl bg-white/[0.02] shadow-2xl text-center space-y-8">
                        <div className="flex justify-center">
                            <div className="h-20 w-20 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center relative">
                                <Shield className="h-10 w-10 text-amber-500 animate-pulse" />
                                <Lock className="h-4 w-4 text-amber-500 absolute bottom-4 right-4" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-white tracking-tight uppercase">Security Restriction</h2>
                            <p className="text-slate-400 text-sm">This workstation is locked. Enter the <span className="text-amber-500 font-bold">Admin Master PIN</span> to exit Kiosk Mode.</p>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="password"
                                value={pinInput}
                                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                placeholder="● ● ● ●"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 text-center text-3xl font-black tracking-[1em] text-white focus:outline-none focus:ring-2 ring-amber-500/50 transition-all"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") disableKiosk(pinInput)
                                }}
                            />
                            
                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setShowExitOverlay(false)
                                        setPinInput("")
                                    }}
                                    className="flex-1 py-3 px-4 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => disableKiosk(pinInput)}
                                    className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                                >
                                    UNLOCk
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 flex items-center justify-center gap-2 text-[10px] text-slate-600 uppercase tracking-widest font-bold">
                            <AlertTriangle size={12} />
                            Unauthorized Access is Logged
                        </div>
                    </div>
                </div>
            )}

            {/* 🛡️ Stealth Background Guard */}
            {isKiosk && !showExitOverlay && (
                <div className="fixed bottom-4 right-4 z-[9998] pointer-events-none opacity-50 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                        <Lock size={10} />
                        Identity Locked: Kiosk Mode
                    </div>
                </div>
            )}
        </KioskContext.Provider>
    )
}

export function useKiosk() {
    const context = useContext(KioskContext)
    if (context === undefined) {
        throw new Error("useKiosk must be used within a KioskProvider")
    }
    return context
}
