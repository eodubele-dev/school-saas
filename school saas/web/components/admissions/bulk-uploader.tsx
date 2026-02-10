"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import Papa from "papaparse"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle, X, Download, ArrowRight, Wand2 } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { bulkAdmitStudents, AdmissionData } from "@/lib/actions/onboarding"
import { Checkbox } from "@/components/ui/checkbox"

interface CSVRow {
    [key: string]: string
}

const REQUIRED_FIELDS = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'gender', label: 'Gender' },
    { key: 'parentPhone', label: 'Parent Phone' }
]

export function BulkUploader({ domain, classes }: { domain: string, classes: any[] }) {
    const [file, setFile] = useState<File | null>(null)
    const [rawRows, setRawRows] = useState<CSVRow[]>([])
    const [headers, setHeaders] = useState<string[]>([])
    const [mapping, setMapping] = useState<Record<string, string>>({}) // DB Field -> CSV Header
    const [step, setStep] = useState<'upload' | 'map' | 'validate'>('upload')
    const [targetClass, setTargetClass] = useState<string>("")
    const [uploading, setUploading] = useState(false)

    // 1. File Drop
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0]
        if (selectedFile) {
            setFile(selectedFile)
            Papa.parse(selectedFile, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const data = results.data as CSVRow[]
                    if (data.length > 0) {
                        setRawRows(data)
                        setHeaders(Object.keys(data[0]))
                        setStep('map')
                        // Auto-Map if headers match exactly
                        const initialMap: Record<string, string> = {}
                        REQUIRED_FIELDS.forEach(field => {
                            const match = Object.keys(data[0]).find(h => h.toLowerCase().replace(/_/g, '').includes(field.label.toLowerCase().replace(/ /g, '')))
                            if (match) initialMap[field.key] = match
                        })
                        setMapping(initialMap)
                    }
                },
                error: (error) => toast.error("Parse Error: " + error.message)
            })
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'text/csv': ['.csv'] }, maxFiles: 1 })

    // 2. Validation
    const getValidatedData = () => {
        return rawRows.map(row => {
            const firstName = row[mapping['firstName']]?.trim()
            const lastName = row[mapping['lastName']]?.trim()
            const gender = row[mapping['gender']]?.trim()
            const parentPhone = row[mapping['parentPhone']]?.trim()

            const errors: string[] = []
            if (!firstName) errors.push("Missing First Name")
            if (!lastName) errors.push("Missing Last Name")
            if (!gender) errors.push("Missing Gender")
            if (!parentPhone) errors.push("Missing Parent Phone")

            return {
                original: row,
                mapped: { firstName, lastName, gender, parentPhone, classId: targetClass, dob: new Date().toISOString() } as AdmissionData,
                isValid: errors.length === 0,
                errors
            }
        })
    }

    const validatedData = step === 'validate' ? getValidatedData() : []
    const validCount = validatedData.filter(d => d.isValid).length
    const errorCount = validatedData.length - validCount

    // 3. Final Upload
    const handleFinalImport = async () => {
        if (!targetClass) {
            toast.error("Please select a target class")
            return
        }
        setUploading(true)
        try {
            const validStudents = validatedData.filter(d => d.isValid).map(d => d.mapped)
            const res = await bulkAdmitStudents(validStudents)

            if (res.success) {
                toast.success(`Successfully imported ${res.count} students!`)
                toast.info("Invoices generated & Welcome SMS sent.")
                setFile(null)
                setRawRows([])
                setStep('upload')
            } else {
                toast.error("Import failed partially")
            }
        } catch (e) {
            toast.error("System Error")
        } finally {
            setUploading(false)
        }
    }

    const handleDownloadTemplate = () => {
        const headers = REQUIRED_FIELDS.map(f => f.label)
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",")
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", "student_upload_template.csv")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Bulk Student Upload</h2>
                {step === 'upload' && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadTemplate}
                        className="text-[var(--school-accent)] border-[var(--school-accent)]/20 hover:bg-[var(--school-accent)]/10"
                    >
                        <Download className="mr-2 h-4 w-4" /> Download Template
                    </Button>
                )}
            </div>

            {/* STEP 1: UPLOAD */}
            {step === 'upload' && (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragActive ? 'border-[var(--school-accent)] bg-[var(--school-accent)]/5' : 'border-white/10 hover:border-white/20'}`}
                >
                    <input {...getInputProps()} />
                    <UploadCloud className={`h-12 w-12 mb-4 ${isDragActive ? 'text-[var(--school-accent)]' : 'text-slate-500'}`} />
                    <p className="text-lg text-white font-medium">Drag & Drop CSV File here</p>
                    <p className="text-sm text-slate-500 mt-2">or click to browse computer</p>
                </div>
            )}

            {/* STEP 2: MAPPING */}
            {step === 'map' && (
                <div className="bg-slate-900 border border-white/10 rounded-lg p-6 space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Wand2 className="text-[var(--school-accent)] h-5 w-5" />
                        <h3 className="text-white font-medium">Map CSV Columns</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {REQUIRED_FIELDS.map(field => (
                            <div key={field.key} className="space-y-2">
                                <label className="text-xs text-slate-400 uppercase font-bold">{field.label} <span className="text-red-500">*</span></label>
                                <Select
                                    value={mapping[field.key]}
                                    onValueChange={(val) => setMapping(prev => ({ ...prev, [field.key]: val }))}
                                >
                                    <SelectTrigger className="bg-slate-950 border-white/10 text-white">
                                        <SelectValue placeholder="Select CSV Header" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {headers.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between pt-4">
                        <Button variant="ghost" onClick={() => { setFile(null); setStep('upload'); }}>Cancel</Button>
                        <Button onClick={() => setStep('validate')} className="bg-[var(--school-accent)] text-white">
                            Next: Validate Data <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* STEP 3: VALIDATION & IMPORT */}
            {step === 'validate' && (
                <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-lg border border-white/10">
                        <div className="flex-1">
                            <h3 className="text-white font-bold">Review & Import</h3>
                            <p className="text-sm text-slate-400 mt-1">
                                <span className="text-green-400">{validCount} valid rows</span> ready.
                                <span className="text-red-400 ml-2">{errorCount} errors</span> to fix.
                            </p>
                        </div>
                        <Select value={targetClass} onValueChange={setTargetClass}>
                            <SelectTrigger className="w-[200px] bg-slate-950 border-white/10 text-white">
                                <SelectValue placeholder="Select Target Class" />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="border border-white/10 rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                        <Table>
                            <TableHeader className="bg-slate-900">
                                <TableRow className="border-white/5">
                                    <TableHead className="text-slate-400">First Name</TableHead>
                                    <TableHead className="text-slate-400">Last Name</TableHead>
                                    <TableHead className="text-slate-400">Phone</TableHead>
                                    <TableHead className="text-right text-slate-400">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {validatedData.map((row, idx) => (
                                    <TableRow key={idx} className="border-white/5 hover:bg-white/5">
                                        <TableCell className={!row.mapped.firstName ? "text-red-400 bg-red-500/10" : "text-slate-300"}>
                                            {row.mapped.firstName || "MISSING"}
                                        </TableCell>
                                        <TableCell className={!row.mapped.lastName ? "text-red-400 bg-red-500/10" : "text-slate-300"}>
                                            {row.mapped.lastName || "MISSING"}
                                        </TableCell>
                                        <TableCell className={!row.mapped.parentPhone ? "text-red-400 bg-red-500/10" : "text-slate-300"}>
                                            {row.mapped.parentPhone || "MISSING"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {row.isValid
                                                ? <CheckCircle className="h-4 w-4 text-green-500 inline" />
                                                : <div className="flex flex-col items-end gap-1">
                                                    {row.errors.map(e => <span key={e} className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">{e}</span>)}
                                                </div>
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-between pt-4">
                        <Button variant="ghost" onClick={() => setStep('map')}>Back to Mapping</Button>
                        <Button
                            onClick={handleFinalImport}
                            disabled={uploading || validCount === 0 || !targetClass}
                            className="bg-[var(--school-accent)] hover:bg-[var(--school-accent)]/90 text-white min-w-[200px] shadow-lg shadow-blue-500/20"
                        >
                            {uploading ? "Importing..." : `Import ${validCount} Students`}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
