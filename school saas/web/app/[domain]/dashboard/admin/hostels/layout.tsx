import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Building, Bed, ClipboardCheck, PenTool, LayoutDashboard, Package } from "lucide-react"

export default function HostelLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col h-full space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white glow-blue">Dorm-Master Suite</h1>
                    <p className="text-slate-400">Hostel Management & Security Console</p>
                </div>
            </header>

            <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="bg-slate-900 border border-white/5 p-1 w-full justify-start overflow-x-auto">
                    <Link href="/dashboard/admin/hostels">
                        <TabsTrigger value="dashboard" className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-white">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Overview
                        </TabsTrigger>
                    </Link>
                    <Link href="/dashboard/admin/hostels/allocation">
                        <TabsTrigger value="allocation" className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-white">
                            <Bed className="mr-2 h-4 w-4" />
                            Room Allocation
                        </TabsTrigger>
                    </Link>
                    <Link href="/dashboard/admin/hostels/inventory">
                        <TabsTrigger value="inventory" className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-white">
                            <Package className="mr-2 h-4 w-4" />
                            Inventory
                        </TabsTrigger>
                    </Link>
                    <Link href="/dashboard/admin/hostels/night-check">
                        <TabsTrigger value="night-check" className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-white">
                            <ClipboardCheck className="mr-2 h-4 w-4" />
                            Night Roll-Call
                        </TabsTrigger>
                    </Link>
                    <Link href="/dashboard/admin/hostels/maintenance">
                        <TabsTrigger value="maintenance" className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-white">
                            <PenTool className="mr-2 h-4 w-4" />
                            Maintenance Tickets
                        </TabsTrigger>
                    </Link>
                </TabsList>
            </Tabs>

            <div className="flex-1 bg-slate-950/50 rounded-xl border border-white/5 p-6 overflow-auto">
                {children}
            </div>
        </div>
    )
}
