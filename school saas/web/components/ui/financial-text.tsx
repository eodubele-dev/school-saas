"use client"

import { usePreferencesStore } from "@/lib/stores/preferences-store"
import { cn } from "@/lib/utils"

interface FinancialTextProps {
    value: string | number
    className?: string
}

export function FinancialText({ value, className }: FinancialTextProps) {
    const { hide_financial_figures } = usePreferencesStore()

    return (
        <span
            className={cn(
                "transition-all duration-300",
                hide_financial_figures ? "blur-md opacity-60 hover:blur-none hover:opacity-100 cursor-help" : "",
                className
            )}
            title={hide_financial_figures ? "Reveal financial figure" : undefined}
        >
            {value}
        </span>
    )
}
