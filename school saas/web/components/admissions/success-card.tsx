"use client"

import { useEffect, useState } from "react"
import confetti from "canvas-confetti"
import { Button } from "@/components/ui/button"
import { Download, CheckCircle, ArrowRight } from "lucide-react"
import { jsPDF } from "jspdf"
import { useAdmissionStore } from "@/lib/stores/admission-store"

export function SuccessCard({ onClose }: { onClose: () => void }) {
    const { data } = useAdmissionStore()
    const [generating, setGenerating] = useState(false)

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

    const downloadLetter = () => {
        setGenerating(true)
        const doc = new jsPDF()

        // Simple Logo Placeholder
        doc.setFillColor(6, 182, 212) // Cyan base
        doc.rect(0, 0, 210, 40, 'F')

        doc.setTextColor(255, 255, 255)
        doc.setFontSize(24)
        doc.text("EduFlow International", 105, 25, { align: "center" })

        doc.setTextColor(0, 0, 0)
        doc.setFontSize(16)
        doc.text("PROVISIONAL ADMISSION LETTER", 105, 60, { align: "center" })

        doc.setFontSize(12)
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 80)
        doc.text(`Dear Parent/Guardian,`, 20, 95)

        doc.text(`We are pleased to offer admission to ${data.firstName} ${data.lastName} into the class structure of our institution.`, 20, 110, { maxWidth: 170 })

        doc.text(`Admission Number: ${data.admissionNumber}`, 20, 130)
        doc.text(`Class Assigned: ${data.classId}`, 20, 140) // Ideally map ID to name
        doc.text(`House: ${data.house || 'N/A'}`, 20, 150)

        doc.save(`${data.firstName}_Admission_Letter.pdf`)
        setGenerating(false)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center space-y-6 relative overflow-hidden">
                <div className="mx-auto h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-10 w-10 text-green-500" />
                </div>

                <h2 className="text-2xl font-bold text-white">Welcome to the Family!</h2>
                <p className="text-slate-400">
                    <span className="text-white font-semibold">{data.firstName}</span> has been successfully admitted.
                </p>

                <div className="grid gap-3">
                    <Button
                        onClick={downloadLetter}
                        disabled={generating}
                        className="bg-[var(--school-accent)] text-white w-full"
                    >
                        {generating ? "Generating..." : <><Download className="mr-2 h-4 w-4" /> Download Admission Letter</>}
                    </Button>
                    <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">
                        Admit Another Student
                    </Button>
                </div>
            </div>
        </div>
    )
}
