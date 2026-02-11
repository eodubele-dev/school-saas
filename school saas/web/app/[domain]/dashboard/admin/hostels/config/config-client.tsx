"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, Trash2, Building, Bed, Settings2, ShieldCheck, ChevronRight, Layers } from "lucide-react"
import { toast } from "sonner"
import { createBuilding, createRoom, deleteBuilding } from "@/lib/actions/hostel"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
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

export function ConfigClient({ initialBuildings }: { initialBuildings: any[] }) {
    const router = useRouter()
    const [buildings, setBuildings] = useState(initialBuildings)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null)
    const [buildingToDelete, setBuildingToDelete] = useState<string | null>(null)

    const [newBuilding, setNewBuilding] = useState({ name: "", type: "mixed" })
    const [newRoom, setNewRoom] = useState({ name: "", capacity: 4, floor: 0 })

    const handleCreateBuilding = async () => {
        if (!newBuilding.name) return toast.error("Building name is required")
        setIsSubmitting(true)
        const res = await createBuilding(newBuilding)
        setIsSubmitting(false)
        if (res.success) {
            toast.success("Hostel Building created")
            router.refresh()
        } else {
            toast.error(res.error || "Failed to create building")
        }
    }

    const handleCreateRoom = async () => {
        if (!selectedBuildingId) return
        if (!newRoom.name) return toast.error("Room name is required")

        setIsSubmitting(true)
        const res = await createRoom({ ...newRoom, buildingId: selectedBuildingId })
        setIsSubmitting(false)
        if (res.success) {
            toast.success("Room and bed spaces created")
            router.refresh()
        } else {
            toast.error(res.error || "Failed to create room")
        }
    }

    const handleDeleteBuilding = (id: string) => {
        setBuildingToDelete(id)
    }

    const confirmDeleteBuilding = async () => {
        if (!buildingToDelete) return
        const res = await deleteBuilding(buildingToDelete)
        setBuildingToDelete(null)
        if (res.success) {
            toast.success("Building deleted")
            router.refresh()
        } else {
            toast.error(res.error || "Failed to delete")
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Settings2 className="h-6 w-6 text-blue-400" />
                        Infrastructure Setup
                    </h2>
                    <p className="text-slate-400 text-sm">Define halls, rooms, and bed capacities for your school.</p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Hall
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-950 border-white/10 text-white shadow-2xl">
                        <DialogHeader>
                            <DialogTitle>Add Hostel Building</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500">Hall Name</label>
                                <Input
                                    placeholder="e.g. Platinum Boys Hall"
                                    className="bg-slate-900 border-white/10 text-white"
                                    value={newBuilding.name}
                                    onChange={(e) => setNewBuilding({ ...newBuilding, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-500">Type</label>
                                <Select onValueChange={(v) => setNewBuilding({ ...newBuilding, type: v })} defaultValue="mixed">
                                    <SelectTrigger className="bg-slate-900 border-white/10 text-white">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-950 border-white/10 text-white">
                                        <SelectItem value="male">Male Only</SelectItem>
                                        <SelectItem value="female">Female Only</SelectItem>
                                        <SelectItem value="mixed">Mixed/Co-ed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-500 mt-2"
                                onClick={handleCreateBuilding}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Creating..." : "Establish Hall"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Building List */}
                <Card className="lg:col-span-4 bg-slate-900 border-white/5 h-fit">
                    <CardHeader>
                        <CardTitle className="text-white text-lg">Halls & Dormitories</CardTitle>
                        <CardDescription className="text-slate-400">Select a hall to manage its rooms.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-white/5">
                            {initialBuildings.map((building) => (
                                <div
                                    key={building.id}
                                    className={`flex items-center justify-between p-4 cursor-pointer transition-all ${selectedBuildingId === building.id
                                        ? "bg-blue-600/10 border-l-4 border-blue-500"
                                        : "hover:bg-white/5 border-l-4 border-transparent"
                                        }`}
                                    onClick={() => setSelectedBuildingId(building.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${building.type === 'male' ? "bg-blue-500/10 text-blue-400" :
                                            building.type === 'female' ? "bg-pink-500/10 text-pink-400" :
                                                "bg-purple-500/10 text-purple-400"
                                            }`}>
                                            <Building className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">{building.name}</p>
                                            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{building.type} hall</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono text-slate-500">{building.rooms?.length || 0} Rooms</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-400/10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteBuilding(building.id);
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {initialBuildings.length === 0 && (
                                <div className="p-8 text-center text-slate-500">
                                    <Building className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm italic">No halls established yet.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Room Management */}
                <div className="lg:col-span-8 space-y-6">
                    {selectedBuildingId ? (
                        <>
                            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-white/5 shadow-lg">
                                <div className="flex items-center gap-3">
                                    <Building className="h-5 w-5 text-blue-400" />
                                    <h3 className="text-white font-bold">
                                        Managing: {initialBuildings.find(b => b.id === selectedBuildingId)?.name}
                                    </h3>
                                </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Room
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-slate-950 border-white/10 text-white">
                                        <DialogHeader>
                                            <DialogTitle>Add Room to Hall</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 pt-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase text-slate-500">Room Name/No</label>
                                                    <Input
                                                        placeholder="e.g. 101"
                                                        className="bg-slate-900 border-white/10 text-white"
                                                        value={newRoom.name}
                                                        onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase text-slate-500">Floor</label>
                                                    <Input
                                                        type="number"
                                                        className="bg-slate-900 border-white/10 text-white"
                                                        value={newRoom.floor}
                                                        onChange={(e) => setNewRoom({ ...newRoom, floor: parseInt(e.target.value) })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase text-slate-500">Bed Capacity</label>
                                                <Select
                                                    onValueChange={(v) => setNewRoom({ ...newRoom, capacity: parseInt(v) })}
                                                    defaultValue="4"
                                                >
                                                    <SelectTrigger className="bg-slate-900 border-white/10 text-white">
                                                        <SelectValue placeholder="Select capacity" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-slate-950 border-white/10 text-white">
                                                        <SelectItem value="1">1 (Single Room)</SelectItem>
                                                        <SelectItem value="2">2 (Double Room)</SelectItem>
                                                        <SelectItem value="4">4 (Quad Room)</SelectItem>
                                                        <SelectItem value="6">6 (Dormitory)</SelectItem>
                                                        <SelectItem value="8">8 (Hostel Ward)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <p className="text-[10px] text-slate-500 mt-1">Bed spaces will be automatically generated.</p>
                                            </div>
                                            <Button
                                                className="w-full bg-blue-600 hover:bg-blue-500 mt-2"
                                                onClick={handleCreateRoom}
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? "Creating..." : "Add Room & Bedspaces"}
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {initialBuildings.find(b => b.id === selectedBuildingId)?.rooms?.map((room: any) => (
                                    <Card key={room.id} className="bg-black/40 border-white/5 hover:border-blue-500/30 transition-all group overflow-hidden">
                                        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-slate-800 rounded-md">
                                                    <Layers className="h-4 w-4 text-blue-400" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-white text-md">Room {room.name}</CardTitle>
                                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                                                        Floor {room.floor}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                                {room.capacity} Beds
                                            </Badge>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-2">
                                            <div className="flex flex-wrap gap-2">
                                                {room.bunks?.map((bunk: any) => (
                                                    <div key={bunk.id} className="flex flex-col items-center gap-1">
                                                        <div className={`h-8 w-8 rounded-md flex items-center justify-center border ${bunk.student
                                                            ? "bg-green-500/20 border-green-500/30 text-green-400"
                                                            : "bg-slate-800 border-white/10 text-slate-500"
                                                            }`}>
                                                            <Bed className="h-4 w-4" />
                                                        </div>
                                                        <span className="text-[9px] text-slate-500 uppercase font-mono">{bunk.label.split(' ')[1]}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {initialBuildings.find(b => b.id === selectedBuildingId)?.rooms?.length === 0 && (
                                <div className="bg-slate-900 border border-white/5 rounded-xl p-20 text-center text-slate-500">
                                    <Layers className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                    <h4 className="text-white font-bold mb-2">Initialize Room Layout</h4>
                                    <p className="text-sm max-w-xs mx-auto mb-6">Start by adding your first room to this hall. We'll automatically generate the bed spaces for you.</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-20 text-center">
                            <div className="p-6 bg-blue-600/5 rounded-full mb-6 border border-blue-500/10 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
                                <ChevronRight className="h-12 w-12 text-blue-500/40 rotate-90" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2 glow-blue">Select Hall</h3>
                            <p className="text-slate-400 text-sm max-w-xs leading-relaxed">Choose a hall from the side to begin managing room layouts and bed spaces.</p>
                        </div>
                    )}
                </div>
            </div>
            <AlertDialog open={!!buildingToDelete} onOpenChange={(open) => !open && setBuildingToDelete(null)}>
                <AlertDialogContent className="bg-slate-950 border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            This will delete the entire building, all its rooms, and any active student allocations. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteBuilding} className="bg-red-600 hover:bg-red-700 text-white">
                            Delete Building
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${className}`}>
            {children}
        </span>
    )
}
