"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import { useState, useEffect, ReactNode } from "react"
import { usePathname } from "next/navigation"

export function MobileNav({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()

    // Automatically close sidebar when navigation occurs
    useEffect(() => {
        setOpen(false)
    }, [pathname])

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-foreground transition-colors">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 bg-slate-950 border-border/50">
                <div className="h-full overflow-y-auto">
                    {children}
                </div>
            </SheetContent>
        </Sheet>
    )
}
