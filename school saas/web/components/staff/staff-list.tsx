"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, MoreVertical, ShieldAlert, UserCog, Mail } from "lucide-react"
import { toast } from "sonner"
import { RoleBadge } from "@/components/staff/role-badge"
import { updateStaffRole, updateStaffStatus } from "@/lib/actions/staff"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { TeacherMappingModal } from "@/components/staff/teacher-mapping-modal"
import { StaffIDCard } from "@/components/staff/staff-id-card"

export function StaffList({ initialData, domain, classes, tenant }: { initialData: any[], domain: string, classes: any[], tenant: any }) {
    const router = useRouter()
    const [staff, setStaff] = useState(initialData)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
    const [newRole, setNewRole] = useState("")
    const [loading, setLoading] = useState(false)

    const filteredStaff = staff.filter(user =>
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const openRoleModal = (user: any) => {
        setSelectedUser(user)
        setNewRole(user.role)
        setIsRoleModalOpen(true)
    }

    const handleRoleUpdate = async () => {
        if (!selectedUser) return
        setLoading(true)

        const res = await updateStaffRole(selectedUser.id, newRole)

        if (res.success) {
            toast.success("Role updated successfully")
            setStaff(prev => prev.map(u => u.id === selectedUser.id ? { ...u, role: newRole } : u))
            setIsRoleModalOpen(false)
        } else {
            toast.error(res.error || "Failed to update role")
        }
        setLoading(false)
    }

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                    placeholder="Search staff by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-900/50 border-white/10"
                />
            </div>

            {/* Staff Table */}
            <div className="rounded-md border border-white/10 bg-slate-900/50 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-900">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="text-slate-400">Staff Member</TableHead>
                            <TableHead className="text-slate-400">Role</TableHead>
                            <TableHead className="text-slate-400">Department</TableHead>
                            <TableHead className="text-slate-400">Status</TableHead>
                            <TableHead className="text-right text-slate-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStaff.map((user) => (
                            <TableRow key={user.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                <TableCell className="font-medium text-slate-200">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8 border border-white/10">
                                            <AvatarImage src={user.avatar_url} />
                                            <AvatarFallback className="bg-slate-800 text-slate-300">
                                                {user.full_name?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{user.full_name}</div>
                                            <div className="text-xs text-slate-500">{user.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <RoleBadge role={user.role} />
                                </TableCell>
                                <TableCell className="text-slate-400">
                                    {user.department || "-"}
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.status === 'active'
                                        ? "bg-green-500/10 text-green-500"
                                        : "bg-red-500/10 text-red-500"
                                        }`}>
                                        {user.status || 'Active'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-white/10 text-slate-200">
                                            <DropdownMenuLabel>Manage Staff</DropdownMenuLabel>

                                            <DropdownMenuItem onClick={() => openRoleModal(user)} className="hover:bg-white/5 cursor-pointer">
                                                <UserCog className="mr-2 h-4 w-4" /> Change Role
                                            </DropdownMenuItem>

                                            {user.role === 'teacher' && (
                                                <TeacherMappingModal teacher={user} classes={classes} />
                                            )}

                                            <StaffIDCard user={user} tenant={tenant} />

                                            <DropdownMenuItem className="hover:bg-white/5 cursor-pointer">
                                                <Mail className="mr-2 h-4 w-4" /> Resend Invite
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-white/10" />
                                            <DropdownMenuItem className="text-red-500 hover:bg-red-500/10 cursor-pointer">
                                                Deactivate Account
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Role Assignment Modal */}
            <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
                <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Staff Role</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Change role and permissions for <span className="text-white font-medium">{selectedUser?.full_name}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Select Role</label>
                            <Select value={newRole} onValueChange={setNewRole}>
                                <SelectTrigger className="bg-slate-950 border-white/10 text-white">
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

                        {newRole === 'bursar' && (
                            <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-4 flex gap-3 items-start">
                                <ShieldAlert className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-emerald-500">Security Warning</h4>
                                    <p className="text-xs text-emerald-500/80 leading-relaxed">
                                        Granting the <strong>Bursar</strong> role allows this user to view all school financial records, invoices, and Paystack transaction history.
                                    </p>
                                </div>
                            </div>
                        )}

                        {newRole === 'admin' && (
                            <div className="rounded-md bg-purple-500/10 border border-purple-500/20 p-4 flex gap-3 items-start">
                                <ShieldAlert className="h-5 w-5 text-purple-500 mt-0.5 shrink-0" />
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-purple-500">High Privilege Access</h4>
                                    <p className="text-xs text-purple-500/80 leading-relaxed">
                                        Admins have full access to all system settings, user management, and sensitive data.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsRoleModalOpen(false)} className="text-slate-400 hover:text-white">Cancel</Button>
                        <Button
                            onClick={handleRoleUpdate}
                            disabled={loading}
                            className="bg-[var(--school-accent)] text-white hover:brightness-110"
                        >
                            {loading ? "Updating..." : "Update Role"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
