"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { useRef, useState } from "react"
import { useReactToPrint } from "react-to-print"
import { IdCardView } from "./id-card-view"
import { toast } from "sonner"
import { isDesktop } from "@/lib/utils/desktop"
import { printDirectly } from "@/lib/utils/printer"

export function IdCardModal({ student, tenant, trigger }: { student: any, tenant: any, trigger: React.ReactNode }) {
    const componentRef = useRef<HTMLDivElement>(null)
    const [open, setOpen] = useState(false)

    const handlePrintFallback = useReactToPrint({
        contentRef: componentRef,
    })

    const handlePrint = async () => {
        if (isDesktop() && componentRef.current) {
            const htmlContent = `
                <html>
                    <head>
                        <style>
                            body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                            .print-container { transform: scale(3); transform-origin: center; }
                        </style>
                    </head>
                    <body>
                        <div class="print-container">
                            ${componentRef.current.innerHTML}
                        </div>
                    </body>
                </html>
            `;
            await printDirectly(htmlContent, { silent: true, jobName: `Student_ID_${student?.full_name}` });
            toast.success("ID Card sent to printer! 🤙🏾📠");
        } else {
            handlePrintFallback();
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="max-w-md bg-slate-950 border-border">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Student ID Card</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Preview and print your official student identification.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-center py-6 bg-card text-card-foreground/50 rounded-xl my-4">
                    {/* The ID Card is visible here, solving the ref issue */}
                    <div ref={componentRef} className="scale-90 origin-top">
                        <IdCardView student={student} tenant={tenant} />
                    </div>
                </div>

                <DialogFooter className="gap-3">
                    <Button variant="ghost" onClick={() => setOpen(false)} className="text-muted-foreground">
                        Close
                    </Button>
                    <Button
                        onClick={handlePrint}
                        className="bg-[var(--school-accent)] hover:bg-blue-600 text-foreground"
                    >
                        <Printer className="h-4 w-4 mr-2" />
                        Print Now
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
