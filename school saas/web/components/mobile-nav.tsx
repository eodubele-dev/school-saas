"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ReactNode } from "react"

export function MobileNav({ children }: { children: ReactNode }) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-slate-400 hover:text-white transition-colors">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 bg-slate-950 border-white/5">
                <div className="h-full overflow-y-auto">
                    {children}
                </div>
            </SheetContent>
        </Sheet>
    )
}
