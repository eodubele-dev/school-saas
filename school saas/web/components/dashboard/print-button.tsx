"use client"

import { Printer } from 'lucide-react'

export function PrintActivityButton() {
    return (
        <button
            onClick={() => window.print()}
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 cursor-pointer transition-colors bg-blue-500/10 px-3 py-1 rounded border border-blue-500/20"
        >
            <Printer className="w-4 h-4" /> Print Activity
        </button>
    )
}
