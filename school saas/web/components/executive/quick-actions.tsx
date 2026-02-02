'use client'

import { Button } from "@/components/ui/button"
import { Plus, MessageSquare, Calculator, FileText } from "lucide-react"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function QuickActions() {
    const handleAction = (action: string) => {
        toast.info(action, {
            description: "This executive feature is coming soon."
        })
    }

    return (
        <div className="fixed bottom-6 right-6 z-40">
            <div className="bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/20 p-2 flex flex-col gap-2 items-center group transition-all duration-300">
                {/* Expanded Menu */}
                <div className="flex flex-col gap-2 mb-2">
                    <TooltipProvider delayDuration={0}>
                        <div className="flex items-center gap-3 flex-row-reverse group/item">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={() => handleAction("Broadcast to Staff")}
                                        size="icon"
                                        variant="ghost"
                                        className="h-10 w-10 rounded-full hover:bg-black/20 text-black"
                                    >
                                        <MessageSquare className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="bg-slate-900 text-amber-500 border-amber-500/20">
                                    <p>Broadcast to Staff</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        <div className="flex items-center gap-3 flex-row-reverse group/item">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={() => handleAction("View Bank Reconciliation")}
                                        size="icon"
                                        variant="ghost"
                                        className="h-10 w-10 rounded-full hover:bg-black/20 text-black"
                                    >
                                        <Calculator className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="bg-slate-900 text-amber-500 border-amber-500/20">
                                    <p>Bank Reconciliation</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        <div className="flex items-center gap-3 flex-row-reverse group/item">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={() => handleAction("Generate Financial Report")}
                                        size="icon"
                                        variant="ghost"
                                        className="h-10 w-10 rounded-full hover:bg-black/20 text-black"
                                    >
                                        <FileText className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="bg-slate-900 text-amber-500 border-amber-500/20">
                                    <p>Financial Report</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </TooltipProvider>
                </div>

                {/* Main Trigger (Visual Only, since menu is open by default or hover-based in this design) */}
                {/* 
                  Actually, for a mobile view, a click-to-toggle is better than hover.
                  But preserving the current simple "group-hover" style requested?
                  The user said "popup nothing happens". 
                  Let's make it simple: Always show them for now or use the tooltips. 
                  Given it's mobile, tooltips appear on long press usually. 
                  Let's add visible labels next to them if we want to be super clear?
                  No, tooltips are fine, but let's make sure the Buttons WORK.
               */}
                <Button size="icon" className="h-12 w-12 rounded-full bg-black/10 hover:bg-black/20 text-black shadow-none pointer-events-none">
                    <Plus className="h-6 w-6" />
                </Button>
            </div>
        </div>
    )
}
