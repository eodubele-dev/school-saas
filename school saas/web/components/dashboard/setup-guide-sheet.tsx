"use client"

import { useState } from "react"
import { Sparkles, Rocket, School, Users, Banknote, ShieldCheck, ChevronRight, CheckCircle2 } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Step {
    title: string
    note: string
    why: string
    icon: any
    link: string
    actionText: string
}

const ONBOARDING_STEPS: Step[] = [
    {
        title: "Identity & Branding",
        note: "First impressions matter. Let’s make this dashboard feel like home.",
        why: "This personalizes the portal for your staff, parents, and students, ensuring the school's identity is reflected on every invoice and report card.",
        icon: Sparkles,
        link: "/dashboard/settings",
        actionText: "Upload Logo & Colors"
    },
    {
        title: "Academic Pulse",
        note: "Every school needs a clock. Let’s set yours.",
        why: "The system uses this 'Active Session' to anchor all future records, from student attendance to exam results.",
        icon: Rocket,
        link: "/dashboard/admin/setup/academic",
        actionText: "Set Academic Session"
    },
    {
        title: "Structural Blueprint",
        note: "Define the rooms in your digital building.",
        why: "You cannot admit students without having classes to put them in. This step builds the directory for your entire institution.",
        icon: School,
        link: "/dashboard/admin/setup/academic",
        actionText: "Create Classes & Levels"
    },
    {
        title: "Staff & Faculty",
        note: "Empower your team to help you manage.",
        why: "Delegating access early allows teachers to start preparing lesson plans and bursars to begin configuring fee structures.",
        icon: Users,
        link: "/dashboard/admin/staff",
        actionText: "Add Teachers"
    },
    {
        title: "Financial Architecture",
        note: "Ensure the school stays profitable and organized.",
        why: "This automates your billing. Once students are admitted, the system will instantly generate their invoices.",
        icon: Banknote,
        link: "/dashboard/admin/finance/config",
        actionText: "Configure Fee Structure"
    },
    {
        title: "Communication & Wallet",
        note: "Keep the conversation going with parents.",
        why: "Real-time notifications are the #1 feature parents value. Having a funded wallet ensures they receive instant alerts.",
        icon: ShieldCheck,
        link: "/dashboard/settings/notifications",
        actionText: "Top up SMS Wallet"
    }
]

export function SetupGuideSheet() {
    const [open, setOpen] = useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="hidden lg:flex bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
                >
                    Setup Guide
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md bg-slate-950 border-l border-slate-800 overflow-y-auto p-0">
                <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 p-6 pb-4">
                    <SheetHeader>
                        <SheetTitle className="text-2xl font-black text-white flex items-center gap-2">
                            Quick Setup Guide
                            <Sparkles className="h-5 w-5 text-amber-400" />
                        </SheetTitle>
                        <SheetDescription className="text-slate-400">
                            Follow these 6 essential steps to get your institution fully operational on the platform.
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <div className="p-6 space-y-8">
                    <div className="relative border-l-2 border-slate-800 ml-4 pl-8 space-y-12">
                        {ONBOARDING_STEPS.map((step, index) => {
                            const Icon = step.icon
                            return (
                                <div key={index} className="relative group">
                                    {/* Timeline Node */}
                                    <div className="absolute -left-[41px] top-0 h-8 w-8 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center group-hover:border-blue-500 group-hover:bg-blue-500/20 transition-colors">
                                        <span className="text-xs font-bold text-slate-500 group-hover:text-blue-400">{index + 1}</span>
                                    </div>
                                    
                                    <div className="space-y-3 -mt-1">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-200">{step.title}</h3>
                                        </div>
                                        
                                        <p className="text-sm font-medium text-slate-300">
                                            {step.note}
                                        </p>
                                        
                                        <p className="text-xs text-slate-500 italic leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                                            "{step.why}"
                                        </p>
                                        
                                        <Button 
                                            asChild 
                                            size="sm" 
                                            className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_-3px_rgba(59,130,246,0.5)]"
                                            onClick={() => {
                                                setOpen(false)
                                                // Trigger the sidebar highlight
                                                setTimeout(() => {
                                                    window.dispatchEvent(new CustomEvent('tour-step', { detail: { href: step.link } }))
                                                }, 300)
                                            }}
                                        >
                                            <Link href={step.link}>
                                                {step.actionText}
                                                <ChevronRight className="h-4 w-4 ml-2" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
