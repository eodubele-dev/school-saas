"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ReportCard({ grades }: { grades: any[] }) {

    // Calculate summaries
    const totalScore = grades.reduce((acc, g) => acc + (Number(g.total) || 0), 0)
    const average = grades.length > 0 ? (totalScore / grades.length).toFixed(1) : "0.0"

    const getGradeColor = (grade: string) => {
        if (grade?.startsWith('A')) return "bg-green-500/10 text-green-400 border-green-500/20"
        if (grade?.startsWith('B')) return "bg-blue-500/10 text-blue-400 border-blue-500/20"
        if (grade?.startsWith('C')) return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
        if (grade?.startsWith('F')) return "bg-red-500/10 text-red-400 border-red-500/20"
        return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    }

    return (
        <div className="bg-white rounded-xl overflow-hidden shadow-xl">
            {/* Header */}
            <div className="bg-slate-50 p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-serif">End of Term Report</h2>
                    <p className="text-slate-500 text-sm">First Term • 2025/2026 Session</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-slate-300 text-slate-700">
                        <Share2 className="h-4 w-4 mr-2" /> Share
                    </Button>
                    <Button className="bg-[var(--school-accent)] text-white hover:bg-blue-700">
                        <Download className="h-4 w-4 mr-2" /> Download PDF
                    </Button>
                </div>
            </div>

            {/* Stats Cards Row (in print layout this would be top) */}
            <div className="grid grid-cols-4 gap-px bg-slate-200 border-b border-slate-200">
                <div className="bg-white p-4 text-center">
                    <span className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Total Score</span>
                    <span className="text-xl font-black text-slate-900">{totalScore}</span>
                </div>
                <div className="bg-white p-4 text-center">
                    <span className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Average</span>
                    <span className="text-xl font-black text-blue-600">{average}%</span>
                </div>
                <div className="bg-white p-4 text-center">
                    <span className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Position</span>
                    <span className="text-xl font-black text-slate-900">4th</span>
                </div>
                <div className="bg-white p-4 text-center">
                    <span className="block text-xs uppercase tracking-wider text-slate-500 font-bold mb-1">Class Size</span>
                    <span className="text-xl font-black text-slate-900">25</span>
                </div>
            </div>

            {/* Main Table */}
            <div className="p-0">
                <Table>
                    <TableHeader className="bg-slate-100">
                        <TableRow>
                            <TableHead className="w-[30%] text-slate-700 font-bold">Subject</TableHead>
                            <TableHead className="text-center text-slate-600">CA (40)</TableHead>
                            <TableHead className="text-center text-slate-600">Exam (60)</TableHead>
                            <TableHead className="text-center text-slate-900 font-bold">Total</TableHead>
                            <TableHead className="text-center text-slate-700">Grade</TableHead>
                            <TableHead className="text-left text-slate-700">Remark</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {grades.map((grade) => (
                            <TableRow key={grade.id} className="hover:bg-slate-50">
                                <TableCell className="font-bold text-slate-800">
                                    {grade.subject?.name || "Unknown Subject"}
                                </TableCell>
                                <TableCell className="text-center text-slate-600">
                                    {(Number(grade.ca1) + Number(grade.ca2)).toFixed(0)}
                                </TableCell>
                                <TableCell className="text-center text-slate-600">
                                    {grade.exam}
                                </TableCell>
                                <TableCell className="text-center font-bold text-slate-900">
                                    {grade.total}
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="outline" className={getGradeColor(grade.grade)}>
                                        {grade.grade}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-slate-500 italic">
                                    {grade.remarks || "Satisfactory effort."}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Footer Signatures */}
            <div className="p-8 border-t border-slate-200 mt-4 flex justify-between items-end">
                <div className="text-center w-40">
                    <div className="h-16 border-b border-slate-900/20 mb-2 flex items-end justify-center pb-2">
                        {/* Placeholder for scanned signature */}
                        <span className="font-dancing-script text-2xl text-blue-900">Principal</span>
                    </div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest">Principal&apos;s Signature</p>
                </div>

                <div className="text-center w-32 opacity-50">
                    <div className="h-24 w-24 border-4 border-slate-300 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-300 font-bold transform -rotate-12">
                        SCHOOL STAMP
                    </div>
                </div>
            </div>
        </div>
    )
}
