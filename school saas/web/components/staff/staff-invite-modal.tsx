"use client"

import { useState } from "react"
import { UserPlus, Mail, Phone, Loader2, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { SignaturePad } from "@/components/ui/signature-pad"

import { createStaff } from "@/lib/actions/staff"

export function StaffInviteModal({ domain }: { domain: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "teacher",
        department: "",
        designation: "",
        signature: null as string | null
    })

    const handleInvite = async () => {
        setLoading(true)

        try {
            const res = await createStaff(formData)

            if (res.success) {
                toast.success(`Staff member created successfully!`)
                toast.info(`Temporary credentials sent to ${formData.email}`)
                if (res.tempPassword) {
                    // For demo purposes, we might show it or just say it's sent
                    console.log("Temp Password:", res.tempPassword)
                }
                setOpen(false)
                // Reset form
                setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    phone: "",
                    role: "teacher",
                    department: "",
                    designation: "",
                    signature: null
                })
            } else {
                toast.error(res.error || "Failed to invite staff")
            }
        } catch (error) {
            console.error(error)
            toast.error("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[var(--school-accent)] text-white hover:brightness-110 shadow-lg shadow-[var(--school-accent)]/20">
                    <UserPlus className="mr-2 h-4 w-4" /> Add Staff Member
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Staff Onboarding</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Create a new staff profile. Credentials will be sent securely.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>First Name</Label>
                            <Input
                                className="bg-slate-950 border-white/10"
                                value={formData.firstName}
                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Last Name</Label>
                            <Input
                                className="bg-slate-950 border-white/10"
                                value={formData.lastName}
                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                className="bg-slate-950 border-white/10 pl-9"
                                placeholder="staff@school.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Phone Number (for SMS Credentials)</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                className="bg-slate-950 border-white/10 pl-9"
                                placeholder="+234..."
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select
                                value={formData.role}
                                onValueChange={val => setFormData({ ...formData, role: val })}
                            >
                                <SelectTrigger className="bg-slate-950 border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="teacher">Teacher</SelectItem>
                                    <SelectItem value="bursar">Bursar</SelectItem>
                                    <SelectItem value="registrar">Registrar</SelectItem>
                                    <SelectItem value="driver">Driver</SelectItem>
                                    <SelectItem value="staff">Staff Assistant</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Designation</Label>
                            <Input
                                className="bg-slate-950 border-white/10"
                                placeholder="e.g. Senior Science Master"
                                value={formData.designation}
                                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Department (Optional)</Label>
                        <Input
                            className="bg-slate-950 border-white/10"
                            placeholder="e.g. Science"
                            value={formData.department}
                            onChange={e => setFormData({ ...formData, department: e.target.value })}
                        />
                    </div>

                    <div className="space-y-3 pt-2">
                        <Label className="flex items-center gap-2">
                            Digital Signature
                            <span className="text-xs text-slate-500 font-normal">(Required for reports/vouchers)</span>
                        </Label>
                        <SignaturePad
                            onEnd={(dataUrl) => setFormData(prev => ({ ...prev, signature: dataUrl }))}
                        />
                        {!formData.signature && (
                            <p className="text-xs text-amber-500/80">Please draw your signature above.</p>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => setOpen(false)} className="text-slate-400">Cancel</Button>
                    <Button
                        onClick={handleInvite}
                        disabled={loading || !formData.signature}
                        className="bg-[var(--school-accent)] text-white hover:brightness-110"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save & Send Credentials
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
