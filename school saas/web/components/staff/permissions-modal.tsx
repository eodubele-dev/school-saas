"use client"

import { useState, useEffect } from "react"
import { Shield, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface PermissionsModalProps {
    user: any
    isOpen: boolean
    onClose: () => void
}

export function PermissionsModal({ user, isOpen, onClose }: PermissionsModalProps) {
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [permissions, setPermissions] = useState({
        can_view_financials: false,
        can_edit_results: false,
        can_send_bulk_sms: false
    })

    useEffect(() => {
        if (isOpen && user) {
            fetchPermissions()
        }
    }, [isOpen, user])

    const fetchPermissions = async () => {
        setFetching(true)
        const { data } = await supabase
            .from('staff_permissions')
            .select('*')
            .eq('staff_id', user.id)
            .single()

        if (data) {
            setPermissions({
                can_view_financials: data.can_view_financials,
                can_edit_results: data.can_edit_results,
                can_send_bulk_sms: data.can_send_bulk_sms
            })
        } else {
            // Reset if no record found (will create on save)
            setPermissions({
                can_view_financials: false,
                can_edit_results: false,
                can_send_bulk_sms: false
            })
        }
        setFetching(false)
    }

    const handleSave = async () => {
        setLoading(true)

        // Check if tenant_id is available from user object or fetching profile
        // Assuming user object maps to profile and has tenant_id or we fetch it
        // For safety, let's fetch current user's tenant to upsert efficiently or use the user's tenant if known

        // We need the tenant_id of the staff member being updated (which should be same as admin's)
        // Ideally passed in user prop or we fetch.
        // Let's assume user prop has it or linked. 
        // Actually, we should use the admin's tenant_id context, but RLS enforces that anyway.
        // Let's rely on the user.tenant_id if available, else fetch.

        let tenantId = user.tenant_id
        if (!tenantId) {
            const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single()
            tenantId = profile?.tenant_id
        }

        const { error } = await supabase
            .from('staff_permissions')
            .upsert({
                staff_id: user.id,
                tenant_id: tenantId,
                ...permissions
            }, { onConflict: 'tenant_id, staff_id' })

        if (error) {
            toast.error("Failed to update permissions")
            console.error(error)
        } else {
            toast.success("Permissions updated successfully")
            onClose()
        }
        setLoading(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-[var(--school-accent)]" />
                        Staff Permissions
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Configure granular access rights for <span className="text-white">{user?.full_name}</span>.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    {fetching ? (
                        <div className="flex justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between space-x-2">
                                <div className="space-y-0.5">
                                    <Label className="text-base text-slate-200">View Financial Records</Label>
                                    <p className="text-xs text-slate-500">Access to invoices, payments, and revenue charts.</p>
                                </div>
                                <Switch
                                    checked={permissions.can_view_financials}
                                    onCheckedChange={(c) => setPermissions({ ...permissions, can_view_financials: c })}
                                    className="data-[state=checked]:bg-emerald-600"
                                />
                            </div>

                            <div className="flex items-center justify-between space-x-2">
                                <div className="space-y-0.5">
                                    <Label className="text-base text-slate-200">Edit Published Results</Label>
                                    <p className="text-xs text-slate-500">Ability to modify student grades after approval.</p>
                                </div>
                                <Switch
                                    checked={permissions.can_edit_results}
                                    onCheckedChange={(c) => setPermissions({ ...permissions, can_edit_results: c })}
                                    className="data-[state=checked]:bg-purple-600"
                                />
                            </div>

                            <div className="flex items-center justify-between space-x-2">
                                <div className="space-y-0.5">
                                    <Label className="text-base text-slate-200">Send Bulk SMS</Label>
                                    <p className="text-xs text-slate-500">Permission to send broadcast messages to parents.</p>
                                </div>
                                <Switch
                                    checked={permissions.can_send_bulk_sms}
                                    onCheckedChange={(c) => setPermissions({ ...permissions, can_send_bulk_sms: c })}
                                    className="data-[state=checked]:bg-blue-600"
                                />
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">Cancel</Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading || fetching}
                        className="bg-[var(--school-accent)] text-white shadow-lg shadow-blue-500/20"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Permissions
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
