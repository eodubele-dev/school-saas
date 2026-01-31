"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Database, Brain, Smartphone, ShieldCheck } from "lucide-react"

const features = [
    {
        title: "Offline-First Grades",
        description: "Input scores without internet. We auto-sync when you're back online.",
        icon: Database,
        glow: "shadow-glow-purple"
    },
    {
        title: "AI Report Cards",
        description: "Generate personalized remarks for every student in seconds using Gemini.",
        icon: Brain,
        glow: "shadow-glow-green"
    },
    {
        title: "One-Tap Attendance",
        description: "GPS-fenced attendance for staff and students. Fast & accurate.",
        icon: Smartphone,
        glow: "shadow-glow-purple"
    },
    {
        title: "Bank-Grade Security",
        description: "End-to-end encryption with Role-Based Access Control (RBAC).",
        icon: ShieldCheck,
        glow: "shadow-glow-green"
    }
]

export function FeaturesGrid() {
    return (
        <section id="features" className="py-24 relative">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold text-white mb-4">Everything You Need to <span className="text-emerald-green">Gamify Learning</span></h2>
                    <p className="text-slate-400">
                        Replace your fragmented tools with one cohesive operating system built for Nigerian schools.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((f, i) => (
                        <Card key={i} className="bg-obsidian border-white/10 hover:border-white/20 transition-all hover:-translate-y-1 duration-300 group">
                            <CardHeader>
                                <div className={`w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:${f.glow} transition-shadow duration-500`}>
                                    <f.icon className="h-6 w-6 text-white" />
                                </div>
                                <CardTitle className="text-white">{f.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-slate-400">
                                    {f.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
