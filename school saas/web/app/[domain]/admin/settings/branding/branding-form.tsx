"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Upload, X, Loader2, Palette } from "lucide-react"

interface BrandingFormProps {
    tenant: any
    onUpdate: (data: any) => void
}

export function BrandingForm({ tenant, onUpdate }: BrandingFormProps) {
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState(tenant?.name || "")
    const [motto, setMotto] = useState(tenant?.motto || "")
    const [address, setAddress] = useState(tenant?.address || "")
    const [logo, setLogo] = useState<string | null>(tenant?.logo_url || null)
    const [accent, setAccent] = useState(tenant?.theme_config?.primary || "#06b6d4")

    const handleSave = async () => {
        setLoading(true)
        try {
            // Mock API Call
            await new Promise(r => setTimeout(r, 1000))

            onUpdate({
                name,
                motto,
                address,
                logo_url: logo,
                theme_config: { ...tenant?.theme_config, primary: accent }
            })

            toast.success("Branding Updated!", {
                description: "All parents and teachers will now see your new institutional identity."
            })
        } catch (e) {
            toast.error("Failed to update branding")
        } finally {
            setLoading(false)
        }
    }

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (readEvent) => {
                setLogo(readEvent.target?.result as string)
                onUpdate({ logo_url: readEvent.target?.result as string })
                toast.success("Logo uploaded successfully (Preview)")
            }
            reader.readAsDataURL(file)
        }
    }

    return (
        <div className="space-y-8 bg-slate-900/40 border border-white/5 p-8 rounded-2xl backdrop-blur-sm">
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Palette className="h-5 w-5 text-cyan-400" />
                    Identity Setup
                </h3>
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label className="text-slate-400">School Name</Label>
                        <Input
                            value={name}
                            onChange={e => { setName(e.target.value); onUpdate({ name: e.target.value }) }}
                            className="bg-slate-950 border-white/10 text-white placeholder:text-slate-600 focus:border-cyan-500/50"
                            placeholder="e.g. EduFlow International School"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-slate-400">School Motto</Label>
                        <Input
                            value={motto}
                            onChange={e => { setMotto(e.target.value); onUpdate({ motto: e.target.value }) }}
                            className="bg-slate-950 border-white/10 text-white placeholder:text-slate-600 focus:border-cyan-500/50"
                            placeholder="e.g. Excellence in Character & Learning"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-slate-400">Official Address</Label>
                        <Textarea
                            value={address}
                            onChange={e => { setAddress(e.target.value); onUpdate({ address: e.target.value }) }}
                            className="bg-slate-950 border-white/10 text-white placeholder:text-slate-600 focus:border-cyan-500/50"
                            placeholder="Enter full school address..."
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <Label className="text-slate-400">Institutional Logo</Label>
                <div className="relative group overflow-hidden rounded-xl border-2 border-dashed border-white/10 bg-slate-950/50 p-8 transition-colors hover:border-cyan-500/30">
                    {logo ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative h-24 w-24 rounded-full border-[3px] border-cyan-500/30 p-1 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                                <img src={logo} className="h-full w-full rounded-full object-cover" />
                                <button
                                    onClick={() => setLogo(null)}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-400 transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                            <span className="text-xs text-slate-500">Logo Ready. Click to replace.</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <div className="p-4 rounded-full bg-cyan-500/5 text-cyan-500">
                                <Upload className="h-8 w-8" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-white font-medium">Drag and drop or click</p>
                                <p className="text-xs text-slate-500">PNG, JPG up to 2MB</p>
                            </div>
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleLogoUpload}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <Label className="text-slate-400">Brand Accent Color</Label>
                <div className="flex gap-4">
                    <ColorOption active={accent === "#3b82f6"} color="#3b82f6" label="Electric Blue" onClick={() => { setAccent("#3b82f6"); onUpdate({ theme_config: { ...tenant?.theme_config, primary: "#3b82f6" } }) }} />
                    <ColorOption active={accent === "#06b6d4"} color="#06b6d4" label="Cyan" onClick={() => { setAccent("#06b6d4"); onUpdate({ theme_config: { ...tenant?.theme_config, primary: "#06b6d4" } }) }} />
                    <ColorOption active={accent === "#10b981"} color="#10b981" label="Emerald Green" onClick={() => { setAccent("#10b981"); onUpdate({ theme_config: { ...tenant?.theme_config, primary: "#10b981" } }) }} />
                </div>
            </div>

            <Button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-12 shadow-lg shadow-cyan-950/20"
            >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Apply Branding Globally
            </Button>
        </div>
    )
}

function ColorOption({ color, active, onClick, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`group flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${active ? 'border-white/20 bg-white/5' : 'border-transparent hover:bg-white/5'}`}
        >
            <div
                className={`h-6 w-6 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-transform group-hover:scale-110 ${active ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}`}
                style={{ backgroundColor: color }}
            />
            <span className={`text-[10px] uppercase tracking-wider font-bold ${active ? 'text-white' : 'text-slate-500'}`}>{label}</span>
        </button>
    )
}
