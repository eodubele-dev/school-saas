
"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { useSearchParams, usePathname } from "next/navigation"

interface ExecutiveConversionContextType {
    isTenantPreviewOpen: boolean
    isExecutiveDemoOpen: boolean
    isMegaMenuOpen: boolean
    isPhysicalDemoOpen: boolean
    isSupportOpen: boolean
    shouldPlayVideoDemo: boolean
    highlightedSection: string | null
    openTenantPreview: () => void
    closeTenantPreview: () => void
    openExecutiveDemo: () => void
    closeExecutiveDemo: () => void
    openMegaMenu: () => void
    closeMegaMenu: () => void
    toggleMegaMenu: () => void
    openPhysicalDemo: () => void
    closePhysicalDemo: () => void
    openSupport: () => void
    closeSupport: () => void
    triggerVideoDemo: () => void
    resetVideoDemo: () => void
    scrollToSection: (sectionId: string, highlight?: boolean) => void
}

const ExecutiveConversionContext = createContext<ExecutiveConversionContextType | undefined>(undefined)

export function ExecutiveConversionProvider({ children }: { children: ReactNode }) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const [isTenantPreviewOpen, setIsTenantPreviewOpen] = useState(false)
    const [isExecutiveDemoOpen, setIsExecutiveDemoOpen] = useState(false)
    const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false)
    const [isPhysicalDemoOpen, setIsPhysicalDemoOpen] = useState(false)
    const [isSupportOpen, setIsSupportOpen] = useState(false)
    const [shouldPlayVideoDemo, setShouldPlayVideoDemo] = useState(false)
    const [highlightedSection, setHighlightedSection] = useState<string | null>(null)

    // Handle deep linking and highlighting on mount
    useEffect(() => {
        const hash = window.location.hash.substring(1)
        const highlight = searchParams.get('highlight')

        if (hash || highlight) {
            const targetId = highlight || hash
            // Wait for components to mount
            setTimeout(() => {
                const element = document.getElementById(targetId)
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    if (highlight) {
                        setHighlightedSection(highlight)
                        setTimeout(() => setHighlightedSection(null), 3000)
                    }
                }
            }, 800)
        }
    }, [pathname, searchParams])

    const openTenantPreview = () => setIsTenantPreviewOpen(true)
    const closeTenantPreview = () => setIsTenantPreviewOpen(false)

    const openExecutiveDemo = () => setIsExecutiveDemoOpen(true)
    const closeExecutiveDemo = () => setIsExecutiveDemoOpen(false)

    const openMegaMenu = () => setIsMegaMenuOpen(true)
    const closeMegaMenu = () => setIsMegaMenuOpen(false)
    const toggleMegaMenu = () => setIsMegaMenuOpen(!isMegaMenuOpen)

    const openPhysicalDemo = () => setIsPhysicalDemoOpen(true)
    const closePhysicalDemo = () => setIsPhysicalDemoOpen(false)

    const openSupport = () => setIsSupportOpen(true)
    const closeSupport = () => setIsSupportOpen(false)

    const triggerVideoDemo = () => {
        const videoSection = document.getElementById('video-demo')
        if (videoSection) {
            videoSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
            setShouldPlayVideoDemo(true)

            // Trigger "Glow Flash"
            videoSection.classList.add('ring-4', 'ring-cyan-500/50', 'shadow-[0_0_50px_rgba(6,182,212,0.5)]')
            setTimeout(() => {
                videoSection.classList.remove('ring-4', 'ring-cyan-500/50', 'shadow-[0_0_50px_rgba(6,182,212,0.5)]')
            }, 2000)
        }
    }

    const resetVideoDemo = () => setShouldPlayVideoDemo(false)

    const scrollToSection = (sectionId: string, highlight = false) => {
        const element = document.getElementById(sectionId)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            if (highlight) {
                setHighlightedSection(sectionId)
                setTimeout(() => setHighlightedSection(null), 3000)
            }
        } else {
            window.location.href = `/#${sectionId}${highlight ? '?highlight=' + sectionId : ''}`
        }
    }

    return (
        <ExecutiveConversionContext.Provider
            value={{
                isTenantPreviewOpen,
                isExecutiveDemoOpen,
                isMegaMenuOpen,
                isPhysicalDemoOpen,
                isSupportOpen,
                shouldPlayVideoDemo,
                highlightedSection,
                openTenantPreview,
                closeTenantPreview,
                openExecutiveDemo,
                closeExecutiveDemo,
                openMegaMenu,
                closeMegaMenu,
                toggleMegaMenu,
                openPhysicalDemo,
                closePhysicalDemo,
                openSupport,
                closeSupport,
                triggerVideoDemo,
                resetVideoDemo,
                scrollToSection
            }}
        >
            {children}
        </ExecutiveConversionContext.Provider>
    )
}

export function useExecutiveConversion() {
    const context = useContext(ExecutiveConversionContext)
    if (context === undefined) {
        throw new Error("useExecutiveConversion must be used within an ExecutiveConversionProvider")
    }
    return context
}
