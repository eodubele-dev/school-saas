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
    schoolAddress,
    principalSignature
}: { 
    payment: any, 
    studentName: string,
    schoolName: string,
    schoolAddress: string,
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
            doc.text("OFFICIAL RECEIPT", 190, 25, { align: "right" })

            doc.setFontSize(9)
            doc.setFont("helvetica", "normal")
            doc.setTextColor(100, 100, 100)
            doc.text(schoolAddress.toUpperCase(), 20, 32)
            doc.text(`REF: ${payment.reference || "REF-"+Math.floor(Math.random()*100000)}`, 190, 32, { align: "right" })

            drawLine(45, 0.8)

            // --- 2. PAYMENT INFO ---
            let y = 60
            doc.setTextColor(150, 150, 150)
            doc.setFontSize(8)
            doc.setFont("helvetica", "bold")
            doc.text("PAID BY", 20, y)
            doc.text("DATE OF PAYMENT", 190, y, { align: "right" })

            y += 8
            doc.setTextColor(0, 0, 0)
            doc.setFontSize(16)
            doc.setFont("times", "bold")
            doc.text(studentName.toUpperCase(), 20, y)
            
            doc.setFontSize(14)
            doc.text(new Date(payment.date).toLocaleDateString('en-GB'), 190, y, { align: "right" })

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
            doc.text("DESCRIPTION", 25, y)
            doc.text("METHOD", 105, y, { align: "center" })
            doc.text("AMOUNT (NGN)", 185, y, { align: "right" })
            drawLine(y + 4, 0.5)

            y += 15
            doc.setFontSize(11)
            doc.setFont("times", "normal")
            doc.text("School Fees Payment", 25, y)
            doc.text(payment.method.toUpperCase(), 105, y, { align: "center" })
            doc.setFont("times", "bold")
            doc.text(`N${payment.amount.toLocaleString()}`, 185, y, { align: "right" })

            // --- 4. TOTAL SECTION ---
            y += 20
            doc.setFillColor(0, 0, 0)
            doc.rect(20, y, 170, 15, "F")
            
            doc.setFontSize(10)
            doc.setTextColor(255, 255, 255)
            doc.setFont("helvetica", "bold")
            doc.text("TOTAL AMOUNT RECEIVED", 100, y + 9.5, { align: "center" })
            doc.setFontSize(14)
            doc.text(`N${payment.amount.toLocaleString()}`, 185, y + 10, { align: "right" })

            // --- 5. SIGNATURE & AUTH ---
            y += 40
            
            // Digital Auth Hash (Bottom Left)
            doc.setTextColor(100, 116, 139)
            doc.setFontSize(8)
            doc.setFont("helvetica", "bold")
            doc.text("DIGITAL_AUTH: " + (payment.reference || Math.random().toString(36).substring(2, 8).toUpperCase()), 20, y + 20)

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

            doc.save(`${schoolName.replace(/\s+/g, '_')}_Receipt.pdf`)
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
