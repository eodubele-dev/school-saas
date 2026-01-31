"use client"

import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useState } from "react"
import { jsPDF } from "jspdf"
import { toast } from "sonner"

export function DownloadReceiptButton({ payment, studentName }: { payment: any, studentName: string }) {
    const [generating, setGenerating] = useState(false)

    const handleDownload = () => {
        setGenerating(true)
        try {
            const doc = new jsPDF()

            // Header
            doc.setFontSize(22)
            doc.setTextColor(40, 40, 40)
            doc.text("EduFlow Receipt", 105, 20, { align: "center" })

            doc.setFontSize(10)
            doc.setTextColor(100, 100, 100)
            doc.text("Official Payment Receipt", 105, 26, { align: "center" })

            // Decor line
            doc.setDrawColor(6, 182, 212) // Cyan
            doc.setLineWidth(1)
            doc.line(20, 35, 190, 35)

            // Details
            doc.setFontSize(12)
            doc.setTextColor(60, 60, 60)

            let y = 50
            const addRow = (label: string, value: string) => {
                doc.setFont("helvetica", "bold")
                doc.text(label, 20, y)
                doc.setFont("helvetica", "normal")
                doc.text(value, 100, y)
                y += 10
            }

            addRow("Student Name:", studentName)
            addRow("Transaction Date:", new Date(payment.date).toLocaleDateString())
            addRow("Reference:", payment.reference || "N/A")
            addRow("Payment Method:", payment.method.toUpperCase())
            addRow("Status:", "SUCCESS")

            y += 10
            // Amount Box
            doc.setFillColor(240, 253, 244) // Emerald 50
            doc.rect(20, y, 170, 20, "F")
            doc.setFontSize(16)
            doc.setTextColor(21, 128, 61) // Emerald 700
            doc.setFont("helvetica", "bold")
            doc.text(`AMOUNT PAID: NGN ${payment.amount.toLocaleString()}`, 105, y + 13, { align: "center" })

            // Footer
            y += 40
            doc.setFontSize(10)
            doc.setTextColor(150, 150, 150)
            doc.setFont("helvetica", "italic")
            doc.text("Thank you for your payment.", 105, y, { align: "center" })
            doc.text("Generatd by EduFlow School Management System", 105, y + 5, { align: "center" })

            doc.save(`Receipt-${payment.reference || "Transaction"}.pdf`)
            toast.success("Receipt Downloaded")
        } catch (e) {
            console.error(e)
            toast.error("Download Failed")
        } finally {
            setGenerating(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            disabled={generating}
            className="h-8 px-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
        >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        </Button>
    )
}
