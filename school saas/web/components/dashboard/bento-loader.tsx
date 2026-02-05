import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { TeacherDashboard } from "@/components/dashboard/teacher-dashboard"
import { ParentDashboard } from "@/components/dashboard/parent-dashboard"
import { BursarDashboard } from "@/components/dashboard/bursar-dashboard"
import { getBursarStats } from "@/lib/actions/finance"
import { UserRole } from "@/config/sidebar"

interface BentoDashboardLoaderProps {
    user: any // Supabase User
    role: string // Role from metadata or profile
    schoolName: string
    primaryColor: string
    tier: string
    isPilot?: boolean
    smsBalance?: number
}

export async function BentoDashboardLoader({
    user,
    role,
    schoolName,
    primaryColor,
    tier,
    isPilot = false,
    smsBalance = 0
}: BentoDashboardLoaderProps) {
    const normalizedRole = role.toLowerCase()
    const normalizedTier = tier?.toLowerCase() || 'starter'

    // 1. Dynamic Header based on JWT Branding
    // Note: primaryColor is used for accenting
    const accentStyle = { color: primaryColor }

    // 2. Widget Resolution
    // In a full implementation, we would decompose dashboards into smaller widgets.
    // For now, we map the Roles to their primary Dashboard "Mega-Widget".

    let ContentComponent = null

    switch (normalizedRole) {
        case 'admin':
        case 'proprietor':
            ContentComponent = <AdminDashboard tier={normalizedTier} isPilot={isPilot} smsBalance={smsBalance} />
            break
        case 'teacher':
            ContentComponent = <TeacherDashboard tier={normalizedTier} />
            break
        case 'parent':
            ContentComponent = <ParentDashboard tier={normalizedTier} />
            break
        case 'bursar':
            const stats = await getBursarStats()
            ContentComponent = <BursarDashboard stats={stats} tier={normalizedTier} />
            break
        default:
            ContentComponent = (
                <div className="p-6 border border-red-500/30 bg-red-500/10 rounded-xl text-red-500">
                    Role configuration not found for: {role}
                </div>
            )
    }

    return (
        <div className="min-h-screen bg-[#0A0A0B] p-4 md:p-8 animate-in fade-in duration-700">
            {/* Dynamic Header */}
            <header className="mb-8 md:mb-12 border-b border-white/5 pb-6 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                            {schoolName} <span className="text-white font-light">Command Center</span>
                        </h1>
                        <p className="mt-2 font-mono text-xs tracking-widest uppercase text-slate-400">
                            Role: <span className="text-cyan-400">{role.toUpperCase()}</span> // System ID: <span className="text-white">{user.id.slice(0, 8)}</span> // Status: <span className="text-emerald-400">ACTIVE</span>
                        </p>
                        <p className="mt-1 text-sm text-slate-500 font-medium tracking-wide">
                            Real-time school performance and financial analysis
                        </p>
                    </div>

                    {/* Platinum Indicator */}
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-slate-400 font-mono uppercase">Live Connection</span>
                    </div>
                </div>
            </header>

            {/* The Bento Grid / Main Content Area */}
            {/* Currently leveraging the layouts defined inside each Dashboard, wrapped here. 
                Future optimization: Break Dashboards into <Widget /> and arrange here. 
            */}
            <main className="relative z-10">
                {ContentComponent}
            </main>

            {/* Background Texture (Subtle Noise via Data URI) */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />
            <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-slate-950 to-slate-950 pointer-events-none z-0" />
        </div>
    )
}
