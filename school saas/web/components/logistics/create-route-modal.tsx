"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createRoute } from "@/lib/actions/logistics"
import { toast } from "sonner"
import { Bus, Plus } from "lucide-react"

export function CreateRouteModal() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const name = formData.get('name') as string
        const vehicle = formData.get('vehicle') as string
        const driver = formData.get('driver') as string

        const res = await createRoute({ name, vehicle, driver })

        if (res.success) {
            toast.success("Route Created Successfully")
            setOpen(false)
        } else {
            toast.error(res.error || "Failed to create route")
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="h-full min-h-[250px] w-full border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-white hover:border-white/20 transition-colors gap-3 bg-transparent">
                    <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center">
                        <Plus className="h-6 w-6" />
                    </div>
                    <span className="font-medium">Add New Route</span>
                </button>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Add New Transport Route</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Route Name</Label>
                        <Input name="name" placeholder="e.g. Lekki Phase 1 - Bus A" required className="bg-slate-900 border-white/10" />
                    </div>
                    <div className="space-y-2">
                        <Label>Vehicle Plate Number</Label>
                        <Input name="vehicle" placeholder="e.g. KSF-123-LG" required className="bg-slate-900 border-white/10" />
                    </div>
                    <div className="space-y-2">
                        <Label>Driver Name</Label>
                        <Input name="driver" placeholder="e.g. Mr. Sunday" required className="bg-slate-900 border-white/10" />
                    </div>
                    <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500" disabled={loading}>
                        {loading ? "Creating..." : "Create Route"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}
