"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Printer, Search } from "lucide-react"
import { ResultSheet } from "@/components/results/result-sheet"
import { getStudentResultData } from "@/lib/actions/results"
import { ResultData } from "@/types/results"
import { toast } from "sonner"
import { useReactToPrint } from "react-to-print"
import { useRef } from "react"

export default function GenerateResultsPage() {
    const [loading, setLoading] = useState(false)
    const [studentId, setStudentId] = useState("")
    const [session, setSession] = useState("2025/2026")
    const [term, setTerm] = useState("1st")
    const [nextTermBegins, setNextTermBegins] = useState("2026-09-15") // Default Example
    const [dateIssued, setDateIssued] = useState(new Date().toISOString().split('T')[0])

    const [resultData, setResultData] = useState<ResultData | null>(null)
    const printRef = useRef<HTMLDivElement>(null)

    const handleGenerate = async () => {
        if (!studentId) return toast.error("Please enter a Student ID")

        setLoading(true)
        try {
            // Fetch dynamic results
            const data = await getStudentResultData(
                studentId,
                term,
                session,
                new Date(nextTermBegins).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                new Date(dateIssued).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            )

            if (!data) {
                toast.error("Result data not found for this student")
                setResultData(null)
            } else {
                setResultData(data)
                toast.success("Result generated successfully")
            }
        } catch (error) {
            toast.error("Error generating result")
        } finally {
            setLoading(false)
        }
    }

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: `Result_${resultData?.student.full_name || 'Student'}`,
    } as any)

    return (
        <div className="p-8 space-y-8 min-h-screen bg-slate-950 text-white">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-sky-600">
                        Result Processor
                    </h1>
                    <p className="text-slate-400">Generate, verify, and print termly reports.</p>
                </div>
            </div>

            <Card className="bg-slate-900 border-white/10">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        {/* Student ID */}
                        <div className="space-y-2 lg:col-span-1">
                            <Label className="text-white">Student ID</Label>
                            <Input
                                placeholder="UUID..."
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                className="bg-slate-800 border-white/20 font-mono text-white placeholder:text-slate-400"
                            />
                        </div>

                        {/* Session */}
                        <div className="space-y-2">
                            <Label className="text-white">Session</Label>
                            <Input
                                placeholder="e.g. 2025/2026"
                                value={session}
                                onChange={(e) => setSession(e.target.value)}
                                className="bg-slate-800 border-white/20 text-white"
                            />
                        </div>

                        {/* Term */}
                        <div className="space-y-2">
                            <Label className="text-white">Term</Label>
                            <Select value={term} onValueChange={setTerm}>
                                <SelectTrigger className="bg-slate-800 border-white/20 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1st">1st Term</SelectItem>
                                    <SelectItem value="2nd">2nd Term</SelectItem>
                                    <SelectItem value="3rd">3rd Term</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Dates */}
                        <div className="space-y-2">
                            <Label className="text-white">Next Term Begins</Label>
                            <Input
                                type="date"
                                value={nextTermBegins}
                                onChange={(e) => setNextTermBegins(e.target.value)}
                                className="bg-slate-800 border-white/20 text-white"
                            />
                        </div>

                        {/* Date Issued */}
                        {/* <div className="space-y-2">
                            <Label className="text-white">Date Issued</Label>
                            <Input
                                type="date"
                                value={dateIssued}
                                onChange={(e) => setDateIssued(e.target.value)}
                                className="bg-slate-800 border-white/20 text-white"
                            />
                        </div> */}

                        <Button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-500 w-full"
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                            Generate
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {resultData && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex justify-end">
                        <Button onClick={handlePrint} className="bg-green-600 hover:bg-green-500">
                            <Printer className="mr-2 h-4 w-4" /> Print Result
                        </Button>
                    </div>

                    <div className="overflow-auto bg-slate-800/50 p-8 rounded-xl border border-white/5 flex justify-center">
                        {/* Print Container */}
                        <div ref={printRef}>
                            <ResultSheet
                                data={resultData}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
