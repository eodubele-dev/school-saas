"use client"

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Building2, Globe, Mail } from "lucide-react"
import { createTenant } from "@/lib/actions/onboarding"
import { toast } from "sonner"

interface AdminProvisionModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function AdminProvisionModal({ open, onOpenChange, onSuccess }: AdminProvisionModalProps) {
    const [loading, setLoading] = React.useState(false)
    const [data, setData] = React.useState({
        schoolName: '',
        subdomain: '',
        email: ''
    })

    const handleProvision = async () => {
        setLoading(true)
        try {
            const payload = {
                schoolName: data.schoolName,
                subdomain: data.subdomain,
                email: data.email,
                brandColor: '#0066FF',
                plan: 'pilot',
                fullName: 'Administrator',
                levels: ['nursery', 'primary', 'jss', 'sss'],
                waecStats: true,
                nerdcPresets: true
            }

            const res = await createTenant(payload)
            if (res.success) {
                toast.success("School provisioned successfully!")
                onSuccess()
                onOpenChange(false)
                setData({ schoolName: '', subdomain: '', email: '' })
            } else {
                toast.error(res.error || "Provisioning failed")
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-950 border-slate-800 text-slate-100 sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2 text-blue-400">
                        <Building2 className="w-5 h-5" /> Provision New School
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Initialize a new institutional database and domain context.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-mono uppercase tracking-wider text-slate-500">Official School Name</Label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-600" />
                            <Input 
                                placeholder="e.g. Ristmas International" 
                                value={data.schoolName}
                                onChange={(e) => {
                                    const val = e.target.value
                                    const slug = val.toLowerCase().replace(/[^a-z0-9]/g, '-')
                                    setData(prev => ({ ...prev, schoolName: val, subdomain: slug }))
                                }}
                                className="bg-slate-900 border-slate-800 pl-10 focus:ring-blue-500 h-11"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-mono uppercase tracking-wider text-slate-500">Domain Slug</Label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-600" />
                            <Input 
                                placeholder="e.g. christmas-intl" 
                                value={data.subdomain}
                                onChange={(e) => setData(prev => ({ ...prev, subdomain: e.target.value }))}
                                className="bg-slate-900 border-slate-800 pl-10 focus:ring-blue-500 h-11"
                            />
                            <div className="absolute right-3 top-3 text-[10px] font-mono text-slate-600">.eduflow.ng</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-mono uppercase tracking-wider text-slate-500">Owner/Admin Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-600" />
                            <Input 
                                type="email"
                                placeholder="admin@school.com" 
                                value={data.email}
                                onChange={(e) => setData(prev => ({ ...prev, email: e.target.value }))}
                                className="bg-slate-900 border-slate-800 pl-10 focus:ring-blue-500 h-11"
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                        <p className="text-[11px] text-amber-400/80 leading-relaxed italic">
                            Provisioning will create an isolated tenant environment. The owner will receive an activation email once the instance is ready.
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading} className="text-slate-400">Cancel</Button>
                    <Button 
                        onClick={handleProvision} 
                        disabled={loading || !data.schoolName || !data.subdomain || !data.email}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-lg shadow-blue-600/20"
                    >
                        {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Building2 className="mr-2 h-4 w-4" />}
                        Provision School
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
