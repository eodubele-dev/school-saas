import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Palette, ArrowRight, ShieldCheck, Bell } from "lucide-react"
import Link from "next/link"
import { GeofenceConfig } from "@/components/admin/settings/geofence-config"

export default function SettingsPage({ params }: { params: { domain: string } }) {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">School Settings</h2>
                <p className="text-slate-400">Manage your school's configuration and preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* School Branding Link */}
                <Link href="/dashboard/settings/branding" className="group flex">
                    <Card className="bg-slate-900/40 border-white/5 backdrop-blur-sm group-hover:border-cyan-500/30 transition-all flex-1">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="h-12 w-12 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20">
                                <Palette className="h-6 w-6 text-cyan-400" />
                            </div>
                            <ArrowRight className="h-5 w-5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                        </CardHeader>
                        <CardContent>
                            <CardTitle className="text-white mb-2">School Branding</CardTitle>
                            <CardDescription className="text-slate-400">
                                Update logo, school name, motto, and global institutional theme colors.
                            </CardDescription>
                        </CardContent>
                    </Card>
                </Link>

                {/* Geofence Configuration */}
                <GeofenceConfig />

                {/* Notifications Placeholder */}
                <div className="opacity-50 pointer-events-none md:col-span-2">
                    <Card className="bg-slate-900/40 border-white/5 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                                <Bell className="h-6 w-6 text-blue-400" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Coming Soon</span>
                        </CardHeader>
                        <CardContent>
                            <CardTitle className="text-slate-300 mb-2">Notifications</CardTitle>
                            <CardDescription className="text-slate-500">
                                Configure email and SMS alerts for parents and staff members.
                            </CardDescription>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Bottom Info */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-blue-400/60 text-xs shadow-lg">
                <ShieldCheck className="h-4 w-4" />
                Institutional settings are only accessible to accounts with the 'Admin' role.
            </div>
        </div>
    )
}
