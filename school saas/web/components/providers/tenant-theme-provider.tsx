"use client"

import { useEffect } from "react"

interface TenantThemeProviderProps {
    children: React.ReactNode
    primaryColor?: string
}

export function TenantThemeProvider({ children, primaryColor = "#06b6d4" }: TenantThemeProviderProps) {
    useEffect(() => {
        const root = document.documentElement

        // Convert hex to RGB for opacity modifiers
        const hexToRgb = (hex: string) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
            return result
                ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
                : "6 182 212" // Default Cyan
        }

        root.style.setProperty("--school-accent", primaryColor)
        root.style.setProperty("--school-accent-rgb", hexToRgb(primaryColor))

    }, [primaryColor])

    return <>{children}</>
}
