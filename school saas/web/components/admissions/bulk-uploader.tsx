"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import Papa from "papaparse"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle, X, Download } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

interface StudentRow {
    firstName: string
    lastName: string
    gender: string
    class?: string
    isValid: boolean
    errors: string[]
}

export function BulkUploader({ domain, classes }: { domain: string, classes: any[] }) {
    const [file, setFile] = useState<File | null>(null)
    const [previewData, setPreviewData] = useState<StudentRow[]>([])
    const [uploading, setUploading] = useState(false)
    const [targetClass, setTargetClass] = useState<string>("")

    const supabase = createClient()

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0]
        if (selectedFile) {
            setFile(selectedFile)
            parseCSV(selectedFile)
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'text/csv': ['.csv'] },
        maxFiles: 1
    })

    const parseCSV = (file: File) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const rows = results.data.map((row: any) => validateRow(row))
                setPreviewData(rows)
            },
            error: (error) => {
                toast.error("CSV Parse Error: " + error.message)
            }
        })
    }

    const validateRow = (row: any): StudentRow => {
        const errors: string[] = []
        if (!row.firstName) errors.push("Missing First Name")
        if (!row.lastName) errors.push("Missing Last Name")
        if (!row.gender || !['Male', 'Female'].includes(row.gender)) errors.push("Invalid Gender")

        return {
            firstName: row.firstName,
            lastName: row.lastName,
            gender: row.gender,
            isValid: errors.length === 0,
            errors
        }
    }

    const handleBulkUpload = async () => {
        if (!targetClass) {
            toast.error("Please select a target class for these students.")
            return
        }

        const validRows = previewData.filter(r => r.isValid)
        if (validRows.length === 0) {
            toast.error("No valid students found to upload.")
            return
        }

        setUploading(true)
        try {
            // Transform for DB
            const studentsToInsert = validRows.map(r => ({
                first_name: r.firstName,
                last_name: r.lastName,
                gender: r.gender,
                class_id: targetClass,
                admission_number: `ADM/${new Date().getFullYear().toString().slice(-2)}/${Math.floor(Math.random() * 10000)}` // Tmp unique
                // In prod, use a better sequencer or database trigger
            }))

            const { error } = await supabase.from('students').insert(studentsToInsert)

            if (error) throw error

            toast.success(`Successfully uploaded ${studentsToInsert.length} students!`)
            setFile(null)
            setPreviewData([])
        } catch (error: any) {
            toast.error("Upload Failed: " + error.message)
        } finally {
            setUploading(false)
        }
    }

    const downloadTemplate = () => {
        const csvContent = "firstName,lastName,gender\nJohn,Doe,Male\nJane,Smith,Female"
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", "student_upload_template.csv")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const validCount = previewData.filter(r => r.isValid).length
    const errorCount = previewData.length - validCount

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Bulk Student Upload</h2>
                <Button variant="outline" size="sm" onClick={downloadTemplate} className="text-[var(--school-accent)] border-[var(--school-accent)]/20 hover:bg-[var(--school-accent)]/10">
                    <Download className="mr-2 h-4 w-4" /> Download Template
                </Button>
            </div>

            {!file ? (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragActive ? 'border-[var(--school-accent)] bg-[var(--school-accent)]/5' : 'border-white/10 hover:border-white/20'}`}
                >
                    <input {...getInputProps()} />
                    <UploadCloud className={`h-12 w-12 mb-4 ${isDragActive ? 'text-[var(--school-accent)]' : 'text-slate-500'}`} />
                    <p className="text-lg text-white font-medium">Drag & Drop CSV File here</p>
                    <p className="text-sm text-slate-500 mt-2">or click to browse computer</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-900 border border-white/10 rounded-lg">
                        <div className="flex items-center gap-3">
                            <FileSpreadsheet className="h-8 w-8 text-green-500" />
                            <div>
                                <p className="text-white font-medium">{file.name}</p>
                                <div className="text-xs flex gap-3 mt-1">
                                    <span className="text-green-400 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> {validCount} Valid</span>
                                    {errorCount > 0 && <span className="text-red-400 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {errorCount} Errors</span>}
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => { setFile(null); setPreviewData([]); }}>
                            <X className="h-4 w-4 text-slate-400" />
                        </Button>
                    </div>

                    {/* Class Selector */}
                    <div className="flex items-end gap-4 max-w-sm">
                        <div className="w-full space-y-2">
                            <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Assign All To Class</label>
                            <Select value={targetClass} onValueChange={setTargetClass}>
                                <SelectTrigger className="bg-slate-950 border-white/10 text-white">
                                    <SelectValue placeholder="Select Class..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Preview Table */}
                    <div className="border border-white/10 rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                        <Table>
                            <TableHeader className="bg-slate-900">
                                <TableRow className="hover:bg-slate-900 border-white/5">
                                    <TableHead className="text-slate-400">First Name</TableHead>
                                    <TableHead className="text-slate-400">Last Name</TableHead>
                                    <TableHead className="text-slate-400">Gender</TableHead>
                                    <TableHead className="text-right text-slate-400">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {previewData.map((row, idx) => (
                                    <TableRow key={idx} className="border-white/5 hover:bg-white/5">
                                        <TableCell className={!row.firstName ? "bg-red-500/10 text-red-400" : "text-slate-300"}>
                                            {row.firstName || "MISSING"}
                                        </TableCell>
                                        <TableCell className={!row.lastName ? "bg-red-500/10 text-red-400" : "text-slate-300"}>
                                            {row.lastName || "MISSING"}
                                        </TableCell>
                                        <TableCell className={row.errors.includes("Invalid Gender") ? "bg-red-500/10 text-red-400" : "text-slate-300"}>
                                            {row.gender}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {row.isValid
                                                ? <CheckCircle className="h-4 w-4 text-green-500 inline" />
                                                : <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded">{row.errors[0]}</span>
                                            }
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={handleBulkUpload}
                            disabled={uploading || validCount === 0 || !targetClass}
                            className="bg-[var(--school-accent)] hover:brightness-110 text-white shadow-lg"
                        >
                            {uploading ? "Importing..." : `Import ${validCount} Students`}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
