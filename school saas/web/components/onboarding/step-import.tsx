'use client'

import { Button } from "@/components/ui/button"
import { FileSpreadsheet, UploadCloud, ArrowRight } from "lucide-react"

interface StepImportProps {
    data: any
    updateData: (key: string, value: any) => void
    onNext: () => void
    onBack: () => void
}

export function StepImport({ data, updateData, onNext, onBack }: StepImportProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 bg-[#0A0A0B] p-8 rounded-3xl border border-white/10">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Student Registry Migration</h2>
                <p className="text-gray-400">Import your existing student records to auto-populate the command center.</p>
            </div>

            <div className="space-y-6">
                {/* Status Indicator */}
                <div className="bg-cyan-500/5 border border-cyan-500/20 p-6 rounded-2xl flex items-start gap-4">
                    <div className="text-cyan-400 p-2 bg-cyan-500/10 rounded-lg">
                        <UploadCloud className="h-6 w-6" />
                    </div>
                    <div>
                        <h4 className="text-white font-semibold flex items-center gap-2">
                            Bulk Migration Active
                            <span className="text-[10px] bg-cyan-500 text-black font-bold px-1.5 py-0.5 rounded">BETA</span>
                        </h4>
                        <p className="text-sm text-cyan-100/60 mt-1">
                            Drag your current spreadsheet here. We'll automatically map students to their respective classes and hostels.
                        </p>
                    </div>
                </div>

                {/* Dropzone */}
                <div className="border-2 border-dashed border-white/10 p-12 rounded-3xl flex flex-col items-center justify-center bg-black/20 hover:bg-black/40 hover:border-cyan-500/30 transition-all cursor-pointer group">
                    <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FileSpreadsheet className="h-8 w-8 text-slate-400 group-hover:text-white" />
                    </div>
                    <button className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-cyan-400 hover:text-black transition-colors shadow-lg">
                        Select CSV File
                    </button>
                    <p className="mt-4 text-xs text-gray-500 font-mono">Supported formats: .csv, .xlsx (Max 5,000 students)</p>
                </div>
            </div>

            <div className="flex gap-4 pt-4">
                <Button variant="ghost" onClick={onBack} className="text-slate-400 hover:text-white">
                    Back
                </Button>
                <Button
                    onClick={onNext}
                    className="flex-1 bg-[#0066FF] hover:bg-blue-600 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-500/20"
                >
                    Continue to Final Review <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
            <p className="text-center text-xs text-slate-600">
                You can also skip this step and manually enroll students later.
            </p>
        </div>
    )
}
