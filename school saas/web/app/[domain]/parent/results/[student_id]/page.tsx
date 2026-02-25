import Link from "next/link"
import { notFound } from "next/navigation"
import { getStudentResultPortalData } from "@/lib/actions/parent-portal"
import { ResultGatekeeper } from "@/components/student/results/result-gatekeeper"
import { ResultSheet } from "@/components/results/result-sheet"
import { Button } from "@/components/ui/button"
import { Download, Share2 } from "lucide-react"
import Image from "next/image"

export default async function VerifiedResultPortal({ params }: { params: { domain: string, student_id: string } }) {
    const term = "1st Term"
    const session = "2025/2026"

    const { success, data, error } = await getStudentResultPortalData(params.student_id, term, session)

    if (!success || !data) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
                <p>Unable to load results. {error || "Student not found."}</p>
            </div>
        )
    }

    const { student, grades, billing, attendance, tenant, reportCard } = data

    // Construct ResultData shape for the ResultSheet component
    // We reuse existing component but will wrap it in the new Portal UI
    const resultSheetData = {
        student: {
            id: student.id,
            full_name: student.full_name,
            admission_number: student.admission_number || 'N/A',
            class_name: student.class?.name || 'Unknown',
            house: student.house,
            passport_url: student.passport_url
        },
        term_info: {
            term,
            session,
            next_term_begins: "12th Jan, 2026"
        },
        attendance: {
            total_days: attendance.total,
            present: attendance.present,
            absent: attendance.total - attendance.present
        },
        school_details: {
            name: tenant?.name || 'School Name',
            address: tenant?.address || 'School Address',
            motto: tenant?.motto || 'Excellence in Everything',
            logo_url: tenant?.logo_url || '/placeholder-logo.png',
            theme: tenant?.theme_config || {
                primary_color: '#2563eb',
                secondary_color: '#1e293b',
                accent_color: '#0ea5e9'
            }
        },
        academic: {
            subjects: grades.map((g: any) => ({
                name: g.subject?.name || 'Subject',
                ca1: g.ca1,
                ca2: g.ca2,
                exam: g.exam,
                total: g.total,
                grade: calculateGrade(g.total), // Helper needed or assumed
                remarks: "Excellent" // Placeholder or AI
            })),
            average: 0 // Calculate later
        },
        character: {
            teacher_remark: reportCard?.teacher_remark || "A very diligent and specialized student.",
            principal_remark: reportCard?.principal_remark || "Outstanding performance this term."
        }
    }

    return (
        <div className="min-h-screen bg-[#0F172A] pb-20">
            {/* 1. Identity & Attendance Header */}
            <div className="relative bg-slate-900 border-b border-white/5 pb-12 pt-24 px-4 md:px-8 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[url('/grid-pattern.svg')] bg-center [mask-image:linear-gradient(to_bottom,white,transparent)]" />

                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 relative z-10">
                    {/* Passport */}
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
                        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-slate-800 bg-slate-800 overflow-hidden shadow-2xl">
                            {student.passport_url ? (
                                <Image src={student.passport_url} alt={student.full_name} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                                    <span className="text-2xl">📷</span>
                                </div>
                            )}
                        </div>
                        {/* Status Badge */}
                        <div className="absolute bottom-0 right-0 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2 py-0.5 rounded-full backdrop-blur-md">
                            Active
                        </div>
                    </div>

                    {/* Info */}
                    <div className="text-center md:text-left flex-1">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">{student.full_name}</h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm text-slate-400 font-medium">
                            <span className="bg-slate-800/50 px-3 py-1 rounded-md border border-white/5">{student.admission_number}</span>
                            <span className="bg-slate-800/50 px-3 py-1 rounded-md border border-white/5">{student.class?.name}</span>
                            <span className="bg-slate-800/50 px-3 py-1 rounded-md border border-white/5">{term}</span>
                        </div>
                    </div>

                    {/* Live Attendance Tally */}
                    <div className="flex items-center gap-4 bg-slate-950/50 border border-white/5 p-4 rounded-xl backdrop-blur-sm">
                        <div className="relative w-16 h-16 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                <path className="text-cyan-500 transition-all duration-1000 ease-out" strokeDasharray={`${attendance.percentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            </svg>
                            <span className="absolute text-sm font-bold text-white">{attendance.percentage}%</span>
                        </div>
                        <div className="text-left">
                            <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Attendance</div>
                            <div className="text-white font-medium">{attendance.present} / {attendance.total} Days</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Controls */}
            <div className="max-w-5xl mx-auto px-4 md:px-8 mt-6 relative z-20 flex justify-between gap-3">
                <Link href="/dashboard">
                    <Button variant="outline" className="bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
                        ← Back to Dashboard
                    </Button>
                </Link>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        disabled={!billing.isPaid}
                        className="bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Share2 className="w-4 h-4 mr-2" /> Share
                    </Button>
                    <Button
                        disabled={!billing.isPaid}
                        className="bg-[var(--school-accent)] hover:bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/20 disabled:bg-slate-700 disabled:text-slate-500 disabled:shadow-none"
                    >
                        <Download className="w-4 h-4 mr-2" /> Download PDF
                    </Button>
                </div>
            </div>

            {/* 3. The Result Sheet (Gated) */}
            <div className="max-w-[210mm] mx-auto mt-8 px-4 md:px-0">
                <ResultGatekeeper isPaid={billing.isPaid} balance={billing.balance} email={student.email || "parent@example.com"}>
                    <div className="transform transition-all active:scale-[0.99]">
                        <ResultSheet
                            data={resultSheetData as any}
                            schoolName={tenant.name}
                            schoolLogo={tenant.logo_url}
                        />
                    </div>
                </ResultGatekeeper>
            </div>
        </div>
    )
}

function calculateGrade(score: number) {
    if (score >= 70) return 'A'
    if (score >= 60) return 'B'
    if (score >= 50) return 'C'
    if (score >= 45) return 'D'
    if (score >= 40) return 'E'
    return 'F'
}
