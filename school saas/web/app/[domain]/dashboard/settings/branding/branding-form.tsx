"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Upload, X, Loader2, Palette, Star } from "lucide-react"
import { updateTenantBranding } from "@/lib/actions/tenant"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { TopBarPreview } from "./top-bar-preview"

interface BrandingFormProps {
    tenant: any
    onUpdate: (data: any) => void
}

export function BrandingForm({ tenant, onUpdate }: BrandingFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState(tenant?.name || "")
    const [motto, setMotto] = useState(tenant?.motto || "")
    const [address, setAddress] = useState(tenant?.address || "")
    const [logo, setLogo] = useState<string | null>(tenant?.logo_url || null)

    // Default to cyan if not set
    const defaultColor = tenant?.theme_config?.primary || "#06b6d4"
    const [accent, setAccent] = useState(defaultColor)
    const [uploading, setUploading] = useState(false)

    // Helper to upload Logo to Supabase Storage via Server Action (RLS Bypass)
    const uploadLogoToStorage = async (file: File): Promise<string | null> => {
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('tenantId', tenant.id)

            // Dynamic import to avoid potential circular/build issues in some environments
            const { uploadTenantLogo } = await import("@/lib/actions/tenant")
            const result = await uploadTenantLogo(formData)

            if (!result.success) throw new Error(result.error)
            return result.url || null
        } catch (error: any) {
            console.error("Logo upload failed:", error)
            toast.error(`Logo upload failed: ${error.message || 'Server error'}`)
            return null
        }
    }

    const handleSave = async () => {
        console.log('[BrandingForm] handleSave initiated', {
            tenantId: tenant?.id,
            accent,
            logoPresent: !!logo
        });
        setLoading(true)
        try {
            console.log('[BrandingForm] Calling updateTenantBranding...');
            const result = await updateTenantBranding(tenant.id, {
                name,
                motto,
                address,
                theme_config: { ...tenant?.theme_config, primary: accent },
                logo_path: logo || undefined
            })

            if (!result.success) throw new Error(result.error)

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

            // Refresh layout to update sidebar and global theme
            router.refresh()
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to update branding")
        } finally {
            setLoading(false)
        }
    }

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // 1. Immediate Preview
        const reader = new FileReader()
        reader.onload = (readEvent) => {
            setLogo(readEvent.target?.result as string)
            onUpdate({ logo_url: readEvent.target?.result as string }) // Optimistic update
        }
        reader.readAsDataURL(file)

        // 2. Background Upload
        setUploading(true)
        const publicUrl = await uploadLogoToStorage(file)
        if (publicUrl) {
            setLogo(publicUrl)
            onUpdate({ logo_url: publicUrl })
            toast.success("Logo uploaded & ready to save")
        }
        setUploading(false)
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-700">
            {/* Left Column: Verification & Preview (Sticky) */}
            <div className="xl:sticky xl:top-8 h-fit space-y-8 order-2 xl:order-1">
                <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl backdrop-blur-sm">
                    <TopBarPreview
                        name={name}
                        logo={logo}
                        motto={motto}
                        accent={accent}
                    />
                </div>

                <div className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl backdrop-blur-sm space-y-4">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500" />
                        Asset Generation
                    </h4>

                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded border border-white/10 bg-slate-950 flex items-center justify-center overflow-hidden relative">
                            {/* Favicon Preview */}
                            {logo ? (
                                <img src={logo} className="h-8 w-8 object-contain" />
                            ) : (
                                <div className="h-6 w-6 rounded-full" style={{ backgroundColor: accent }} />
                            )}
                            <div className="absolute top-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-slate-950"></div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-white">Browser Favicon</p>
                            <p className="text-xs text-slate-500">Auto-generated 32x32px icon for browser tabs.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Controls */}
            <div className="space-y-8 bg-slate-900/40 border border-white/5 p-8 rounded-2xl backdrop-blur-sm order-1 xl:order-2">
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Palette className="h-5 w-5 text-[var(--school-accent)]" />
                        Identity Setup
                    </h3>
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label className="text-slate-400">School Name</Label>
                            <Input
                                value={name}
                                onChange={e => { setName(e.target.value); onUpdate({ name: e.target.value }) }}
                                className="bg-slate-950 border-white/10 text-white placeholder:text-slate-600 focus:border-[var(--school-accent)]/50"
                                placeholder="e.g. EduFlow International School"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-400">Institutional Slogan</Label>
                            <Input
                                value={motto}
                                onChange={e => { setMotto(e.target.value); onUpdate({ motto: e.target.value }) }}
                                className="bg-slate-950 border-white/10 text-white placeholder:text-slate-600 focus:border-[var(--school-accent)]/50"
                                placeholder="e.g. Knowledge, Discipline, and Service"
                                maxLength={100}
                            />
                            <p className="text-[10px] text-slate-500 text-right">{motto.length}/100</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-400">Official Address</Label>
                            <Textarea
                                value={address}
                                onChange={e => { setAddress(e.target.value); onUpdate({ address: e.target.value }) }}
                                className="bg-slate-950 border-white/10 text-white placeholder:text-slate-600 focus:border-[var(--school-accent)]"
                                placeholder="Enter full school address..."
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="text-slate-400">Institutional Logo</Label>
                    <div className="relative group overflow-hidden rounded-xl border-2 border-dashed border-white/10 bg-slate-950/50 p-8 transition-colors hover:border-[var(--school-accent)]/30">
                        {uploading && (
                            <div className="absolute inset-0 z-20 bg-black/60 flex items-center justify-center">
                                <Loader2 className="h-6 w-6 text-[var(--school-accent)] animate-spin" />
                            </div>
                        )}
                        {logo ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative h-24 w-24 rounded-full border-[3px] border-[var(--school-accent)]/30 p-1 shadow-[0_0_20px_rgba(var(--school-accent-rgb),0.2)]">
                                    <img src={logo} className="h-full w-full rounded-full object-cover" />
                                    <button
                                        onClick={() => setLogo(null)}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-400 transition-colors z-30"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                                <span className="text-xs text-slate-500">Logo Ready. Live Preview Updated.</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3">
                                <div className="p-4 rounded-full bg-[var(--school-accent)]/5 text-[var(--school-accent)]">
                                    <Upload className="h-8 w-8" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-white font-medium">Drag and drop or click</p>
                                    <p className="text-xs text-slate-500">PNG, JPG, WebP (Min 512px)</p>
                                </div>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            onChange={handleLogoUpload}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <Label className="text-slate-400">Brand Accent Color</Label>
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-4 items-center">
                            <Input
                                type="color"
                                value={accent}
                                onChange={(e) => {
                                    const newColor = e.target.value
                                    setAccent(newColor)
                                    onUpdate({ theme_config: { ...tenant?.theme_config, primary: newColor } })
                                }}
                                className="h-12 w-24 p-1 bg-slate-950 border-white/10 cursor-pointer"
                            />
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium text-white">Custom Hex Color</p>
                                <p className="text-xs text-slate-500">Pick any color to match your brand guidelines.</p>
                            </div>
                        </div>

                        {/* Native Color Picker for maximum compatibility */}
                        <div className="flex items-center gap-4 border border-white/10 p-3 rounded-lg bg-slate-950/50">
                            <input
                                type="color"
                                value={accent}
                                onChange={(e) => {
                                    const newColor = e.target.value
                                    setAccent(newColor)
                                    onUpdate({ theme_config: { ...tenant?.theme_config, primary: newColor } })
                                }}
                                className="h-10 w-20 cursor-pointer bg-transparent border-none p-0"
                            />
                            <div className="text-xs font-mono text-slate-400 uppercase">{accent}</div>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={handleSave}
                    disabled={loading || uploading}
                    className="w-full text-white font-bold h-12 shadow-lg transition-all"
                    style={{
                        backgroundColor: 'var(--school-accent)',
                        boxShadow: '0 0 20px rgba(var(--school-accent-rgb), 0.2)'
                    }}
                >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Broadcast New Identity
                </Button>
            </div>
        </div>
    )
}
