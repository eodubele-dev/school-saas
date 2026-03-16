"use client"

import { useEffect, useState, useRef } from "react"
import confetti from "canvas-confetti"
import { Button } from "@/components/ui/button"
import { Download, CheckCircle, ArrowRight } from "lucide-react"
import { useAdmissionStore } from "@/lib/stores/admission-store"
import { useReactToPrint } from "react-to-print"
import { AdmissionLetter } from "@/components/admissions/admission-letter"
import { isDesktop } from "@/lib/utils/desktop"
import { printDirectly } from "@/lib/utils/printer"
import { toast } from "sonner"

export function SuccessCard({
    onClose,
    tenant
}: {
    onClose: () => void,
    tenant: any
}) {
    const { data } = useAdmissionStore()
    const contentRef = useRef<HTMLDivElement>(null)
    const handlePrintFallback = useReactToPrint({
        contentRef,
    })

    const handlePrint = async () => {
        if (isDesktop() && contentRef.current) {
            const htmlContent = `
                <html>
                    <head>
                        <style>
                            body { margin: 0; padding: 20px; font-family: serif; }
                        </style>
                    </head>
                    <body>
                        ${contentRef.current.innerHTML}
                    </body>
                </html>
            `;
            await printDirectly(htmlContent, { silent: true, jobName: `Admission_Letter_${data.firstName}` });
            toast.success("Admission Letter sent to printer! 🤙🏾📠");
        } else {
            handlePrintFallback();
        }
    }

    useEffect(() => {
        // Trigger confetti
        const duration = 3 * 1000
        const animationEnd = Date.now() + duration
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now()
            if (timeLeft <= 0) return clearInterval(interval)

            const particleCount = 50 * (timeLeft / duration)
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
        }, 250)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            {/* Hidden for screen, visible for print via react-to-print */}
            <div className="hidden">
                <AdmissionLetter
                    ref={contentRef}
                    data={data}
                    tenant={tenant}
                />
            </div>

            <div className="bg-card text-card-foreground border border-border rounded-2xl p-8 max-w-md w-full text-center space-y-6 relative overflow-hidden my-8">
                <div className="mx-auto h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                </div>

                <h2 className="text-2xl font-bold text-foreground tracking-tight">Admission Successful!</h2>
                <div className="space-y-1">
                    <p className="text-muted-foreground">
                        <span className="text-foreground font-semibold">{data.firstName} {data.lastName}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Official record created for {tenant?.name}</p>
                </div>

                <div className="grid gap-3 pt-4">
                    <Button
                        onClick={handlePrint}
                        className="bg-[var(--school-accent)] hover:brightness-110 text-foreground w-full h-12 text-base font-bold shadow-lg shadow-[var(--school-accent)]/20"
                    >
                        <Download className="mr-2 h-5 w-5" /> Print Admission Letter
                    </Button>
                    <Button variant="ghost" onClick={onClose} className="text-muted-foreground hover:text-foreground hover:bg-secondary/50 font-medium transition-colors">
                        Admit Another Student
                    </Button>
                </div>
            </div>
        </div>
    )
}
