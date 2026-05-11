"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Search, MoreVertical, ShieldAlert, UserCog, Mail, ChevronLeft, ChevronRight, Shield, Plus, Check } from "lucide-react"
import { toast } from "sonner"
import { RoleBadge } from "@/components/staff/role-badge"
import { updateStaffRole, updateStaffStatus, resendStaffInvite, resetStaffPassword } from "@/lib/actions/staff"
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
import { PermissionsModal } from "@/components/staff/permissions-modal"
import { StaffEditModal } from "@/components/staff/staff-edit-modal"

export function StaffList({ initialData, domain, classes, tenant, totalPages = 1 }: { initialData: any[], domain: string, classes: any[], tenant: any, totalPages?: number }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const pathname = usePathname()

    // Server-side data is passed as initialData. We use that directly.
    const staff = initialData
    // const [staff, setStaff] = useState(initialData) // Remove local state for data, trust server
    // Actually, for instant optimistic updates on Role change, we might want local state initialized with initialData
    const [optimisticStaff, setOptimisticStaff] = useState(initialData)

    useEffect(() => {
        setOptimisticStaff(initialData)
    }, [initialData])

    const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || "")
    const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || "all")
    const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || "all")
    const [selectedUser, setSelectedUser] = useState<any>(null)
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
    const [resetData, setResetData] = useState<{ name: string, password: string } | null>(null)
    const [confirmReset, setConfirmReset] = useState<any | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false)
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false)
    const [newRole, setNewRole] = useState("")
    const [loading, setLoading] = useState(false)

    // Debounce Search & Filters
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams)
            
            if (searchQuery) params.set('query', searchQuery)
            else params.delete('query')
            
            if (roleFilter !== 'all') params.set('role', roleFilter)
            else params.delete('role')
            
            if (statusFilter !== 'all') params.set('status', statusFilter)
            else params.delete('status')
            
            params.set('page', '1') // Reset to page 1 on search/filter change
            router.replace(`${pathname}?${params.toString()}`)
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery, roleFilter, statusFilter, router, pathname])

    // Sync state with URL when it changes from outside (e.g. back button)
    useEffect(() => {
        setSearchQuery(searchParams.get('query') || "")
        setRoleFilter(searchParams.get('role') || "all")
        setStatusFilter(searchParams.get('status') || "all")
    }, [searchParams])

    // Changing specific user role locally
    const handleRoleUpdate = async () => {
        if (!selectedUser) return
        setLoading(true)

        const res = await updateStaffRole(selectedUser.id, newRole)

        if (res.success) {
            toast.success("Role updated successfully")
            setOptimisticStaff(prev => prev.map(u => u.id === selectedUser.id ? { ...u, role: newRole } : u))
            setIsRoleModalOpen(false)
        } else {
            toast.error(res.error || "Failed to update role")
        }
        setLoading(false)
    }

    const handlePageChange = (newPage: number) => {
        if (newPage < 1 || newPage > totalPages) return
        const params = new URLSearchParams(searchParams)
        params.set('page', newPage.toString())
        router.push(`${pathname}?${params.toString()}`)
    }

    const handleDeactivate = async () => {
        if (!selectedUser) return
        setLoading(true)

        try {
            const res = await updateStaffStatus(selectedUser.id, 'inactive', domain)

            if (res && res.success) {
                toast.success("Account deactivated successfully")
                setOptimisticStaff(prev => prev.map(u => u.id === selectedUser.id ? { ...u, status: 'inactive' } : u))
                setIsDeactivateModalOpen(false)
            } else {
                toast.error(res?.error || "Failed to deactivate account")
            }
        } catch (err: any) {
            console.error("[handleDeactivate Error]:", err)
            toast.error(err?.message || "An unexpected error occurred. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const currentPage = Number(searchParams.get('page')) || 1

    return (
        <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search staff by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-slate-900 border-slate-800 text-slate-200 focus:ring-slate-700"
                    />
                </div>
                
                <div className="flex gap-2 w-full md:w-auto">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-[140px] bg-slate-900 border-slate-800 text-slate-300">
                            <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="owner">Proprietor</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="bursar">Bursar</SelectItem>
                            <SelectItem value="registrar">Registrar</SelectItem>
                            <SelectItem value="staff">Other Staff</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[140px] bg-slate-900 border-slate-800 text-slate-300">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all') && (
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                                setSearchQuery("")
                                setRoleFilter("all")
                                setStatusFilter("all")
                            }}
                            className="text-slate-500 hover:text-white"
                            title="Clear Filters"
                        >
                            <Plus className="h-4 w-4 rotate-45" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Staff Table */}
            <div className="rounded-md border border-border bg-card text-card-foreground/50 overflow-hidden">
                <Table>
                    <TableHeader className="bg-card text-card-foreground">
                        <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-muted-foreground">Staff Member</TableHead>
                            <TableHead className="text-muted-foreground">Role</TableHead>
                            <TableHead className="text-muted-foreground">Department</TableHead>
                            <TableHead className="text-muted-foreground">Status</TableHead>
                            <TableHead className="text-muted-foreground">Signature</TableHead>
                            <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {optimisticStaff.length > 0 ? (
                            optimisticStaff.map((user) => (
                                <TableRow key={user.id} className="border-border/50 hover:bg-secondary/50 transition-colors">
                                    <TableCell className="font-medium text-slate-200">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8 border border-border">
                                                <AvatarImage src={user.avatar_url} />
                                                <AvatarFallback className="bg-slate-800 text-slate-300">
                                                    {user.full_name?.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{user.full_name}</div>
                                                <div className="text-xs text-muted-foreground">{user.email}</div>
                                                {user.phone && <div className="text-[10px] text-slate-600 flex items-center gap-1 mt-0.5"><span className="w-1 h-1 rounded-full bg-slate-700" />{user.phone}</div>}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <RoleBadge role={user.role} />
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
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
                                    <TableCell>
                                        {user.staff_permissions?.[0]?.signature_url ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                Signed
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-muted-foreground border border-slate-700">
                                                Pending
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-slate-800">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 bg-card text-card-foreground border-border text-slate-200">
                                                <DropdownMenuLabel>Manage Staff</DropdownMenuLabel>

                                                <DropdownMenuItem onClick={() => {
                                                    setSelectedUser(user)
                                                    setIsEditModalOpen(true)
                                                }} className="hover:bg-secondary/50 cursor-pointer">
                                                    <UserCog className="mr-2 h-4 w-4" /> Edit Profile
                                                </DropdownMenuItem>

                                                <DropdownMenuItem onClick={() => {
                                                    setSelectedUser(user)
                                                    setNewRole(user.role)
                                                    setIsRoleModalOpen(true)
                                                }} className="hover:bg-secondary/50 cursor-pointer">
                                                    <UserCog className="mr-2 h-4 w-4" /> Change Role
                                                </DropdownMenuItem>

                                                <DropdownMenuItem onClick={() => {
                                                    setSelectedUser(user)
                                                    setIsPermissionsModalOpen(true)
                                                }} className="hover:bg-secondary/50 cursor-pointer">
                                                    <ShieldAlert className="mr-2 h-4 w-4" /> Permissions & Access
                                                </DropdownMenuItem>

                                                {user.role === 'teacher' && (
                                                    <TeacherMappingModal teacher={user} classes={classes} />
                                                )}

                                                <StaffIDCard user={user} tenant={tenant} />

                                                <DropdownMenuItem onClick={() => setConfirmReset(user)} className="hover:bg-amber-500/10 text-amber-500 cursor-pointer">
                                                    <Shield className="mr-2 h-4 w-4" /> Reset & Reveal Password
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-white/10" />
                                                {user.status === 'inactive' ? (
                                                    <DropdownMenuItem onClick={async () => {
                                                        toast.promise(updateStaffStatus(user.id, 'active', domain), {
                                                            loading: 'Reactivating account...',
                                                            success: () => {
                                                                setOptimisticStaff(prev => prev.map(u => u.id === user.id ? { ...u, status: 'active' } : u))
                                                                return "Account reactivated successfully"
                                                            },
                                                            error: (err) => err.message || "Failed to reactivate"
                                                        })
                                                    }} className="text-green-500 hover:bg-green-500/10 cursor-pointer font-medium">
                                                        Reactivate Account
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedUser(user)
                                                        setIsDeactivateModalOpen(true)
                                                    }} className="text-red-500 hover:bg-red-500/10 cursor-pointer">
                                                        Deactivate Account
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No staff members found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="bg-card text-card-foreground border-border text-slate-300 hover:bg-slate-800"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="bg-card text-card-foreground border-border text-slate-300 hover:bg-slate-800"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Role Assignment Modal */}
            <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
                <DialogContent className="bg-card text-card-foreground border-border text-foreground sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Staff Role</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Change role and permissions for <span className="text-foreground font-medium">{selectedUser?.full_name}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Select Role</label>
                            <Select value={newRole} onValueChange={setNewRole}>
                                <SelectTrigger className="bg-slate-950 border-border text-foreground">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-card text-card-foreground border-border text-foreground">
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
                        <Button variant="ghost" onClick={() => setIsRoleModalOpen(false)} className="text-muted-foreground hover:text-foreground">Cancel</Button>
                        <Button
                            onClick={handleRoleUpdate}
                            disabled={loading}
                            className="bg-[var(--school-accent)] text-foreground hover:brightness-110"
                        >
                            {loading ? "Updating..." : "Update Role"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            <PermissionsModal
                user={selectedUser}
                isOpen={isPermissionsModalOpen}
                onClose={() => setIsPermissionsModalOpen(false)}
            />

            <StaffEditModal
                user={selectedUser}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />

            {/* Deactivate Account Modal */}
            <Dialog open={isDeactivateModalOpen} onOpenChange={setIsDeactivateModalOpen}>
                <DialogContent className="bg-slate-950 border-red-500/30 text-foreground sm:max-w-md shadow-2xl shadow-red-900/20">
                    <DialogHeader>
                        <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                            <ShieldAlert className="h-6 w-6 text-red-500" />
                        </div>
                        <DialogTitle className="text-center text-xl text-white">Deactivate Staff Account</DialogTitle>
                        <DialogDescription className="text-center text-slate-400 mt-2">
                            Are you absolutely sure you want to deactivate <span className="text-white font-medium">{selectedUser?.full_name}</span>?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4">
                        <div className="rounded-lg bg-red-500/5 border border-red-500/10 p-4">
                            <ul className="text-sm text-red-400/80 space-y-2 list-disc list-inside">
                                <li>They will lose access to the system immediately.</li>
                                <li>Their active sessions will be terminated.</li>
                                <li>Their historical data (results, attendance) will be preserved.</li>
                            </ul>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button 
                            variant="ghost" 
                            onClick={() => setIsDeactivateModalOpen(false)} 
                            className="text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeactivate}
                            disabled={loading}
                            className="bg-red-600 text-white hover:bg-red-700 font-medium"
                        >
                            {loading ? "Deactivating..." : "Yes, Deactivate Account"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modern Onscreen Confirmation Dialog for Reset */}
            <Dialog open={!!confirmReset} onOpenChange={(open) => !open && setConfirmReset(null)}>
                <DialogContent className="bg-slate-900 border-border text-white sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-amber-500" />
                            Security Confirmation
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 pt-2 text-base">
                            Are you sure you want to reset the password for <span className="text-white font-bold">{confirmReset?.full_name}</span>? 
                            <br /><br />
                            This will immediately <span className="text-amber-500 font-semibold">invalidate their current password</span> and generate a new one for you to share.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <Button variant="ghost" onClick={() => setConfirmReset(null)} className="text-slate-400 hover:text-white hover:bg-slate-800">
                            Cancel
                        </Button>
                        <Button 
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                            onClick={async () => {
                                const user = confirmReset;
                                setConfirmReset(null);
                                toast.promise(resetStaffPassword(user.id, tenant.id), {
                                    loading: 'Resetting password...',
                                    success: (res) => {
                                        if (res.success) {
                                            setResetData({ name: user.full_name, password: res.password! })
                                            return `Password reset successfully!`
                                        }
                                        throw new Error(res.error || "Failed to reset")
                                    },
                                    error: (err) => err.message || 'Failed to reset password'
                                })
                            }}
                        >
                            Yes, Reset Password
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reset Password Result Modal */}
            <Dialog open={!!resetData} onOpenChange={(open) => !open && setResetData(null)}>
                <DialogContent className="bg-slate-900 border-border text-white text-center sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Password Reset Successful</DialogTitle>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                        <div className="flex justify-center">
                            <div className="h-12 w-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                                <Shield className="h-6 w-6 text-amber-500" />
                            </div>
                        </div>
                        <p className="text-sm text-slate-400">
                            New password for <span className="text-white font-bold">{resetData?.name}</span>:
                        </p>
                        <div className="flex items-center gap-2 bg-black/40 p-4 rounded-lg border border-white/10">
                            <code className="flex-1 text-xl font-mono text-amber-400 tracking-wider">
                                {resetData?.password}
                            </code>
                            <Button size="icon" variant="ghost" onClick={() => {
                                navigator.clipboard.writeText(resetData?.password || "")
                                toast.success("Password copied!")
                            }}>
                                <Check className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-[10px] text-slate-500">
                            Please copy this password and send it to the staff member. This is the only time it will be shown.
                        </p>
                    </div>
                    <Button onClick={() => setResetData(null)} className="w-full bg-slate-800 hover:bg-slate-700">
                        Close
                    </Button>
                </DialogContent>
            </Dialog>
        </div >
    )
}
