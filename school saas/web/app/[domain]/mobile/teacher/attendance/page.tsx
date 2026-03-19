"use client"

import { MobileShell } from "@/components/mobile/mobile-shell"
import { Card } from "@/components/ui/card"
import { Users } from "lucide-react"

export default function MobileAttendancePage({ params }: { params: { domain: string } }) {
    return (
        <MobileShell domain={params.domain}>
            <div className="space-y-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-10 w-10 text-emerald-500" />
                </div>
                <h2 className="text-white font-bold text-2xl">Attendance Log</h2>
                <p className="text-slate-400 max-w-[250px]">Detailed attendance history and analytics are being synchronized from the cloud.</p>
                <Card className="p-4 bg-slate-900 border-border/50 text-slate-300 text-sm">
                    Coming Soon in Phase 2
                </Card>
            </div>
        </MobileShell>
    )
}
