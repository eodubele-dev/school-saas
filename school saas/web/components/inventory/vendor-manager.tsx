"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, MoreVertical, Edit, Trash, Mail, Phone, MapPin } from "lucide-react"
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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteInventoryVendor } from "@/lib/actions/inventory"
import { toast } from "sonner"
import { AddVendorModal } from "./add-vendor-modal"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface VendorManagerProps {
    initialVendors: any[]
}

export function VendorManager({ initialVendors }: VendorManagerProps) {
    const [vendors, setVendors] = useState(initialVendors)
    const [search, setSearch] = useState("")
    const router = useRouter()

    // Modals
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [editingVendor, setEditingVendor] = useState<any>(null)
    const [deleteVendor, setDeleteVendor] = useState<any>(null)

    // Sync with props
    useEffect(() => {
        setVendors(initialVendors)
    }, [initialVendors])

    // Derived state
    const filteredVendors = vendors.filter(v =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.contact_person?.toLowerCase().includes(search.toLowerCase())
    )

    const handleDelete = async () => {
        if (!deleteVendor) return
        const res = await deleteInventoryVendor(deleteVendor.id)
        if (res.success) {
            toast.success("Vendor deleted")
            setDeleteVendor(null)
            router.refresh()
            // Note: Since this is a client component, the UI will update when the server action 
            // revalidates the path and the page (server component) re-renders, passing fresh props.
        } else {
            toast.error(res.error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-white/5">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search vendors..."
                        className="pl-9 bg-slate-950 border-white/10 text-white placeholder:text-slate-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <Button className="bg-[var(--school-accent)] text-white" onClick={() => {
                    setEditingVendor(null)
                    setIsAddOpen(true)
                }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Vendor
                </Button>
            </div>

            <div className="rounded-xl border border-white/5 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-900 text-slate-400">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="w-[300px]">Vendor Details</TableHead>
                            <TableHead>Contact Person</TableHead>
                            <TableHead>Contact Info</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="bg-slate-950/50">
                        {filteredVendors.length > 0 ? filteredVendors.map((vendor) => (
                            <TableRow key={vendor.id} className="border-white/5 hover:bg-transparent transition-colors">
                                <TableCell>
                                    <div className="font-bold text-white">{vendor.name}</div>
                                </TableCell>
                                <TableCell className="text-slate-300">
                                    {vendor.contact_person || '-'}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1 text-xs text-slate-400">
                                        {vendor.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-3 w-3" /> {vendor.phone}
                                            </div>
                                        )}
                                        {vendor.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-3 w-3" /> {vendor.email}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-400 max-w-[200px] truncate">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-3 w-3 mt-1 shrink-0" />
                                        <span className="truncate">{vendor.address || '-'}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-slate-900 border-white/10">
                                            <DropdownMenuItem onClick={() => {
                                                setEditingVendor(vendor)
                                                setIsAddOpen(true)
                                            }} className="text-slate-300 focus:bg-slate-800 focus:text-white cursor-pointer">
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setDeleteVendor(vendor)} className="text-red-500 focus:bg-red-950/20 focus:text-red-400 cursor-pointer">
                                                <Trash className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                                    No vendors found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <AddVendorModal
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                vendor={editingVendor}
            />

            <AlertDialog open={!!deleteVendor} onOpenChange={(v) => !v && setDeleteVendor(null)}>
                <AlertDialogContent className="bg-slate-950 border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Vendor?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            Are you sure you want to delete <span className="font-bold text-white">{deleteVendor?.name}</span>?
                            This will not delete items associated with this vendor, but it will remove the vendor reference.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent text-slate-400 border-white/10 hover:bg-white/5 hover:text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white border-none">
                            Delete Vendor
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
