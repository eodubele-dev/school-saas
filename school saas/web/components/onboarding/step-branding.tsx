'use client'

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, XCircle, Loader2, LayoutDashboard, Palette } from "lucide-react"
import { checkSubdomainAvailability } from "@/lib/actions/onboarding"

interface StepBrandingProps {
    data: any
    updateData: (key: string, value: any) => void
    onNext: () => void
}

export function StepBranding({ data, updateData, onNext }: StepBrandingProps) {
    const [checking, setChecking] = useState(false)
    const [available, setAvailable] = useState<boolean | null>(null)

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (data.subdomain && data.subdomain.length > 2) {
                setChecking(true)
                const isAvailable = await checkSubdomainAvailability(data.subdomain)
                setAvailable(isAvailable)
                setChecking(false)
            } else {
                setAvailable(null)
            }
        }, 800)
        return () => clearTimeout(timer)
    }, [data.subdomain])

    const colors = [
        { name: "Blue Horizon", hex: "#2563eb" },
        { name: "Emerald Edu", hex: "#059669" },
        { name: "Purple Future", hex: "#7c3aed" },
        { name: "Royal Gold", hex: "#d97706" },
        { name: "Crimson Academy", hex: "#dc2626" },
    ]

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label>School Name</Label>
                    <Input
                        placeholder="e.g. Springfield International School"
                        value={data.schoolName}
                        onChange={(e) => updateData('schoolName', e.target.value)}
                    />
                </div>

                <div className="grid gap-2 relative">
                    <Label>Subdomain (Your Dashboard URL)</Label>
                    <div className="relative">
                        <Input
                            placeholder="springfield"
                            className="pr-32"
                            value={data.subdomain}
                            onChange={(e) => {
                                const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                                updateData('subdomain', val)
                            }}
                        />
                        <div className="absolute right-3 top-2.5 text-sm text-slate-400">
                            .eduflow.ng
                        </div>
                    </div>
                    {checking ? (
                        <div className="text-xs text-blue-500 flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" /> Checking availability...
                        </div>
                    ) : available === true ? (
                        <div className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Available!
                        </div>
                    ) : available === false ? (
                        <div className="text-xs text-red-500 flex items-center gap-1">
                            <XCircle className="h-3 w-3" /> Taken, try another.
                        </div>
                    ) : null}
                </div>

                <div className="grid gap-2">
                    <Label>Brand Color</Label>
                    <div className="flex gap-3 flex-wrap">
                        {colors.map((c) => (
                            <button
                                key={c.hex}
                                onClick={() => updateData('brandColor', c.hex)}
                                className={`h-8 w-8 rounded-full border-2 transition-all ${data.brandColor === c.hex ? 'border-black scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: c.hex }}
                                title={c.name}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Live Preview */}
            <Card className="bg-slate-50 border-dashed border-2 p-4">
                <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                    <LayoutDashboard className="h-3 w-3" /> Dashboard Preview
                </div>
                <div className="flex gap-4">
                    {/* Sidebar Preview */}
                    <div className="w-12 h-32 rounded-lg flex flex-col items-center py-2 gap-2" style={{ backgroundColor: '#0f172a' }}>
                        <div className="h-6 w-6 rounded bg-white/10 text-[8px] flex items-center justify-center text-white">Logo</div>
                        <div className="h-1 w-6 bg-white/10 rounded" />
                        <div className="h-1 w-6 bg-white/10 rounded" />
                        <div className="mt-auto h-4 w-4 bg-white/10 rounded-full" />
                    </div>
                    {/* Main Content Preview */}
                    <div className="flex-1 space-y-2">
                        <div className="h-8 w-full bg-white rounded border shadow-sm flex items-center px-2 justify-between">
                            <span className="text-[10px] font-bold" style={{ color: data.brandColor }}>
                                {data.schoolName || 'Your School'}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="h-20 bg-white rounded border shadow-sm p-2 flex flex-col justify-between">
                                <div className="h-6 w-6 rounded-full bg-opacity-10 flex items-center justify-center" style={{ backgroundColor: `${data.brandColor}20` }}>
                                    <Palette className="h-3 w-3" style={{ color: data.brandColor }} />
                                </div>
                                <div className="h-2 w-12 bg-slate-100 rounded" />
                            </div>
                            <div className="h-20 bg-white rounded border shadow-sm" />
                        </div>
                    </div>
                </div>
            </Card>

            <Button onClick={onNext} className="w-full" disabled={!available || !data.schoolName}>
                Continue to Academic Setup
            </Button>
        </div>
    )
}
