"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, Check } from "lucide-react"
import { generateRemarkAI, upsertGrade } from "@/lib/actions/gradebook"
import { toast } from "sonner"

interface RemarkGeneratorProps {
    studentName: string
    scores: { ca1: number, ca2: number, exam: number, total: number }
    currentRemark: string
    onUpdate: (remark: string) => void
    disabled?: boolean
}

export function RemarkGenerator({ studentName, scores, currentRemark, onUpdate, disabled }: RemarkGeneratorProps) {
    const [loading, setLoading] = useState(false)

    const handleGenerate = async () => {
        setLoading(true)
        try {
            const res = await generateRemarkAI(studentName, scores)
            if (res.success && res.remark) {
                onUpdate(res.remark)
                toast.success("Remark generated")
            } else {
                toast.error("Failed to generate remark")
            }
        } catch (error) {
            toast.error("AI Error")
        }
        setLoading(false)
    }

    if (disabled) return null

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleGenerate}
            disabled={loading}
            className="text-[var(--school-accent)] hover:text-white hover:bg-[var(--school-accent)]/20 h-6 px-2 text-xs"
            title="Generate AI Remark"
        >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
            {currentRemark ? "Regenerate" : "AI Remark"}
        </Button>
    )
}
