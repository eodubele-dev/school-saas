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

export function DownloadInvoiceButton({ 
    billing, 
    studentName,
    schoolName,
    logoUrl,
    principalSignature
}: { 
    billing: any, 
    studentName: string,
    schoolName: string,
    logoUrl: string,
    principalSignature: string
}) {
    const [generating, setGenerating] = useState(false)

    const handleDownload = async () => {
        setGenerating(true)
        try {
            const doc = new jsPDF()
            const accentColor = [15, 23, 42] // Slate 900
            const secondaryColor = [100, 116, 139] // Slate 500

            // Background Header Decoration
            doc.setFillColor(accentColor[0], accentColor[1], accentColor[2])
            doc.rect(0, 0, 210, 40, "F")

            // Logo or School Name in Header
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(22)
            doc.setFont("helvetica", "bold")
            doc.text(schoolName.toUpperCase(), 20, 25)
            
            doc.setFontSize(9)
            doc.setFont("helvetica", "normal")
            doc.text("OFFICIAL FEE INVOICE", 20, 32)

            // Invoice Meta (Top Right)
            doc.setFontSize(9)
            doc.text(`DATE: ${new Date().toLocaleDateString()}`, 190, 20, { align: "right" })
            doc.text(`SESSION: ${billing.session}`, 190, 25, { align: "right" })
            doc.text(`TERM: ${billing.term.toUpperCase()}`, 190, 30, { align: "right" })

            // Bill To Section
            let y = 60
            doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
            doc.setFontSize(10)
            doc.setFont("helvetica", "bold")
            doc.text("BILL TO:", 20, y)
            
            doc.setTextColor(30, 41, 59)
            doc.setFontSize(14)
            doc.text(studentName.toUpperCase(), 20, y + 8)
            
            doc.setFontSize(10)
            doc.setFont("helvetica", "normal")
            doc.text(`ID: STU-${studentName.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`, 20, y + 14)

            // Table Header
            y = 90
            doc.setFillColor(248, 250, 252) // Slate 50
            doc.rect(20, y - 6, 170, 12, "F")
            
            doc.setFontSize(9)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(100, 116, 139)
            doc.text("ITEM DESCRIPTION", 25, y + 2)
            doc.text("AMOUNT (NGN)", 185, y + 2, { align: "right" })

            y += 15

            const addRow = (label: string, amount: number) => {
                if (amount <= 0) return
                doc.setFontSize(10)
                doc.setTextColor(51, 65, 85)
                doc.setFont("helvetica", "normal")
                doc.text(label, 25, y)
                doc.setFont("helvetica", "bold")
                doc.text(amount.toLocaleString(), 185, y, { align: "right" })

                // Thin separator
                doc.setDrawColor(241, 245, 249)
                doc.line(25, y + 4, 185, y + 4)

                y += 12
            }

            if (billing.breakdown) {
                addRow("Tuition Fees", billing.breakdown.tuition)
                addRow("Development Levy", billing.breakdown.development)
                addRow("Books & Learning Materials", billing.breakdown.books)
                addRow("School Uniforms", billing.breakdown.uniforms)
            }

            // Total Summary
            y += 10
            doc.setDrawColor(15, 23, 42)
            doc.setLineWidth(0.5)
            doc.line(120, y, 190, y)
            
            y += 10
            doc.setFontSize(12)
            doc.setTextColor(15, 23, 42)
            doc.text("TOTAL AMOUNT DUE:", 120, y)
            doc.setFontSize(14)
            doc.text(`NGN ${billing.total_fees.toLocaleString()}`, 185, y, { align: "right" })

            // Payment Instructions
            y += 30
            doc.setFontSize(9)
            doc.setTextColor(100, 116, 139)
            doc.setFont("helvetica", "bold")
            doc.text("PAYMENT INSTRUCTIONS:", 20, y)
            doc.setFont("helvetica", "normal")
            doc.text("1. Payments can be made via the Parent Dashboard.", 20, y + 6)
            doc.text("2. For bank transfers, use the school account details provided at the office.", 20, y + 11)
            doc.text("3. Please keep this invoice for your records.", 20, y + 16)

            // Signature Section
            y += 40
            if (principalSignature) {
                try {
                    // Try to add the signature image if it's a valid data URL or path
                    doc.addImage(principalSignature, 'PNG', 150, y - 15, 30, 15)
                } catch (e) {
                    console.warn("Could not add signature image", e)
                }
            }
            
            doc.setDrawColor(200, 200, 200)
            doc.line(140, y, 190, y)
            doc.setFontSize(8)
            doc.setTextColor(100, 116, 139)
            doc.text("PRINCIPAL / AUTHORIZED SIGNATORY", 165, y + 5, { align: "center" })

            // Final Footer
            doc.setFontSize(8)
            doc.setTextColor(148, 163, 184)
            doc.text(`${schoolName} - Official Institutional Document`, 105, 285, { align: "center" })

            doc.save(`${schoolName.replace(/\s+/g, '_')}_Invoice_${billing.session}.pdf`)
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
