"use client"

import { useState } from "react"
import { useAdmissionStore } from "@/lib/stores/admission-store"
import { AdmissionWizard } from "@/components/admissions/admission-wizard"
import { BulkUploader } from "@/components/admissions/bulk-uploader"
import { SuccessCard } from "@/components/admissions/success-card"
import { Button } from "@/components/ui/button"
import { UserPlus, UploadCloud, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface AdmissionsClientProps {
    domain: string
    classes: any[]
    houses: string[]
}

export function AdmissionsClient({ domain, classes, houses }: AdmissionsClientProps) {
    const { isBulkMode, setBulkMode, isSuccess, setSuccess, reset } = useAdmissionStore()

    const handleReset = () => {
        setSuccess(false)
        reset()
    }

    return (
        <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
            {isSuccess && <SuccessCard onClose={handleReset} />}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="antialiased">
                    <Link href={`/${domain}/dashboard`} className="text-slate-300 hover:text-white flex items-center gap-2 text-sm mb-2 transition-colors duration-200">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Student Admissions</h1>
                    <p className="text-slate-400 mt-1">Onboard new students individually or in bulk.</p>
                </div>

                {/* Dual-Path Switch */}
                <div className="flex p-1 bg-slate-900 rounded-lg border border-white/10">
                    <button
                        onClick={() => setBulkMode(false)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300",
                            !isBulkMode
                                ? "bg-[var(--school-accent)] text-white shadow-lg"
                                : "text-slate-400 hover:text-white"
                        )}
                        style={!isBulkMode ? { backgroundColor: 'var(--school-accent)' } : {}}
                    >
                        <UserPlus className="h-4 w-4" />
                        Single Admission
                    </button>
                    <button
                        onClick={() => setBulkMode(true)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300",
                            isBulkMode
                                ? "bg-[var(--school-accent)] text-white shadow-lg"
                                : "text-slate-400 hover:text-white"
                        )}
                        style={isBulkMode ? { backgroundColor: 'var(--school-accent)' } : {}}
                    >
                        <UploadCloud className="h-4 w-4" />
                        Bulk Upload
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-slate-900/50 border border-white/5 rounded-2xl backdrop-blur-sm overflow-hidden md:p-8 p-4 relative">
                {/* Decorative background blobs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--school-accent)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" style={{ backgroundColor: 'rgb(var(--school-accent-rgb) / 0.05)' }} />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                {isBulkMode ? (
                    <BulkUploader domain={domain} classes={classes} />
                ) : (
                    <AdmissionWizard classes={classes} houses={houses} />
                )}
            </div>
        </div>
    )
}
