"use client"

import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useState } from "react"
import { exportInvoices } from "@/lib/actions/export-finance"
import { toast } from "sonner"

export function InvoiceExportButton() {
    const [loading, setLoading] = useState(false)

    const handleExport = async () => {
        setLoading(true)
        try {
            const res = await exportInvoices()
            if (res.success && res.csv) {
                const blob = new Blob([res.csv], { type: 'text/csv' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = res.filename || 'invoices.csv'
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
                toast.success("Invoices exported successfully")
            } else {
                toast.error(res.error || "Failed to export invoices")
            }
        } catch (error) {
            toast.error("An error occurred during export")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button onClick={handleExport} disabled={loading} variant="outline" className="bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800 hover:text-white">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Export CSV
        </Button>
    )
}
