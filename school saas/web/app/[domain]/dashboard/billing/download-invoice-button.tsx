"use client"

import { Button } from "@/components/ui/button"
import { Download, Loader2, FileText } from "lucide-react"
import { useState } from "react"
import { jsPDF } from "jspdf"
import { toast } from "sonner"

interface BillingRecord {
    student: {
        full_name: string
        class: { name: string }
    }
    session: string
    term: string
    breakdown: {
        tuition: number
        development: number
        books: number
        uniforms: number
    }
    total_fees: number
}

export function DownloadInvoiceButton({ billing, studentName }: { billing: any, studentName: string }) {
    const [generating, setGenerating] = useState(false)

    const handleDownload = () => {
        setGenerating(true)
        try {
            const doc = new jsPDF()

            // Header
            doc.setFontSize(24)
            doc.setTextColor(6, 182, 212) // Cyan
            doc.text("INVOICE", 105, 20, { align: "center" })

            doc.setFontSize(10)
            doc.setTextColor(100, 100, 100)
            doc.text("EduFlow International School", 105, 26, { align: "center" })

            // Decor line
            doc.setDrawColor(200, 200, 200)
            doc.setLineWidth(0.5)
            doc.line(20, 35, 190, 35)

            // Bill To
            doc.setFontSize(10)
            doc.setTextColor(150, 150, 150)
            doc.text("BILL TO:", 20, 45)

            doc.setFontSize(12)
            doc.setTextColor(40, 40, 40)
            doc.setFont("helvetica", "bold")
            doc.text(studentName.toUpperCase(), 20, 52)
            doc.setFont("helvetica", "normal")
            doc.text(`Session: ${billing.session} | ${billing.term}`, 20, 58)

            // Table Header
            let y = 75
            doc.setFillColor(245, 247, 250)
            doc.rect(20, y - 5, 170, 10, "F")
            doc.setFontSize(9)
            doc.setTextColor(100, 100, 100)
            doc.text("DESCRIPTION", 25, y + 2)
            doc.text("AMOUNT (NGN)", 185, y + 2, { align: "right" })

            y += 15

            const addRow = (label: string, amount: number) => {
                doc.setFontSize(11)
                doc.setTextColor(60, 60, 60)
                doc.text(label, 25, y)
                doc.text(amount.toLocaleString(), 185, y, { align: "right" })

                // Dotted line
                doc.setDrawColor(230, 230, 230)
                doc.setLineDash([1, 1], 0)
                doc.line(25, y + 3, 185, y + 3)
                doc.setLineDash([], 0) // reset

                y += 12
            }

            if (billing.breakdown) {
                addRow("Tuition Fees", billing.breakdown.tuition)
                addRow("Development Levy", billing.breakdown.development || billing.breakdown.bus) // Mapping for demo
                addRow("Books & Learning Materials", billing.breakdown.books || 15000)
                addRow("School Uniforms", billing.breakdown.uniforms || billing.breakdown.uniform)
            }

            // Total
            y += 10
            doc.setFillColor(6, 182, 212) // Cyan
            doc.rect(120, y - 6, 70, 12, "F")
            doc.setTextColor(255, 255, 255)
            doc.setFont("helvetica", "bold")
            doc.text("TOTAL DUE:", 125, y + 2)
            doc.text(`NGN ${billing.total_fees.toLocaleString()}`, 185, y + 2, { align: "right" })

            // Footer
            y += 40
            doc.setFontSize(8)
            doc.setTextColor(150, 150, 150)
            doc.setFont("helvetica", "italic")
            doc.text("This invoice was generated automatically. Please pay before the due date.", 105, y, { align: "center" })

            doc.save(`Invoice-${billing.session}-${billing.term}.pdf`)
            toast.success("Invoice Downloaded")
        } catch (e) {
            console.error(e)
            toast.error("Download Failed")
        } finally {
            setGenerating(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={generating}
            className="border-white/10 text-slate-400 hover:text-white hover:bg-white/5 gap-2"
        >
            {generating ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
            Download Invoice
        </Button>
    )
}
