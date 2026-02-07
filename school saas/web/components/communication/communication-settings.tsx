"use client"

import { useState, useEffect } from "react"
import { Bell, MessageSquare, CreditCard, ShieldCheck, Loader2, Save } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getCommunicationSettings, updateCommunicationSettings, getWalletBalance } from "@/lib/actions/communication"

export function CommunicationSettingsView() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState<any>(null)
    const [userRole, setUserRole] = useState<string | null>(null)
    const [walletBalance, setWalletBalance] = useState(0)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const [settingsRes, walletRes] = await Promise.all([
                getCommunicationSettings(),
                getWalletBalance()
            ])

            if (settingsRes.success) {
                setSettings(settingsRes.data)
                setUserRole(settingsRes.role)
            }
            if (walletRes.success) {
                setWalletBalance(walletRes.balance)
            }
        } catch (error) {
            console.error("Load data error:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleToggle = async (key: string, value: boolean) => {
        const newSettings = { ...settings, [key]: value }
        setSettings(newSettings)

        const res = await updateCommunicationSettings({ [key]: value })
        if (!res.success) {
            toast.error("Failed to update setting")
            setSettings(settings) // Rollback
        }
    }

    const isAdmin = userRole === 'admin' || userRole === 'principal' || userRole === 'bursar'

    if (loading) return (
        <div className="h-96 flex flex-col items-center justify-center gap-4 text-slate-500">
            <Loader2 className="h-10 w-10 animate-spin text-[var(--school-accent)]" />
            <p className="text-sm font-mono animate-pulse">Syncing Communication Posture...</p>
        </div>
    )

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-white/5 pb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Communication Settings</h1>
                    <p className="text-slate-400 text-sm mt-1">Configure automated triggers for the Lagos Pilot branches.</p>
                </div>

                {isAdmin && (
                    <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4 group hover:border-cyan-500/50 transition-all duration-500 cursor-help">
                        <div className="text-right">
                            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">SMS_Wallet_Balance</p>
                            <p className="text-xl font-bold text-cyan-400 font-mono tracking-tighter">
                                ₦{walletBalance.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-2 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-colors">
                            <CreditCard className="text-cyan-400" size={24} />
                        </div>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 gap-8 max-w-4xl">
                {/* 🎭 Behavioral Triggers */}
                <section className="bg-slate-900/50 rounded-3xl p-8 border border-white/5 hover:border-purple-500/30 transition-all duration-500">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-purple-500/10 rounded-xl">
                            <Bell className="text-purple-400" size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Behavioral Recognition</h2>
                    </div>

                    <div className="space-y-8">
                        <SettingToggle
                            label="Instant Badge Notifications"
                            description="Emma Johnson just received the Leadership Badge!"
                            isItalic
                            checked={settings?.badge_notifications_enabled}
                            onCheckedChange={(v: boolean) => handleToggle('badge_notifications_enabled', v)}
                        />
                        <SettingToggle
                            label="Gradebook Updates"
                            description="Notify parents when new scores are finalized."
                            checked={settings?.gradebook_updates_enabled}
                            onCheckedChange={(v: boolean) => handleToggle('gradebook_updates_enabled', v)}
                        />
                        <SettingToggle
                            label="Character Development Reports"
                            description="Termly delivery of the Parent Portal gallery summary."
                            checked={settings?.character_reports_enabled}
                            onCheckedChange={(v: boolean) => handleToggle('character_reports_enabled', v)}
                        />
                    </div>
                </section>

                {/* 🛡️ Operational & Security */}
                <section className="bg-slate-900/50 rounded-3xl p-8 border border-white/5 hover:border-emerald-500/30 transition-all duration-500">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-emerald-500/10 rounded-xl">
                            <MessageSquare className="text-emerald-400" size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Operational & Security</h2>
                    </div>

                    <div className="space-y-8">
                        <SettingToggle
                            label="Absence Alerts (Real-Time)"
                            description="Instant notification if a student is marked Absent."
                            checked={settings?.absence_alerts_enabled}
                            onCheckedChange={(v: boolean) => handleToggle('absence_alerts_enabled', v)}
                        />
                        <SettingToggle
                            label="Geofence Failure (Staff Only)"
                            description="Toggle Out of Bounds alerts for principal check-ins."
                            checked={settings?.geofence_failure_alerts_enabled}
                            onCheckedChange={(v: boolean) => handleToggle('geofence_failure_alerts_enabled', v)}
                        />
                        <SettingToggle
                            label="System Integrity Logs"
                            description="Security & Audit summary delivery to Proprietor."
                            checked={settings?.system_integrity_logs_enabled}
                            onCheckedChange={(v: boolean) => handleToggle('system_integrity_logs_enabled', v)}
                        />
                    </div>
                </section>

                {/* 📉 Revenue Recovery - ADMIN ONLY */}
                {isAdmin && (
                    <section className="bg-slate-900/50 rounded-3xl p-8 border border-white/5 hover:border-amber-500/30 transition-all duration-500">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-amber-500/10 rounded-xl">
                                <ShieldCheck className="text-amber-400" size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-white">Revenue & Receipts</h2>
                        </div>

                        <div className="space-y-8">
                            <SettingToggle
                                label="Automated Fee Nudges"
                                description="Scheduled reminders for balances over ₦100,000."
                                checked={settings?.fee_reminders_enabled}
                                onCheckedChange={(v: boolean) => handleToggle('fee_reminders_enabled', v)}
                            />
                            <SettingToggle
                                label="Transaction Receipts"
                                description="Automated confirmation for reconciled payments."
                                checked={settings?.transaction_receipts_enabled}
                                onCheckedChange={(v: boolean) => handleToggle('transaction_receipts_enabled', v)}
                            />
                        </div>
                    </section>
                )}
            </div>

            <div className="pt-8 text-center">
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em]">
                    PLATINUM_SECURITY_ENFORCED // SYSTEM_ID_{settings?.tenant_id?.slice(0, 8)} // ROLE_{userRole?.toUpperCase()}
                </p>
            </div>
        </div>
    )
}

function SettingToggle({ label, description, isItalic, checked, onCheckedChange }: any) {
    return (
        <div className="flex justify-between items-center group/item">
            <div className="space-y-1">
                <p className="font-bold text-slate-200 group-hover/item:text-white transition-colors">{label}</p>
                <p className={`text-xs text-slate-500 ${isItalic ? 'italic' : ''}`}>{description}</p>
            </div>
            <Switch
                checked={checked}
                onCheckedChange={onCheckedChange}
                className="data-[state=checked]:bg-cyan-500"
            />
        </div>
    )
}
