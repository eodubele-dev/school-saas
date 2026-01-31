"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Sparkles, Download, Loader2 } from "lucide-react"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import { generateStudentRemark } from "@/lib/actions/gemini-server"

interface ReportCardProps {
    studentName: string
    className: string
    session: string
    term: string
    schoolName: string // Added prop
    logoUrl?: string // Added prop
    grades: Array<{
        subject: string
        ca1: number
        ca2: number
        exam: number
        total: number
        grade: string
        position: number
        teacherRemark?: string
    }>
    summary: {
        totalScore: number
        average: number
        classPosition: number
        totalStudents: number
        attendance: number
    }
}

export function ReportCard({ studentName, className, session, term, schoolName, logoUrl, grades, summary }: ReportCardProps) {
    const [aiRemark, setAiRemark] = useState("")
    const [generating, setGenerating] = useState(false)

    const handleGenerateRemark = async () => {
        setGenerating(true)
        try {
            // Find best and worst subjects
            const sortedGrades = [...grades].sort((a, b) => b.total - a.total)
            const bestSubject = sortedGrades[0]?.subject || "N/A"
            const worstSubject = sortedGrades[sortedGrades.length - 1]?.subject || "N/A"

            const remark = await generateStudentRemark({
                name: studentName,
                average: summary.average,
                position: summary.classPosition,
                totalStudents: summary.totalStudents,
                bestSubject,
                worstSubject,
                attendance: summary.attendance
            })
            setAiRemark(remark)
        } catch (error) {
            console.error(error)
        } finally {
            setGenerating(false)
        }
    }

    const downloadPDF = async () => {
        const doc = new jsPDF()

        // 1. Add School Logo if available
        if (logoUrl) {
            try {
                // Fetch image blob/base64 to ensure it works in PDF
                // For MVP, assuming valid publicly accessible URL or Base64 string
                // Ideally, convert URL to Base64 first if CORS is an issue, but jsPDF addImage handles some URLs.
                // Best practice: Use a small invisible img element or fetch to DataURL. 
                // Here we will try rendering the image directly if it's passed.

                // Note: Direct URL addImage often blocked by CORS. 
                // Using a placeholder approach or assuming Base64 is safer for client-side generation without proxy.
                // For this demo, let's assume `logoUrl` is accessible.

                // Adjusting layout to fit logo
                doc.addImage(logoUrl, 'PNG', 14, 10, 20, 20)
            } catch (e) {
                console.warn("Could not add logo to PDF", e)
            }
        }

        // 2. Header Information
        doc.setFontSize(20)
        doc.setTextColor(40, 40, 40)
        doc.text(schoolName, 105, 20, { align: "center" }) // Uses dynamic schoolName

        doc.setFontSize(12)
        doc.setTextColor(100)
        doc.text("Student Report Card", 105, 28, { align: "center" })

        doc.setLineWidth(0.5)
        doc.line(14, 32, 196, 32)

        // 3. Student Details (Grid Layout)
        doc.setFontSize(10)
        doc.setTextColor(0)

        doc.text(`Student Name:`, 14, 40)
        doc.setFont("helvetica", "bold")
        doc.text(studentName, 45, 40)
        doc.setFont("helvetica", "normal")

        doc.text(`Class:`, 14, 46)
        doc.setFont("helvetica", "bold")
        doc.text(className, 45, 46)
        doc.setFont("helvetica", "normal")

        doc.text(`Session:`, 140, 40)
        doc.setFont("helvetica", "bold")
        doc.text(session, 160, 40)
        doc.setFont("helvetica", "normal")

        doc.text(`Term:`, 140, 46)
        doc.setFont("helvetica", "bold")
        doc.text(term, 160, 46)
        doc.setFont("helvetica", "normal")

        // 4. Grades Table
        // ... (rest of logic)
        const tableData = grades.map(g => [
            g.subject,
            g.ca1,
            g.ca2,
            g.exam,
            g.total,
            g.grade,
            g.position
        ])

        autoTable(doc, {
            startY: 55,
            head: [['Subject', 'CA1', 'CA2', 'Exam', 'Total', 'Grade', 'Pos']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 9, cellPadding: 3 },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        })

        // ... (Summary and Remarks logic adjusted for Y position)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const finalY = (doc as any).lastAutoTable.finalY + 15

        // Summary Box
        doc.setFillColor(240, 248, 255)
        doc.roundedRect(14, finalY, 182, 25, 3, 3, 'F')

        doc.setFontSize(10)
        doc.text(`Total Score: ${summary.totalScore}`, 20, finalY + 10)
        doc.text(`Average: ${summary.average}%`, 20, finalY + 18)

        doc.text(`Class Position: ${summary.classPosition} / ${summary.totalStudents}`, 100, finalY + 10)
        doc.text(`Attendance: ${summary.attendance}%`, 100, finalY + 18)

        // Principal's Remark with Decoration
        if (aiRemark) {
            const remarkY = finalY + 35
            doc.setTextColor(0)
            doc.setFontSize(11)
            doc.setFont("helvetica", "bold")
            doc.text("Principal's Remark:", 14, remarkY)

            doc.setFont("times", "italic")
            doc.setFontSize(10)
            const splitRemark = doc.splitTextToSize(`"${aiRemark}"`, 180)
            doc.text(splitRemark, 14, remarkY + 7)
        }

        doc.save(`${studentName}_Report_${term}.pdf`)
    }

    return (
        <Card className="w-full max-w-4xl mx-auto my-8 print:shadow-none bg-white">
            <CardHeader className="text-center border-b pb-6">
                <CardTitle className="text-2xl font-bold uppercase tracking-wider">Student Report Card</CardTitle>
                <div className="flex justify-between mt-4 text-sm font-medium text-muted-foreground">
                    <div className="text-left space-y-1">
                        <p><span className="text-foreground">Name:</span> {studentName}</p>
                        <p><span className="text-foreground">Class:</span> {className}</p>
                    </div>
                    <div className="text-right space-y-1">
                        <p><span className="text-foreground">Session:</span> {session}</p>
                        <p><span className="text-foreground">Term:</span> {term}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
                {/* Grades Table UI */}
                <div className="rounded-md border">
                    <div className="grid grid-cols-7 bg-muted/50 p-3 font-semibold text-sm border-b">
                        <div className="col-span-1">Subject</div>
                        <div className="text-center">CA1</div>
                        <div className="text-center">CA2</div>
                        <div className="text-center">Exam</div>
                        <div className="text-center">Total</div>
                        <div className="text-center">Grade</div>
                        <div className="text-center">Pos</div>
                    </div>
                    {grades.map((grade, i) => (
                        <div key={i} className="grid grid-cols-7 p-3 text-sm border-b last:border-0 hover:bg-slate-50">
                            <div className="col-span-1 font-medium">{grade.subject}</div>
                            <div className="text-center text-muted-foreground">{grade.ca1}</div>
                            <div className="text-center text-muted-foreground">{grade.ca2}</div>
                            <div className="text-center text-muted-foreground">{grade.exam}</div>
                            <div className="text-center font-bold">{grade.total}</div>
                            <div className={`text-center font-bold ${grade.grade.startsWith('A') ? 'text-green-600' : grade.grade.startsWith('F') ? 'text-red-600' : ''}`}>
                                {grade.grade}
                            </div>
                            <div className="text-center text-muted-foreground">{grade.position}</div>
                        </div>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Summary Stats */}
                    <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                        <h3 className="font-semibold text-lg text-slate-800">Performance Summary</h3>
                        <Separator />
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <p className="text-muted-foreground">Total Score:</p>
                            <p className="font-bold text-right">{summary.totalScore}</p>

                            <p className="text-muted-foreground">Average:</p>
                            <p className="font-bold text-right">{summary.average}%</p>

                            <p className="text-muted-foreground">Class Position:</p>
                            <p className="font-bold text-right">{summary.classPosition} / {summary.totalStudents}</p>

                            <p className="text-muted-foreground">Attendance:</p>
                            <p className="font-bold text-right">{summary.attendance}%</p>
                        </div>
                    </div>

                    {/* AI Remarks Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg text-slate-800 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-amber-500" />
                                Principal&apos;s Remark
                            </h3>
                            {!aiRemark && (
                                <Button size="sm" variant="outline" onClick={handleGenerateRemark} disabled={generating}>
                                    {generating ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Sparkles className="h-3 w-3 mr-2" />}
                                    Generate AI Remark
                                </Button>
                            )}
                        </div>

                        <div className="p-4 border rounded-lg bg-white min-h-[120px] relative">
                            {aiRemark ? (
                                <p className="text-sm italic text-slate-700 leading-relaxed font-serif">
                                    &ldquo;{aiRemark}&rdquo;
                                </p>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                                    Click generate to create a personalized remark.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button onClick={downloadPDF} className="gap-2">
                        <Download className="h-4 w-4" />
                        Download PDF Report
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
