"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { createInventoryVendor, updateInventoryVendor } from "@/lib/actions/inventory"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface AddVendorModalProps {
    vendor?: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AddVendorModal({ vendor, open, onOpenChange }: AddVendorModalProps) {
    const { register, handleSubmit, reset, setValue } = useForm()
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (vendor) {
            setValue("name", vendor.name)
            setValue("contact_person", vendor.contact_person)
            setValue("phone", vendor.phone)
            setValue("email", vendor.email)
            setValue("address", vendor.address)
        } else {
            reset({
                name: "",
                contact_person: "",
                phone: "",
                email: "",
                address: ""
            })
        }
    }, [vendor, setValue, reset, open])

    const onSubmit = async (data: any) => {
        setLoading(true)
        const res = vendor
            ? await updateInventoryVendor(vendor.id, data)
            : await createInventoryVendor(data)

        if (res.success) {
            toast.success(vendor ? "Vendor updated" : "Vendor added")
            reset()
            router.refresh()
            onOpenChange(false)
        } else {
            toast.error(res.error)
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{vendor ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Vendor Name</Label>
                        <Input {...register("name", { required: true })} className="bg-slate-950 border-white/10" placeholder="e.g. Acme Supplies" />
                    </div>

                    <div className="space-y-2">
                        <Label>Contact Person</Label>
                        <Input {...register("contact_person")} className="bg-slate-950 border-white/10" placeholder="e.g. John Doe" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input {...register("phone")} className="bg-slate-950 border-white/10" placeholder="080..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" {...register("email")} className="bg-slate-950 border-white/10" placeholder="vendor@example.com" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Address</Label>
                        <Textarea {...register("address")} className="bg-slate-950 border-white/10 min-h-[80px]" placeholder="Full business address..." />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading} className="bg-[var(--school-accent)]">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {vendor ? "Update Vendor" : "Save Vendor"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
