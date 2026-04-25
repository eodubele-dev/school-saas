"use client"

import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useState } from "react"
import { jsPDF } from "jspdf"
import { toast } from "sonner"

export function DownloadReceiptButton({ 
    payment, 
    studentName,
    schoolName,
    principalSignature
}: { 
    payment: any, 
    studentName: string,
    schoolName: string,
    principalSignature: string
}) {
    const [generating, setGenerating] = useState(false)

    const handleDownload = () => {
        setGenerating(true)
        try {
            const doc = new jsPDF()
            const accentColor = [16, 185, 129] // Emerald 500

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
            doc.text("OFFICIAL PAYMENT RECEIPT", 20, 32)

            // Receipt Meta (Top Right)
            doc.setFontSize(9)
            doc.text(`DATE: ${new Date(payment.date).toLocaleDateString()}`, 190, 20, { align: "right" })
            doc.text(`REF: ${payment.reference || "N/A"}`, 190, 25, { align: "right" })
            doc.text(`METHOD: ${payment.method.toUpperCase()}`, 190, 30, { align: "right" })

            // Received From Section
            let y = 60
            doc.setTextColor(100, 116, 139)
            doc.setFontSize(10)
            doc.setFont("helvetica", "bold")
            doc.text("RECEIVED FROM:", 20, y)
            
            doc.setTextColor(30, 41, 59)
            doc.setFontSize(14)
            doc.text(studentName.toUpperCase(), 20, y + 8)

            // Payment Details
            y = 90
            doc.setFillColor(248, 250, 252) // Slate 50
            doc.rect(20, y - 6, 170, 40, "F")
            
            doc.setFontSize(10)
            doc.setTextColor(51, 65, 85)
            doc.setFont("helvetica", "bold")
            doc.text("DESCRIPTION", 25, y + 2)
            doc.text("STATUS", 105, y + 2, { align: "center" })
            doc.text("AMOUNT", 185, y + 2, { align: "right" })

            y += 15
            doc.setFont("helvetica", "normal")
            doc.text("School Fees Payment", 25, y)
            doc.setTextColor(accentColor[0], accentColor[1], accentColor[2])
            doc.text("PAID", 105, y, { align: "center" })
            doc.setTextColor(51, 65, 85)
            doc.text(`NGN ${payment.amount.toLocaleString()}`, 185, y, { align: "right" })

            // Total Summary
            y += 40
            doc.setFillColor( accentColor[0], accentColor[1], accentColor[2])
            doc.rect(120, y - 6, 70, 12, "F")
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(12)
            doc.setFont("helvetica", "bold")
            doc.text("TOTAL PAID:", 125, y + 2)
            doc.text(`NGN ${payment.amount.toLocaleString()}`, 185, y + 2, { align: "right" })

            // Confirmation Text
            y += 30
            doc.setFontSize(9)
            doc.setTextColor(100, 116, 139)
            doc.setFont("helvetica", "normal")
            doc.text("This receipt confirms that the payment mentioned above has been received and processed successfully. Thank you for your continued support.", 20, y, { maxWidth: 100 })

            // Signature Section
            y += 40
            if (principalSignature) {
                try {
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
            doc.text(`${schoolName} - Official Payment Receipt`, 105, 285, { align: "center" })

            doc.save(`${schoolName.replace(/\s+/g, '_')}_Receipt_${payment.reference}.pdf`)
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
