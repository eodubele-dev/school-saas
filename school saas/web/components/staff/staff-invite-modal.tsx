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

export function StaffInviteModal({ domain, tenantId }: { domain: string, tenantId: string }) {
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
        signature: null as string | null,
        password: "" // Optional manual password
    })
    const [createdCredentials, setCreatedCredentials] = useState<{ email: string, password: string } | null>(null)

    const handleInvite = async () => {
        setLoading(true)

        try {
            const res = await createStaff(formData, tenantId)

            if (res.success) {
                toast.success(`Staff profile created successfully!`)
                
                // Detailed Delivery Feedback
                if (res.smsStatus === 'sent' && res.emailStatus === 'sent') {
                    toast.info("Welcome credentials sent via SMS and Email.")
                } else {
                    if (res.smsStatus === 'failed') toast.error(`SMS Failed: ${res.smsError}`, { duration: 6000 })
                    if (res.emailStatus === 'failed') toast.error(`Email Failed: ${res.emailError}`, { duration: 6000 })
                    if (res.smsStatus === 'sent') toast.info(`SMS sent successfully.`)
                    if (res.emailStatus === 'sent') toast.info(`Email sent successfully.`)
                }

                if (res.tempPassword) {
                    setCreatedCredentials({
                        email: formData.email,
                        password: res.tempPassword
                    })
                } else {
                    setOpen(false)
                }
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
                <Button className="bg-[var(--school-accent)] text-foreground hover:brightness-110 shadow-lg shadow-[var(--school-accent)]/20">
                    <UserPlus className="mr-2 h-4 w-4" /> Add Staff Member
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-card text-card-foreground border-border text-foreground sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                {createdCredentials ? (
                    <div className="space-y-6 py-6 text-center">
                        <div className="flex justify-center">
                            <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center">
                                <Shield className="h-8 w-8 text-green-500" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold">Staff Created Successfully!</h3>
                            <p className="text-muted-foreground">Automated credentials might have been delayed. Please copy these details manually.</p>
                        </div>

                        <div className="bg-slate-950 border border-border rounded-xl p-6 space-y-4 text-left">
                            <div className="space-y-1">
                                <Label className="text-xs uppercase text-muted-foreground">Login Email</Label>
                                <div className="flex items-center gap-2">
                                    <Input readOnly value={createdCredentials.email} className="bg-slate-900 border-none h-12 text-lg font-mono" />
                                    <Button size="icon" variant="secondary" onClick={() => {
                                        navigator.clipboard.writeText(createdCredentials.email)
                                        toast.success("Email copied!")
                                    }}>
                                        <Mail className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs uppercase text-muted-foreground">Temporary Password</Label>
                                <div className="flex items-center gap-2">
                                    <Input readOnly value={createdCredentials.password} className="bg-slate-900 border-none h-12 text-lg font-mono text-green-400" />
                                    <Button size="icon" variant="secondary" onClick={() => {
                                        navigator.clipboard.writeText(createdCredentials.password)
                                        toast.success("Password copied!")
                                    }}>
                                        <Shield className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="pt-2">
                                <p className="text-[10px] text-muted-foreground text-center">
                                    Login URL: https://{domain}.eduflow.ng/login
                                </p>
                            </div>
                        </div>

                        <Button 
                            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => {
                                setOpen(false)
                                setCreatedCredentials(null)
                                setFormData({
                                    firstName: "",
                                    lastName: "",
                                    email: "",
                                    phone: "",
                                    role: "teacher",
                                    department: "",
                                    designation: "",
                                    signature: null,
                                    password: ""
                                })
                            }}
                        >
                            Done & Close
                        </Button>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Staff Onboarding</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                Create a new staff profile. Credentials will be sent securely.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>First Name</Label>
                                    <Input
                                        className="bg-slate-950 border-border"
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input
                                        className="bg-slate-950 border-border"
                                        value={formData.lastName}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="bg-slate-950 border-border pl-9"
                                        placeholder="staff@school.com"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Phone Number (for SMS Credentials)</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="bg-slate-950 border-border pl-9"
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
                                        <SelectTrigger className="bg-slate-950 border-border">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card text-card-foreground border-border text-foreground">
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
                                        className="bg-slate-950 border-border"
                                        placeholder="e.g. Senior Science Master"
                                        value={formData.designation}
                                        onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Department (Optional)</Label>
                                    <Input
                                        className="bg-slate-950 border-border"
                                        placeholder="e.g. Science"
                                        value={formData.department}
                                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Custom Password (Optional)</Label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="text"
                                            className="bg-slate-950 border-border pl-9"
                                            placeholder="Leave blank for random"
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <Label className="flex items-center gap-2">
                                    Digital Signature
                                    <span className="text-xs text-muted-foreground font-normal">(Required for reports/vouchers)</span>
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
                            <Button variant="ghost" onClick={() => setOpen(false)} className="text-muted-foreground">Cancel</Button>
                            <Button
                                onClick={handleInvite}
                                disabled={loading || !formData.signature}
                                className="bg-[var(--school-accent)] text-foreground hover:brightness-110"
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save & Send Credentials
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
