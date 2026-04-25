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
    schoolAddress,
    logoUrl,
    principalSignature
}: { 
    billing: any, 
    studentName: string,
    schoolName: string,
    schoolAddress: string,
    logoUrl: string,
    principalSignature: string
}) {
    const [generating, setGenerating] = useState(false)

    const getBase64Image = (url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.setAttribute('crossOrigin', 'anonymous');
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0);
                resolve(canvas.toDataURL("image/png"));
            };
            img.onerror = () => reject(new Error("Failed to load image"));
            img.src = url;
        });
    };

    const handleDownload = async () => {
        setGenerating(true)
        try {
            const doc = new jsPDF()

            // Signature (Bottom Right)
            let signatureBase64 = ""
            if (principalSignature) {
                try {
                    // Check if it's already a data URL
                    if (principalSignature.startsWith('data:')) {
                        signatureBase64 = principalSignature
                    } else {
                        signatureBase64 = await getBase64Image(principalSignature)
                    }
                } catch (e) {
                    console.warn("Signature load failed", e)
                }
            }
            
            // --- Helper: Draw Section Line ---
            const drawLine = (yPos: number, thickness = 0.5) => {
                doc.setDrawColor(0, 0, 0)
                doc.setLineWidth(thickness)
                doc.line(20, yPos, 190, yPos)
            }

            // --- 1. HEADER SECTION ---
            doc.setTextColor(0, 0, 0)
            doc.setFontSize(24)
            doc.setFont("times", "bold")
            doc.text(schoolName.toUpperCase(), 20, 25)
            
            doc.setFontSize(20)
            doc.text("OFFICIAL INVOICE", 190, 25, { align: "right" })

            doc.setFontSize(9)
            doc.setFont("helvetica", "normal")
            doc.setTextColor(100, 100, 100)
            doc.text(schoolAddress.toUpperCase(), 20, 32)
            doc.text(`REF: INV-${Math.floor(100000 + Math.random() * 900000)}`, 190, 32, { align: "right" })

            drawLine(45, 0.8)

            // --- 2. BILLING INFO ---
            let y = 60
            doc.setTextColor(150, 150, 150)
            doc.setFontSize(8)
            doc.setFont("helvetica", "bold")
            doc.text("PAID BY / BILL TO", 20, y)
            doc.text("DATE OF ISSUE", 190, y, { align: "right" })

            y += 8
            doc.setTextColor(0, 0, 0)
            doc.setFontSize(16)
            doc.setFont("times", "bold")
            doc.text(studentName.toUpperCase(), 20, y)
            
            doc.setFontSize(14)
            doc.text(new Date().toLocaleDateString('en-GB'), 190, y, { align: "right" })

            // Thin line under names
            doc.setDrawColor(200, 200, 200)
            doc.setLineWidth(0.2)
            doc.line(20, y + 2, 60, y + 2)

            // --- 3. TABLE SECTION ---
            y = 95
            drawLine(y - 6, 0.5)
            
            doc.setFontSize(8)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(0, 0, 0)
            doc.text("ITEM CATEGORY", 25, y)
            doc.text("AMOUNT (NGN)", 185, y, { align: "right" })
            drawLine(y + 4, 0.5)

            y += 15

            const addRow = (label: string, amount: number) => {
                if (amount <= 0) return
                doc.setFontSize(11)
                doc.setTextColor(0, 0, 0)
                doc.setFont("times", "normal")
                doc.text(label, 25, y)
                doc.setFont("times", "bold")
                doc.text(`N${amount.toLocaleString()}`, 185, y, { align: "right" })

                // Very light separator
                doc.setDrawColor(245, 245, 245)
                doc.line(20, y + 4, 190, y + 4)

                y += 15
            }

            if (billing.breakdown) {
                addRow("Tuition Fees", billing.breakdown.tuition)
                addRow("Development Levy", billing.breakdown.development)
                addRow("Books & Learning Materials", billing.breakdown.books)
                addRow("School Uniforms", billing.breakdown.uniforms)
            }

            // --- 4. TOTAL SECTION ---
            y += 5
            doc.setFillColor(0, 0, 0)
            doc.rect(20, y, 170, 15, "F")
            
            doc.setFontSize(10)
            doc.setTextColor(255, 255, 255)
            doc.setFont("helvetica", "bold")
            doc.text("TOTAL AMOUNT DUE", 100, y + 9.5, { align: "center" })
            doc.setFontSize(14)
            doc.text(`N${billing.total_fees.toLocaleString()}`, 185, y + 10, { align: "right" })

            // --- 5. SIGNATURE & AUTH ---
            y += 40
            
            // Digital Auth Hash (Bottom Left)
            doc.setTextColor(100, 116, 139)
            doc.setFontSize(8)
            doc.setFont("helvetica", "bold")
            doc.text("DIGITAL_AUTH: " + Math.random().toString(36).substring(2, 8).toUpperCase(), 20, y + 20)

            // Signature (Bottom Right)
            if (signatureBase64) {
                try {
                    doc.addImage(signatureBase64, 'PNG', 150, y - 10, 35, 15)
                } catch (e) {
                    console.warn("Signature add failed", e)
                }
            }

            doc.setDrawColor(150, 150, 150)
            doc.setLineWidth(0.3)
            doc.line(140, y + 15, 190, y + 15)
            
            doc.setFontSize(7)
            doc.setTextColor(150, 150, 150)
            doc.text("AUTHORIZED SCHOOL SIGNATURE", 165, y + 20, { align: "center" })

            // Watermark / Footer
            doc.setFontSize(40)
            doc.setTextColor(240, 240, 240)
            doc.setFont("times", "bold")
            doc.text(schoolName.split(' ')[0].toUpperCase(), 105, 200, { align: "center", angle: 45 })

            doc.save(`${schoolName.replace(/\s+/g, '_')}_Invoice.pdf`)
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
