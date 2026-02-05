'use client'

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2, Upload } from "lucide-react"
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

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 bg-[#0A0A0B] p-8 rounded-3xl border border-white/10">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Establish Your Identity</h2>
                <p className="text-gray-400">Upload your school crest and define your brand colors.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Logo Upload Area */}
                <div className="flex flex-col items-center gap-4 w-full md:w-auto">
                    <div className="w-48 h-48 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center bg-black/40 hover:border-[#00F5FF]/50 transition-all cursor-pointer group relative overflow-hidden">
                        {/* Hidden Input for file */}
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                    // In real app, upload here or store file
                                    // For now, simulating presence
                                    updateData('logo', file.name)
                                }
                            }}
                        />
                        {data.logo ? (
                            <div className="text-center p-4">
                                <span className="text-3xl mb-2 block">✅</span>
                                <p className="text-xs text-emerald-400 font-mono break-all">{data.logo}</p>
                            </div>
                        ) : (
                            <>
                                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🏫</span>
                                <p className="text-xs text-gray-500 font-mono">UPLOAD_CREST.SVG</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Form Fields */}
                <div className="flex-1 space-y-6 w-full">
                    <div className="grid gap-2">
                        <Label className="text-slate-400">School Name</Label>
                        <Input
                            placeholder="e.g. Springfield International School"
                            value={data.schoolName}
                            onChange={(e) => updateData('schoolName', e.target.value)}
                            className="bg-white/5 border-white/10 text-white focus:border-[#00F5FF]/50"
                        />
                    </div>

                    <div className="grid gap-2 relative">
                        <Label className="text-slate-400">Subdomain (Dashboard URL)</Label>
                        <div className="relative">
                            <Input
                                placeholder="springfield"
                                className="pr-32 bg-white/5 border-white/10 text-white focus:border-[#00F5FF]/50"
                                value={data.subdomain}
                                onChange={(e) => {
                                    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                                    updateData('subdomain', val)
                                }}
                            />
                            <div className="absolute right-3 top-2.5 text-sm text-slate-500">
                                .eduflow.ng
                            </div>
                        </div>
                        {checking ? (
                            <div className="text-xs text-blue-400 flex items-center gap-1 mt-1">
                                <Loader2 className="h-3 w-3 animate-spin" /> Checking availability...
                            </div>
                        ) : available === true ? (
                            <div className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                                <CheckCircle2 className="h-3 w-3" /> Available!
                            </div>
                        ) : available === false ? (
                            <div className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                                <XCircle className="h-3 w-3" /> Taken, try another.
                            </div>
                        ) : null}
                    </div>

                    {/* Platinum Color Picker */}
                    <div>
                        <label className="block text-sm font-mono text-cyan-400 mb-2 tracking-widest uppercase">Platinum Accent Color</label>
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                            <input
                                type="color"
                                value={data.brandColor || '#00F5FF'}
                                onChange={(e) => updateData('brandColor', e.target.value)}
                                className="w-12 h-12 bg-transparent cursor-pointer rounded-lg overflow-hidden border-none"
                            />
                            <div className="flex flex-col">
                                <span className="text-white font-mono uppercase">{data.brandColor || '#00F5FF'}</span>
                                <span className="text-xs text-slate-500">Primary UI Emphasis</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Button
                onClick={onNext}
                className="w-full bg-[#0066FF] hover:bg-blue-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-500/20"
                disabled={!available || !data.schoolName}
            >
                Initialize Campus Environment
            </Button>
        </div>
    )
}
