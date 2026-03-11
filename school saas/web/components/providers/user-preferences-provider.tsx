"use client"

import { useEffect } from "react"
import { usePreferencesStore } from "@/lib/stores/preferences-store"

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
    const { theme, font_size, language } = usePreferencesStore()

    useEffect(() => {
        const root = document.documentElement

        // 1. Apply Font Size globally
        if (font_size) {
            root.style.fontSize = `${font_size}%`
        }

        // 2. Apply Accessibility Language
        if (language) {
            root.lang = language
        }

        // 3. Apply Theme Engine
        root.classList.remove('light', 'dark')
        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
            root.classList.add(systemTheme)
        } else {
            root.classList.add(theme)
        }

        // Optional: Listen for system theme changes if set to system
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (e: MediaQueryListEvent) => {
            if (theme === 'system') {
                root.classList.remove('light', 'dark')
                root.classList.add(e.matches ? 'dark' : 'light')
            }
        }
        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)

    }, [theme, font_size, language])

    return <>{children}</>
}
