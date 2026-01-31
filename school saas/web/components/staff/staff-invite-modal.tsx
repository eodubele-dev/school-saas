"use client"

import { useState } from "react"
import { UserPlus, Mail, Phone, Loader2 } from "lucide-react"
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
// import { inviteStaff } from "@/lib/actions/staff" // To be implemented

export function StaffInviteModal({ domain }: { domain: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "teacher",
        department: ""
    })

    const handleInvite = async () => {
        setLoading(true)
        // Simulate invite for now until backend action is linked
        await new Promise(resolve => setTimeout(resolve, 1500))
        toast.success(`Invitation sent to ${formData.email}!`)
        setOpen(false)
        setLoading(false)

        // Actual implementation would call inviteStaff(formData)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[var(--school-accent)] text-white hover:brightness-110 shadow-lg shadow-[var(--school-accent)]/20">
                    <UserPlus className="mr-2 h-4 w-4" /> Invite Staff
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Invite New Staff Member</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Send an invitation via Email or SMS. They will receive a temporary password.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
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
                        <Label>Phone Number (for SMS)</Label>
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
                                </SelectContent>
                            </Select>
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
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setOpen(false)} className="text-slate-400">Cancel</Button>
                    <Button
                        onClick={handleInvite}
                        disabled={loading}
                        className="bg-[var(--school-accent)] text-white hover:brightness-110"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Invite
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
