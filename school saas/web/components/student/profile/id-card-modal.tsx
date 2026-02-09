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

export function IdCardModal({ student, tenant, trigger }: { student: any, tenant: any, trigger: React.ReactNode }) {
    const componentRef = useRef<HTMLDivElement>(null)
    const [open, setOpen] = useState(false)

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Student_ID_${student?.full_name?.replace(/\s+/g, '_') || 'Card'}`,
        onAfterPrint: () => {
            toast.success("ID Card queued for printing!")
        },
        onPrintError: () => toast.error("Failed to print"),
    })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="max-w-md bg-slate-950 border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-white">Student ID Card</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Preview and print your official student identification.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-center py-6 bg-slate-900/50 rounded-xl my-4">
                    {/* The ID Card is visible here, solving the ref issue */}
                    <div ref={componentRef} className="scale-90 origin-top">
                        <IdCardView student={student} tenant={tenant} />
                    </div>
                </div>

                <DialogFooter className="gap-3">
                    <Button variant="ghost" onClick={() => setOpen(false)} className="text-slate-400">
                        Close
                    </Button>
                    <Button
                        onClick={handlePrint}
                        className="bg-[var(--school-accent)] hover:bg-blue-600 text-white"
                    >
                        <Printer className="h-4 w-4 mr-2" />
                        Print Now
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
