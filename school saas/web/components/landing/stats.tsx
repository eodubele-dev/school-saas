"use client"

import { Users, School, CheckCircle2 } from "lucide-react"

const stats = [
    { label: "Schools onboarded", value: "200+", icon: School, color: "text-blue-500" },
    { label: "Active Teachers", value: "4.5k", icon: Users, color: "text-neon-purple" },
    { label: "Uptime Guaranteed", value: "99.9%", icon: CheckCircle2, color: "text-emerald-green" },
]

export function StatsSection() {
    return (
        <section className="py-12 border-y border-white/5 bg-white/5 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="flex items-center justify-center gap-4">
                            <div className={`p-3 rounded-xl bg-obsidian border border-white/10 ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                                <p className="text-sm text-slate-400">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
