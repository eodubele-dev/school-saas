"use client"

import { useAdmissionStore } from "@/lib/stores/admission-store"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Upload, Loader2 } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export function BiodataStep() {
    const firstName = useAdmissionStore(state => state.data.firstName)
    const lastName = useAdmissionStore(state => state.data.lastName)
    const middleName = useAdmissionStore(state => state.data.middleName)
    const dob = useAdmissionStore(state => state.data.dob)
    const gender = useAdmissionStore(state => state.data.gender)
    const bloodGroup = useAdmissionStore(state => state.data.bloodGroup)
    const genotype = useAdmissionStore(state => state.data.genotype)
    const passportUrl = useAdmissionStore(state => state.data.passportUrl)

    const setData = useAdmissionStore(state => state.setData)
    const setStep = useAdmissionStore(state => state.setStep)

    const [preview, setPreview] = useState<string | null>(passportUrl)
    const [uploading, setUploading] = useState(false)
    const supabase = createClient()

    const handleNext = () => {
        if (!firstName || !lastName || !gender) {
            toast.error("Please fill in all required fields")
            return
        }
        setStep(2)
    }

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file size (e.g. 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("File size must be less than 2MB")
            return
        }

        setUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `${fileName}`

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('passports')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) throw uploadError

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('passports')
                .getPublicUrl(filePath)

            setPreview(publicUrl)
            setData({ passportUrl: publicUrl })
            toast.success("Passport uploaded successfully")
        } catch (error: any) {
            console.error(error)
            toast.error("Upload failed: " + (error.message || "Unknown error"))
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-6">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300">First Name <span className="text-red-500">*</span></Label>
                            <Input
                                value={firstName}
                                onChange={(e) => setData({ firstName: e.target.value })}
                                className="bg-slate-950 border-white/10 text-white"
                                placeholder="e.g. David"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Last Name <span className="text-red-500">*</span></Label>
                            <Input
                                value={lastName}
                                onChange={(e) => setData({ lastName: e.target.value })}
                                className="bg-slate-950 border-white/10 text-white"
                                placeholder="e.g. Okonkwo"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-slate-300">Middle Name</Label>
                        <Input
                            value={middleName}
                            onChange={(e) => setData({ middleName: e.target.value })}
                            className="bg-slate-950 border-white/10 text-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Date of Birth</Label>
                            <Input
                                type="date"
                                value={dob || ''}
                                onChange={(e) => setData({ dob: e.target.value })}
                                className="bg-slate-950 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Gender <span className="text-red-500">*</span></Label>
                            <Select value={gender} onValueChange={(val) => setData({ gender: val })}>
                                <SelectTrigger className="bg-slate-950 border-white/10 text-white transition-all duration-200 focus:border-[var(--school-accent)]">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Blood Group</Label>
                            <Select value={bloodGroup} onValueChange={(val) => setData({ bloodGroup: val })}>
                                <SelectTrigger className="bg-slate-950 border-white/10 text-white transition-all duration-200 focus:border-[var(--school-accent)]">
                                    <SelectValue placeholder="Optional" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="O+">O+</SelectItem>
                                    <SelectItem value="O-">O-</SelectItem>
                                    <SelectItem value="A+">A+</SelectItem>
                                    <SelectItem value="A-">A-</SelectItem>
                                    <SelectItem value="B+">B+</SelectItem>
                                    <SelectItem value="B-">B-</SelectItem>
                                    <SelectItem value="AB+">AB+</SelectItem>
                                    <SelectItem value="AB-">AB-</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Genotype</Label>
                            <Select value={genotype} onValueChange={(val) => setData({ genotype: val })}>
                                <SelectTrigger className="bg-slate-950 border-white/10 text-white transition-all duration-200 focus:border-[var(--school-accent)]">
                                    <SelectValue placeholder="Optional" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="AA">AA</SelectItem>
                                    <SelectItem value="AS">AS</SelectItem>
                                    <SelectItem value="SS">SS</SelectItem>
                                    <SelectItem value="AC">AC</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Photo Upload */}
                <div className="flex flex-col items-center gap-4 pt-6">
                    <div className="relative h-40 w-40 rounded-full border-2 border-dashed border-white/20 bg-slate-950 overflow-hidden flex items-center justify-center group hover:border-[var(--school-accent)] transition-colors">
                        {uploading ? (
                            <Loader2 className="h-8 w-8 text-[var(--school-accent)] animate-spin" />
                        ) : preview ? (
                            <Image src={preview} alt="Passport" fill className="object-cover" />
                        ) : (
                            <Upload className="h-8 w-8 text-slate-500" />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            disabled={uploading}
                            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            onChange={handlePhotoUpload}
                        />
                    </div>
                    <p className="text-xs text-slate-500 text-center">
                        Upload Passport<br />(White Background, Max 2MB)
                    </p>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    onClick={handleNext}
                    className="bg-[var(--school-accent)] hover:brightness-110 text-white"
                >
                    Next Step <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
