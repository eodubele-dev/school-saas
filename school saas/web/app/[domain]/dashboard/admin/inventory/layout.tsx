import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { LayoutDashboard, Package, FileText, Truck, AlertTriangle } from "lucide-react"

export default function InventoryLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col h-full space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white glow-blue">Zero-Leakage Inventory</h1>
                    <p className="text-slate-400">Supply Chain & Requisitions Control</p>
                </div>
            </header>

            <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="bg-slate-900 border border-white/5 p-1 w-full justify-start overflow-x-auto">
                    <Link href="/dashboard/admin/inventory">
                        <TabsTrigger value="dashboard" className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-white">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Overview
                        </TabsTrigger>
                    </Link>
                    <Link href="/dashboard/admin/inventory/stock">
                        <TabsTrigger value="stock" className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-white">
                            <Package className="mr-2 h-4 w-4" />
                            Stock Management
                        </TabsTrigger>
                    </Link>
                    <Link href="/dashboard/admin/inventory/requisitions">
                        <TabsTrigger value="requisitions" className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-white">
                            <FileText className="mr-2 h-4 w-4" />
                            Requisitions
                        </TabsTrigger>
                    </Link>
                    <Link href="/dashboard/admin/inventory/vendors">
                        <TabsTrigger value="vendors" className="data-[state=active]:bg-[var(--school-accent)] data-[state=active]:text-white">
                            <Truck className="mr-2 h-4 w-4" />
                            Vendors
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
