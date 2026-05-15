"use client"

import { useState } from "react"
import { UserCog, Mail, Phone, Loader2, Building, BadgeCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { SignaturePad } from "@/components/ui/signature-pad"
import { updateStaffProfile } from "@/lib/actions/staff"
import { useParams } from "next/navigation"

interface StaffEditModalProps {
    user: any
    isOpen: boolean
    onClose: () => void
}

export function StaffEditModal({ user, isOpen, onClose }: StaffEditModalProps) {
    const [loading, setLoading] = useState(false)

    // Split full name safely
    const nameParts = (user?.full_name || "").split(" ")
    const initialFirstName = nameParts[0] || ""
    const initialLastName = nameParts.slice(1).join(" ")

    const [formData, setFormData] = useState({
        firstName: initialFirstName,
        lastName: initialLastName,
        phone: user?.phone || "",
        department: user?.department || "",
        designation: user?.staff_permissions?.[0]?.designation || "",
        signature: null as string | null
    })

    const router = useRouter()
    const params = useParams()
    const domain = params.domain as string

    const handleUpdate = async () => {
        setLoading(true)
        try {
            const res = await updateStaffProfile(user.id, formData, domain)

            if (res.success) {
                toast.success("Staff profile updated successfully")
                router.refresh()
                onClose()
            } else {
                toast.error(res.error || "Failed to update profile")
            }
        } catch (error) {
            console.error(error)
            toast.error("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-card text-card-foreground border-border text-foreground sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserCog className="h-5 w-5 text-[var(--school-accent)]" />
                        Edit Staff Profile
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Update personal details, department, and digital identity for <span className="text-foreground font-medium">{user?.full_name}</span>.
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
                        <Label>Phone Number</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                className="bg-slate-950 border-border pl-9"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Building className="h-3 w-3" /> Department
                            </Label>
                            <Input
                                className="bg-slate-950 border-border"
                                placeholder="e.g. Science"
                                value={formData.department}
                                onChange={e => setFormData({ ...formData, department: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <BadgeCheck className="h-3 w-3" /> Designation
                            </Label>
                            <Input
                                className="bg-slate-950 border-border"
                                placeholder="e.g. Head of Dept"
                                value={formData.designation}
                                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        <Label className="flex items-center gap-2">
                            Update Digital Signature
                            {user?.staff_permissions?.[0]?.signature_url ? (
                                <span className="text-[10px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded border border-green-500/20">Already Signed</span>
                            ) : (
                                <span className="text-[10px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20">Missing Signature</span>
                            )}
                        </Label>

                        <div className="space-y-4">
                            {user?.staff_permissions?.[0]?.signature_url && !formData.signature && (
                                <div className="h-20 w-48 border border-white/10 bg-white/5 rounded-lg p-2 flex items-center justify-center">
                                    <img src={user.staff_permissions[0].signature_url} className="h-full object-contain filter invert opacity-50" alt="Current Signature" />
                                </div>
                            )}

                            <div className="space-y-2">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Draw New Signature Below</p>
                                <SignaturePad
                                    value={formData.signature}
                                    onChange={(dataUrl: string | null) => setFormData(prev => ({ ...prev, signature: dataUrl }))}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} className="text-muted-foreground">Cancel</Button>
                    <Button
                        onClick={handleUpdate}
                        disabled={loading}
                        className="bg-[var(--school-accent)] text-foreground hover:brightness-110"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Profile
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
