'use client'

import React, { useState, useEffect } from 'react'
import { Shield, DollarSign, Bell, Bus, GraduationCap, Lock } from 'lucide-react'
import { getNotificationSettings, updateNotificationSettings, getMonthlyVolumeEstimates } from '@/lib/actions/notifications'
import { toast } from 'sonner'
import { SMS_CONFIG } from '@/lib/constants/communication'

interface NotificationCategory {
    title: string
    description: string
    icon: React.ElementType
    settings: {
        key: string
        label: string
        description: string
        monthlyVolume: number
        isCritical?: boolean
    }[]
}

export function NotificationSettings() {
    const [settings, setSettings] = useState<any>(null)
    const [volumeEstimates, setVolumeEstimates] = useState<any>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        setLoading(true)
        const [settingsRes, estimates] = await Promise.all([
            getNotificationSettings(),
            getMonthlyVolumeEstimates()
        ])

        if (settingsRes.success && settingsRes.settings) {
            setSettings(settingsRes.settings)
            setVolumeEstimates(estimates)
        } else {
            toast.error('Failed to load notification settings')
        }
        setLoading(false)
    }

    const toggleSetting = async (key: string, isCritical: boolean = false) => {
        if (isCritical) {
            toast.error('System-critical alerts cannot be disabled', {
                description: 'This ensures forensic audit integrity and campus safety.'
            })
            return
        }

        const newValue = !settings[key]
        setSettings((prev: any) => ({ ...prev, [key]: newValue }))

        setSaving(true)
        const result = await updateNotificationSettings({ [key]: newValue })
        setSaving(false)

        if (result.success) {
            toast.success(`${key.replace(/_/g, ' ')} ${newValue ? 'enabled' : 'disabled'}`)
        } else {
            // Revert on error
            setSettings((prev: any) => ({ ...prev, [key]: !newValue }))
            toast.error('Failed to update settings')
        }
    }

    const calculateTotalVolume = () => {
        if (!settings || !volumeEstimates) return 0

        return Object.keys(volumeEstimates).reduce((total, key) => {
            return total + (settings[key] ? volumeEstimates[key] : 0)
        }, 0)
    }

    const categories: NotificationCategory[] = [
        {
            title: 'Financial & Revenue',
            description: 'Payment tracking and debt recovery communications',
            icon: DollarSign,
            settings: [
                {
                    key: 'fee_reminders',
                    label: 'Fee Payment Reminders',
                    description: 'Trigger "Pay-to-Unlock" links when tuition is overdue.',
                    monthlyVolume: volumeEstimates.fee_reminders || 0
                },
                {
                    key: 'payment_confirmations',
                    label: 'Payment Confirmations',
                    description: 'Instant receipt notifications for successful payments.',
                    monthlyVolume: volumeEstimates.payment_confirmations || 0
                },
                {
                    key: 'outstanding_balance_alerts',
                    label: 'Outstanding Balance Alerts',
                    description: 'Weekly reminders for unpaid balances.',
                    monthlyVolume: volumeEstimates.outstanding_balance_alerts || 0
                }
            ]
        },
        {
            title: 'Safety & Attendance',
            description: 'Campus security and student tracking',
            icon: Shield,
            settings: [
                {
                    key: 'attendance_clock_in',
                    label: 'Clock-In Alerts',
                    description: 'Notify parents when student arrives on campus.',
                    monthlyVolume: volumeEstimates.attendance_clock_in || 0
                },
                {
                    key: 'attendance_clock_out',
                    label: 'Clock-Out Alerts',
                    description: 'Notify parents when student leaves campus.',
                    monthlyVolume: volumeEstimates.attendance_clock_out || 0
                },
                {
                    key: 'absence_alerts',
                    label: 'Absence Notifications',
                    description: 'Alert parents of unexcused absences.',
                    monthlyVolume: volumeEstimates.absence_alerts || 0
                },
                {
                    key: 'security_alerts',
                    label: 'Forensic Security Alerts',
                    description: 'SYSTEM_CRITICAL: Emergency lockdowns and unauthorized access.',
                    monthlyVolume: volumeEstimates.security_alerts || 0,
                    isCritical: true
                }
            ]
        },
        {
            title: 'Academic Progress',
            description: 'Results, grades, and assignment tracking',
            icon: GraduationCap,
            settings: [
                {
                    key: 'result_published',
                    label: 'Result Publication Alerts',
                    description: 'Notify parents when term results are ready.',
                    monthlyVolume: volumeEstimates.result_published || 0
                },
                {
                    key: 'grade_updates',
                    label: 'Grade Update Notifications',
                    description: 'Alert on individual assessment grade changes.',
                    monthlyVolume: volumeEstimates.grade_updates || 0
                },
                {
                    key: 'forensic_grade_changes',
                    label: 'Forensic Grade Change Alerts',
                    description: 'SYSTEM_CRITICAL: Mandatory notification for grade modifications.',
                    monthlyVolume: volumeEstimates.forensic_grade_changes || 0,
                    isCritical: true
                }
            ]
        },
        {
            title: 'Logistics & Operations',
            description: 'Transportation and facility management',
            icon: Bus,
            settings: [
                {
                    key: 'bus_arrival_alerts',
                    label: 'Bus Arrival Notifications',
                    description: 'Alert parents when school bus is approaching pickup point.',
                    monthlyVolume: volumeEstimates.bus_arrival_alerts || 0
                },
                {
                    key: 'bus_departure_alerts',
                    label: 'Bus Departure Notifications',
                    description: 'Notify when student boards the bus for home.',
                    monthlyVolume: volumeEstimates.bus_departure_alerts || 0
                },
                {
                    key: 'maintenance_updates',
                    label: 'Facility Maintenance Updates',
                    description: 'Inform about campus closures or facility changes.',
                    monthlyVolume: volumeEstimates.maintenance_updates || 0
                }
            ]
        }
    ]

    if (loading) {
        return (
            <div className="bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 p-8 max-w-5xl mx-auto">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-white/5 rounded w-1/3" />
                    <div className="h-4 bg-white/5 rounded w-2/3" />
                </div>
            </div>
        )
    }

    return (
        <div className="bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10 p-8 max-w-5xl mx-auto">
            {/* Header */}
            <header className="mb-8 pb-6 border-b border-white/10">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Notification Engine</h2>
                        <p className="text-slate-500 text-sm mt-1">Configure automated SMS triggers to optimize your communication wallet.</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Est. Monthly Volume</p>
                        <p className="text-2xl font-bold text-cyan-400 mt-1">{calculateTotalVolume()}<span className="text-sm text-slate-500 ml-1">SMS/student</span></p>
                        <p className="text-[10px] text-slate-600 mt-1">≈ ₦{(calculateTotalVolume() * SMS_CONFIG.UNIT_COST).toLocaleString()} per student</p>
                    </div>
                </div>
            </header>

            {/* Categories */}
            <div className="space-y-8">
                {categories.map((category, idx) => (
                    <div key={idx} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                <category.icon className="h-4 w-4 text-cyan-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white tracking-tight">{category.title}</h3>
                                <p className="text-[10px] text-slate-500">{category.description}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {category.settings.map((setting) => (
                                <div
                                    key={setting.key}
                                    className={`flex items-center justify-between p-4 rounded-2xl transition-all ${setting.isCritical
                                        ? 'bg-cyan-500/5 border border-cyan-500/20'
                                        : 'bg-white/5 border border-white/5 hover:border-white/10'
                                        }`}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-white font-medium text-sm">{setting.label}</p>
                                            {setting.isCritical && (
                                                <Lock className="h-3 w-3 text-cyan-400" />
                                            )}
                                        </div>
                                        <p className={`text-xs mt-0.5 ${setting.isCritical ? 'text-cyan-400/60 font-mono' : 'text-slate-500'}`}>
                                            {setting.description}
                                        </p>
                                        <p className="text-[10px] text-slate-600 mt-1 font-mono">
                                            ~{setting.monthlyVolume} SMS/student/month
                                        </p>
                                    </div>

                                    <Toggle
                                        active={settings?.[setting.key] ?? false}
                                        onClick={() => toggleSetting(setting.key, setting.isCritical)}
                                        disabled={setting.isCritical || saving}
                                        isCritical={setting.isCritical}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Info */}
            <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5">
                    <Bell className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-white font-medium">Wallet Impact Preview</p>
                        <p className="text-xs text-slate-500 mt-1">
                            These estimates help you predict SMS costs. Actual volume varies based on student count,
                            attendance patterns, and payment behavior. System-critical alerts cannot be disabled to
                            maintain forensic audit standards.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface ToggleProps {
    active: boolean
    onClick: () => void
    disabled?: boolean
    isCritical?: boolean
}

function Toggle({ active, onClick, disabled = false, isCritical = false }: ToggleProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-12 h-6 rounded-full transition-all flex items-center px-1 shrink-0 ${isCritical
                ? 'bg-cyan-500/40 opacity-50 cursor-not-allowed'
                : active
                    ? 'bg-cyan-500 hover:bg-cyan-400'
                    : 'bg-white/10 hover:bg-white/20'
                } ${disabled && !isCritical ? 'opacity-50 cursor-wait' : ''}`}
        >
            <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${active ? 'translate-x-6' : 'translate-x-0'
                    }`}
            />
        </button>
    )
}
