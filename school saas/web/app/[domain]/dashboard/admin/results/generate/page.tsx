"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Loader2, Printer, Search, Link2 } from "lucide-react"
import { ResultSheet } from "@/components/results/result-sheet"
import { getStudentResultData, getBulkClassResults, getClassesForSelection, getStudentsForSelection } from "@/lib/actions/results"
import { ResultData } from "@/types/results"
import { toast } from "sonner"
import { useReactToPrint } from "react-to-print"
import { useRef, useEffect } from "react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { createUploadUrl, registerSnapshot, verifyExistingSnapshot, SnapshotData } from "@/lib/actions/snapshots"

export default function GenerateResultsPage() {
    const [loading, setLoading] = useState(false)
    const [studentId, setStudentId] = useState("")
    const [session, setSession] = useState("2025/2026")
    const [term, setTerm] = useState("1st")
    const [nextTermBegins, setNextTermBegins] = useState("2026-09-15") // Default Example
    const [dateIssued, setDateIssued] = useState(new Date().toISOString().split('T')[0])

    const [classes, setClasses] = useState<{ id: string; name: string }[]>([])
    const [students, setStudents] = useState<any[]>([])

    const [selectedClassId, setSelectedClassId] = useState<string>("all")
    const [selectedStudentId, setSelectedStudentId] = useState<string>("all")

    const [resultDataList, setResultDataList] = useState<ResultData[]>([])
    const printRef = useRef<HTMLDivElement>(null)

    // Load initial data
    useEffect(() => {
        async function loadSelectors() {
            try {
                const classList = await getClassesForSelection()
                setClasses(classList)
                const studentList = await getStudentsForSelection()
                setStudents(studentList)
            } catch (error) {
                console.error("Failed to load selectors", error)
            }
        }
        loadSelectors()
    }, [])

    // Reload students when class changes
    useEffect(() => {
        async function loadStudentsInClass() {
            try {
                const studentList = await getStudentsForSelection(selectedClassId === "all" ? undefined : selectedClassId)
                setStudents(studentList)
                setSelectedStudentId("all") // Reset student when class changes
            } catch (error) {
                console.error("Failed to load students", error)
            }
        }
        loadStudentsInClass()
    }, [selectedClassId])

    const handleGenerate = async () => {
        setLoading(true)
        setResultDataList([])

        try {
            if (selectedStudentId !== "all") {
                // Generate for single student
                const data = await getStudentResultData(
                    selectedStudentId,
                    term,
                    session,
                    new Date(nextTermBegins).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                    new Date(dateIssued).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                )

                if (!data) {
                    toast.error("Result data not found for this student")
                } else {
                    setResultDataList([data])
                    toast.success("Result generated successfully")
                }
            } else if (selectedClassId !== "all") {
                // Generate for entire class
                const classStudents = students.filter(s => s.class_id === selectedClassId)
                if (classStudents.length === 0) {
                    toast.error("No students found in this class")
                    setLoading(false)
                    return
                }

                const studentIds = classStudents.map(s => s.id)
                const dataList = await getBulkClassResults(
                    studentIds,
                    term,
                    session,
                    new Date(nextTermBegins).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                    new Date(dateIssued).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                )

                if (dataList.length === 0) {
                    toast.error("No result data found for this class")
                } else {
                    setResultDataList(dataList)
                    toast.success(`Generated ${dataList.length} results successfully`)
                }
            } else {
                toast.error("Please select a Class or a specific Student")
            }
        } catch (error) {
            toast.error("Error generating result(s)")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: resultDataList.length > 1 ? `Results_Class_${session}` : `Result_${resultDataList[0]?.student.full_name || 'Student'}`,
    } as any)

    const [freezing, setFreezing] = useState(false)
    const [freezeProgress, setFreezeProgress] = useState({ current: 0, total: 0 })

    const handleFreezeResults = async () => {
        if (resultDataList.length === 0) return
        setFreezing(true)
        setFreezeProgress({ current: 0, total: resultDataList.length })

        let successCount = 0

        try {
            // Give React a moment to render exactly before capture
            await new Promise(r => setTimeout(r, 100))

            const resultNodes = printRef.current?.querySelectorAll('#result-sheet-node')
            if (!resultNodes || resultNodes.length !== resultDataList.length) {
                toast.error("DOM mismatch. Cannot capture results.")
                setFreezing(false)
                return
            }

            for (let i = 0; i < resultDataList.length; i++) {
                const data = resultDataList[i]
                const node = resultNodes[i] as HTMLElement

                setFreezeProgress({ current: i + 1, total: resultDataList.length })

                // 1. Capture HTML to Canvas
                const canvas = await html2canvas(node, {
                    scale: 2, // High resolution
                    useCORS: true,
                    logging: false,
                    windowWidth: node.scrollWidth,
                    windowHeight: node.scrollHeight
                })

                // 2. Convert Canvas to A4 PDF
                const imgData = canvas.toDataURL('image/jpeg', 0.95)
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                })

                const pdfWidth = pdf.internal.pageSize.getWidth()
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width

                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
                const pdfBlob = pdf.output('blob')

                // 3. Request Storage URL using Server Action
                const meta: SnapshotData = {
                    studentId: data.student.id,
                    sessionId: data.term_info.session_id,
                    term: data.term_info.term,
                    documentType: 'result_sheet'
                }

                const urlRes = await createUploadUrl(meta, pdfBlob.size)
                if (!urlRes.success || !urlRes.uploadUrl || !urlRes.filePath) {
                    console.error("Failed to get URL for student:", data.student.full_name, urlRes.error)
                    continue
                }

                // 4. PUT Blob actively to Supabase Bucket Storage directly from Client
                const uploadRes = await fetch(urlRes.uploadUrl, {
                    method: 'PUT',
                    body: pdfBlob,
                    headers: { 'Content-Type': 'application/pdf' }
                })

                if (!uploadRes.ok) {
                    console.error("Failed to upload Blob to storage:", uploadRes.statusText)
                    continue
                }

                // 5. Register finalized metadata link in relational database
                const regRes = await registerSnapshot(meta, urlRes.filePath)
                if (regRes.success) {
                    successCount++
                }
            }

            if (successCount === resultDataList.length) {
                toast.success(`Successfully archived ${successCount} Result Sheets instantly.`)
            } else {
                toast.warning(`Archived ${successCount}/${resultDataList.length} results. Check console.`)
            }

        } catch (err) {
            console.error(err)
            toast.error("An unexpected error occurred during snapshot processing.")
        } finally {
            setFreezing(false)
        }
    }

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
                        {/* Class Selection */}
                        <div className="space-y-2 lg:col-span-1">
                            <Label className="text-white">Class (Optional Bulk)</Label>
                            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                                <SelectTrigger className="bg-slate-800 border-white/20 text-white">
                                    <SelectValue placeholder="All Classes" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Any Class</SelectItem>
                                    {classes?.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Student Search */}
                        <div className="space-y-2 lg:col-span-1">
                            <Label className="text-white">Student</Label>
                            <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                                <SelectTrigger className="bg-slate-800 border-white/20 text-white">
                                    <SelectValue placeholder="Search Student..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Students in Filter</SelectItem>
                                    {(students || []).map(s => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.full_name} {s.admission_number ? `(${s.admission_number})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                            <div className="relative">
                                <Input
                                    type="date"
                                    value={nextTermBegins}
                                    onChange={(e) => setNextTermBegins(e.target.value)}
                                    className="bg-slate-800 border-white/20 text-white pl-10"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                    <Calendar className="h-4 w-4" />
                                    <span className="sr-only">Calendar Icon</span>
                                </div>
                            </div>
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

            {resultDataList.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex justify-between items-center bg-slate-900 border border-white/10 p-4 rounded-xl">
                        <div className="text-slate-300">
                            Generated <span className="font-bold text-white">{resultDataList.length}</span> result{resultDataList.length !== 1 && 's'}.
                            {freezing && <span className="ml-4 text-sky-400 text-sm animate-pulse">Archiving {freezeProgress.current} of {freezeProgress.total}...</span>}
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={handleFreezeResults}
                                disabled={freezing}
                                variant="outline"
                                className="bg-transparent border-sky-500/50 text-sky-400 hover:bg-sky-500/20 hover:text-sky-300"
                            >
                                {freezing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Link2 className="mr-2 h-4 w-4" />}
                                Archive & Freeze
                            </Button>
                            <Button onClick={handlePrint} disabled={freezing} className="bg-green-600 hover:bg-green-500 text-white">
                                <Printer className="mr-2 h-4 w-4" /> {resultDataList.length > 1 ? "Print All" : "Print Result"}
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-auto bg-slate-800/50 p-2 md:p-8 rounded-xl border border-white/5 flex justify-center">
                        {/* Print Container */}
                        <div ref={printRef} className="w-full flex flex-col items-center">
                            {resultDataList.map((data, index) => (
                                <div key={data.student.id} className="w-full flex justify-center print:block print:w-full print:page-break-after-always last:print:page-break-after-auto mb-8 print:mb-0">
                                    <ResultSheet data={data} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    )
}
