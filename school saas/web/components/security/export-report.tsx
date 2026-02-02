'use client'

import { Button } from "@/components/ui/button"
import { FileDown, Printer } from "lucide-react"

export function ExportReportButton() {
    const handleExport = () => {
        // In a real implementation, we would fetch all filtered data and generate a PDF.
        // For this MVP, we'll trigger the browser print dialog which works surprisingly well
        // for "Compliance Reports" if the page CSS is print-friendly.
        window.print()
    }

    return (
        <Button
            onClick={handleExport}
            variant="outline"
            className="border-slate-800 bg-black/20 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/30 gap-2"
        >
            <Printer className="h-4 w-4" />
            Generate Compliance Report
        </Button>
    )
}
