import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"

export default function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: { domain: string }
}) {
    console.log('[DashboardLayout] params:', params)

    return (
        <div className="flex h-screen w-full bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
            <Sidebar domain={params?.domain} className="hidden md:flex border-r border-slate-800" />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Navbar domain={params?.domain} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-950">
                    {children}
                </main>
            </div>
        </div>
    )
}
