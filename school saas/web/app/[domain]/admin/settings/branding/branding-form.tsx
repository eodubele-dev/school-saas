"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Upload, X, Loader2, Palette, ShieldCheck } from "lucide-react"

interface BrandingFormProps {
    tenant: Record<string, unknown>
    onUpdate: (data: Record<string, unknown>) => void
}

export function BrandingForm({ tenant, onUpdate }: BrandingFormProps) {
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState((tenant?.name as string) || "")
    const [motto, setMotto] = useState((tenant?.motto as string) || "")
    const [address, setAddress] = useState((tenant?.address as string) || "")
    const [logo, setLogo] = useState<string | null>((tenant?.logo_url as string) || null)
    const [accent, setAccent] = useState(((tenant?.theme_config as Record<string, unknown>)?.primary as string) || "#06b6d4")

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
                theme_config: { ...(tenant?.theme_config as Record<string, unknown>), primary: accent }
            })

            toast.success("Branding Updated!", {
                description: "All parents and teachers will now see your new institutional identity."
            })
        } catch (_e) {
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
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 bg-slate-900/40 border border-white/5 p-8 rounded-2xl backdrop-blur-sm shadow-2xl relative overflow-hidden">
            {/* 💎 Decorative Background Glow */}
            <div
                className="absolute -top-24 -right-24 w-64 h-64 blur-[120px] rounded-full pointer-events-none opacity-20 transition-colors duration-500"
                style={{ backgroundColor: accent }}
            />

            {/* 📁 Left Column: Identity Setup (Scrollable) */}
            <div className="flex flex-col h-full min-h-0">
                <div className="flex items-center gap-2 mb-6">
                    <div
                        className="p-2 rounded-lg bg-white/5 border border-white/10"
                        style={{ color: accent }}
                    >
                        <Palette className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">Identity Setup</h3>
                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-0.5">Core Institutional Data</p>
                    </div>
                </div>

                {/* Internal Scroll Area Area */}
                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-6 custom-scrollbar scroll-smooth">
                    <div className="space-y-2 group">
                        <Label className="text-slate-400 group-focus-within:text-white transition-colors flex items-center gap-2">
                            School Name
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 font-mono">REQUIRED</span>
                        </Label>
                        <Input
                            value={name}
                            onChange={e => { setName(e.target.value); onUpdate({ name: e.target.value }) }}
                            className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-offset-0 h-11 transition-all"
                            style={{ ['--tw-ring-color' as any]: accent }}
                            placeholder="e.g. EduFlow International School"
                        />
                    </div>

                    <div className="space-y-2 group">
                        <Label className="text-slate-400 group-focus-within:text-white transition-colors">School Motto</Label>
                        <Input
                            value={motto}
                            onChange={e => { setMotto(e.target.value); onUpdate({ motto: e.target.value }) }}
                            className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-offset-0 h-11 transition-all"
                            style={{ ['--tw-ring-color' as any]: accent }}
                            placeholder="e.g. Excellence in Character & Learning"
                        />
                    </div>

                    <div className="space-y-2 group">
                        <Label className="text-slate-400 group-focus-within:text-white transition-colors">Official Address</Label>
                        <Textarea
                            value={address}
                            onChange={e => { setAddress(e.target.value); onUpdate({ address: e.target.value }) }}
                            className="bg-slate-950/50 border-white/10 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-offset-0 min-h-[120px] transition-all"
                            style={{ ['--tw-ring-color' as any]: accent }}
                            placeholder="Enter full school address..."
                        />
                    </div>
                </div>
            </div>

            {/* 🎨 Right Column: Visual Assets & Branding */}
            <div className="space-y-8 lg:border-l lg:border-white/5 lg:pl-8 flex flex-col justify-between">
                <div>
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase tracking-widest">
                            <span>Institutional Logo</span>
                        </div>

                        <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-white/10 bg-slate-950/50 p-8 transition-all hover:border-white/20">
                            {logo ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div
                                        className="relative h-28 w-28 rounded-2xl border-[3px] p-1.5 shadow-2xl transition-all duration-500"
                                        style={{ borderColor: `${accent}4d`, boxShadow: `0 0 30px ${accent}1a` }}
                                    >
                                        <div className="h-full w-full rounded-xl overflow-hidden bg-slate-900 border border-white/5">
                                            <img src={logo} className="h-full w-full object-contain p-2" />
                                        </div>
                                        <button
                                            onClick={() => setLogo(null)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-xl hover:bg-red-400 transition-colors z-10"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4 py-4">
                                    <div
                                        className="p-4 rounded-2xl bg-white/5"
                                        style={{ color: accent }}
                                    >
                                        <Upload className="h-8 w-8" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-white font-medium">Upload Crest</p>
                                        <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">PNG or JPG</p>
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
                        <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase tracking-widest">
                            <span>Interface Theme</span>
                        </div>
                        <div className="flex gap-4 p-4 rounded-xl bg-slate-950/30 border border-white/5">
                            <ColorOption active={accent === "#3b82f6"} color="#3b82f6" label="Electric" onClick={() => { setAccent("#3b82f6"); onUpdate({ theme_config: { ...(tenant?.theme_config as Record<string, unknown>), primary: "#3b82f6" } }) }} />
                            <ColorOption active={accent === "#06b6d4"} color="#06b6d4" label="Cyan" onClick={() => { setAccent("#06b6d4"); onUpdate({ theme_config: { ...(tenant?.theme_config as Record<string, unknown>), primary: "#06b6d4" } }) }} />
                            <ColorOption active={accent === "#10b981"} color="#10b981" label="Emerald" onClick={() => { setAccent("#10b981"); onUpdate({ theme_config: { ...(tenant?.theme_config as Record<string, unknown>), primary: "#10b981" } }) }} />
                        </div>
                    </div>
                </div>

                <div className="pt-8">
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full text-white font-bold h-14 shadow-2xl transition-all active:scale-[0.98] rounded-xl overflow-hidden group relative"
                        style={{ backgroundColor: accent }}
                    >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {loading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <ShieldCheck className="mr-2 h-5 w-5" />
                        )}
                        <span className="uppercase tracking-widest text-xs font-bold">Deploy Branding Architecture</span>
                    </Button>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    )
}

interface ColorOptionProps {
    color: string
    active: boolean
    onClick: () => void
    label: string
}

function ColorOption({ color, active, onClick, label }: ColorOptionProps) {
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
