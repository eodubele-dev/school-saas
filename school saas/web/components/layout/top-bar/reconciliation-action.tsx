"use client"

import { FileText } from "lucide-react"

export function ReconciliationAction() {
    // In future, this updates a state or opens a modal
    return (
        <button className="hidden md:flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]">
            <FileText size={14} /> NEW_RECONCILIATION
        </button>
    )
}
