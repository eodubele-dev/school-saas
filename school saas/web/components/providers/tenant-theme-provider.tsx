"use client"

import { useEffect } from "react"

interface TenantThemeProviderProps {
    children: React.ReactNode
    primaryColor?: string
    secondaryColor?: string
    accentColor?: string
}

export function TenantThemeProvider({
    children,
    primaryColor = "#06b6d4",
    secondaryColor = "#0f172a", // Default slate-900 backgroud
    accentColor = "#3b82f6"     // Default blue accent
}: TenantThemeProviderProps) {
    useEffect(() => {
        const root = document.documentElement

        // Convert hex to RGB for opacity modifiers
        const hexToRgb = (hex: string) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
            return result
                ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
                : "6 182 212" // Default Cyan
        }

        root.style.setProperty("--school-primary", primaryColor)
        root.style.setProperty("--school-primary-rgb", hexToRgb(primaryColor))

        root.style.setProperty("--school-secondary", secondaryColor)
        root.style.setProperty("--school-secondary-rgb", hexToRgb(secondaryColor))

        root.style.setProperty("--school-accent", accentColor)
        root.style.setProperty("--school-accent-rgb", hexToRgb(accentColor))

    }, [primaryColor, secondaryColor, accentColor])

    return <>{children}</>
}
