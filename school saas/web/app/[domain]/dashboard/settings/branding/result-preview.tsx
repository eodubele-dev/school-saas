"use client"

import { useEffect, useRef, useState } from "react"
import { ResultSheet } from "@/components/results/result-sheet"
import { ResultData } from "@/types/results"

export function ResultPreview({ data }: { data: any }) {
    const containerRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(0.4)
    const [containerHeight, setContainerHeight] = useState(0)

    useEffect(() => {
        const container = containerRef.current
        const content = contentRef.current
        if (!container || !content) return

        const updateDimensions = () => {
            const containerWidth = container.offsetWidth
            // 210mm is ~794px. We calculate scale to fit width exactly.
            const newScale = containerWidth / 794
            setScale(newScale)

            // Calculate scaled height based on actual content height
            const contentHeight = content.scrollHeight
            const scaledHeight = contentHeight * newScale
            setContainerHeight(scaledHeight)
        }

        // Observer for container width changes
        const containerObserver = new ResizeObserver(() => {
            window.requestAnimationFrame(updateDimensions)
        })

        // Observer for content height changes (e.g. data loading)
        const contentObserver = new ResizeObserver(() => {
            window.requestAnimationFrame(updateDimensions)
        })

        containerObserver.observe(container)
        contentObserver.observe(content)

        // Initial call
        updateDimensions()

        return () => {
            containerObserver.disconnect()
            contentObserver.disconnect()
        }
    }, [data]) // Re-run if data changes as it might affect height

    // Construct real-time mock data for the preview
    const mockResultData: ResultData = {
        student: {
            id: "preview-student-id",
            full_name: "Adeboye Daniel",
            admission_number: "AIC/2023/001",
            class_name: "JSS 2A",
            house: "Blue House",
            passport_url: "", // Empty will show fallback
        },
        school_details: {
            name: data?.name || "School Name",
            address: data?.address || "123 School Address, State",
            motto: data?.motto || "Excellence in Knowledge",
            logo_url: data?.logo_url || "",
            theme: {
                primary_color: data?.theme_config?.primary || "#2563eb",
                secondary_color: data?.theme_config?.secondary || "#1e293b",
                accent_color: data?.theme_config?.accent || "#0ea5e9"
            }
        },
        term_info: {
            term: "2nd",
            session: "2025/2026",
            next_term_begins: "12th Jan, 2026",
            date_issued: new Date().toLocaleDateString('en-GB')
        },
        attendance: {
            total_days: 120,
            present: 118,
            absent: 2
        },
        academic: {
            average: 84.5,
            total_score: 324,
            subjects: [
                { name: "Mathematics", ca1: 18, ca2: 19, exam: 50, total: 87, grade: "A", position: "1st", remarks: "Excellent" },
                { name: "English Language", ca1: 15, ca2: 16, exam: 45, total: 76, grade: "B", position: "5th", remarks: "Good result" },
                { name: "Basic Science", ca1: 20, ca2: 20, exam: 55, total: 95, grade: "A+", position: "1st", remarks: "Outstanding" },
                { name: "Civic Education", ca1: 12, ca2: 14, exam: 40, total: 66, grade: "B", position: "12th", remarks: "Satisfactory" },
            ]
        },
        character: {
            affective_domain: {
                "Punctuality": 5,
                "Neatness": 4,
                "Politeness": 5,
                "Honesty": 5,
                "Leadership": 4
            },
            teacher_remark: "Daniel is a very brilliant and well-behaved student. He shows great leadership potential.",
            principal_remark: "An excellent performance. Keep up the good work and maintain this standard."
        }
    }

    return (
        <div className="space-y-6 lg:sticky lg:top-24">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Live Result Preview</h3>

            {/* Preview Container - Scaled to fit content */}
            <div
                ref={containerRef}
                className="relative w-full bg-slate-900/50 border border-white/10 rounded-xl shadow-2xl overflow-hidden group transition-all duration-300 ease-out"
                style={{
                    height: containerHeight > 0 ? `${containerHeight + 2}px` : 'auto', // +2 for border compensation
                    minHeight: '200px'
                }}
            >
                {/* Visual Overlay / Glare */}
                <div className="absolute inset-0 pointer-events-none border-4 border-slate-900/10 rounded-xl ring-1 ring-white/5 z-20"></div>

                {/* 
                   The ResultSheet is absolutely positioned and scaled from top-left.
                   The container height is kept in sync with the scaled content height via JS.
                */}
                <div
                    ref={contentRef}
                    className="absolute top-0 left-0 origin-top-left transition-transform duration-300 ease-out will-change-transform"
                    style={{
                        transform: `scale(${scale})`,
                        width: '794px', // A4 Width in px at 96 DPI
                        // Removed fixed height so it can grow
                    }}
                >
                    <ResultSheet data={mockResultData} />
                </div>
            </div>

            <div className="p-6 bg-slate-900/50 border border-white/5 rounded-xl space-y-3">
                <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: mockResultData.school_details.theme?.primary_color }}></div>
                        <span className="text-slate-400">Primary</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: mockResultData.school_details.theme?.secondary_color }}></div>
                        <span className="text-slate-400">Secondary</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: mockResultData.school_details.theme?.accent_color }}></div>
                        <span className="text-slate-400">Accent</span>
                    </div>
                </div>
                <p className="text-xs text-slate-500 pt-2">
                    * The preview auto-scales to fit your screen. Actual output is standard A4.
                </p>
            </div>
        </div>
    )
}
