"use client"

import React, { useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Download, Award, GraduationCap, Sparkles, ShieldCheck } from "lucide-react"
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer
} from 'recharts'
import { Playfair_Display, Inter } from 'next/font/google'

// Font Configuration
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' })
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

// Mock Data
const STUDENT_DATA = {
    name: "Chidi Okeke",
    class: "JSS 2A",
    sex: "Male",
    age: "12",
    term: "Second Term 2025/2026",
    schoolName: "Blue Horizon High",
    address: "123 Education Lane, Lagos, Nigeria"
}

const RESULTS_DATA = [
    { subject: "Mathematics", ca1: 18, ca2: 19, exam: 55, total: 92, grade: "A+", position: "1st", fullMark: 100 },
    { subject: "English", ca1: 15, ca2: 16, exam: 45, total: 76, grade: "A", position: "3rd", fullMark: 100 },
    { subject: "Basic Sci.", ca1: 14, ca2: 14, exam: 40, total: 68, grade: "B", position: "8th", fullMark: 100 },
    { subject: "Social Stud.", ca1: 20, ca2: 20, exam: 58, total: 98, grade: "A+", position: "1st", fullMark: 100 },
    { subject: "Bus. Studies", ca1: 10, ca2: 12, exam: 30, total: 52, grade: "C", position: "15th", fullMark: 100 },
    { subject: "Civic Edu.", ca1: 12, ca2: 10, exam: 15, total: 37, grade: "F", position: "25th", fullMark: 100 },
    { subject: "Agric. Sci.", ca1: 16, ca2: 17, exam: 50, total: 83, grade: "A", position: "2nd", fullMark: 100 },
]

const AI_REMARKS = "Chidi has shown a remarkable grasp of Mathematics and Social Studies this term, consistently topping the class with exceptional scores. However, there is a noticeable dip in Civic Education where more attention is needed to grasp the core concepts. Overall, he is a bright student with highly promising potential if he maintains this momentum."

export default function ResultCheckerPage() {
    const componentRef = useRef<HTMLDivElement>(null)

    // Fix: Handle Hydration Error by setting date on client update only
    const [dateStr, setDateStr] = React.useState("")

    React.useEffect(() => {
        setDateStr(new Date().toLocaleDateString())
    }, [])

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `${STUDENT_DATA.name}_Result_${STUDENT_DATA.term}`,
    })

    return (
        <div className={`space-y-8 animate-in fade-in duration-500 pb-20 ${inter.variable} ${playfair.variable} font-sans`}>
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white glow-blue font-serif">Result Checker</h2>
                    <p className="text-slate-400">View and download termly performance reports.</p>
                </div>
                <button
                    onClick={() => handlePrint && handlePrint()}
                    className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold px-6 py-2.5 rounded-full transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] active:scale-95"
                >
                    <Download className="w-5 h-5" />
                    Download / Print
                </button>
            </div>

            {/* A4 Container Wrapper */}
            <div className="flex justify-center">
                {/* The Glass-Doc (A4 Proportions) */}
                <div
                    ref={componentRef}
                    className="w-full max-w-[210mm] min-h-[297mm] bg-slate-950/80 backdrop-blur-md relative border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.1)] p-8 md:p-12 print:p-0 print:shadow-none print:border-none print:bg-white print:text-black print:backdrop-blur-none print:min-h-0 print:max-h-[297mm] overflow-hidden isolate"
                >

                    {/* Print-specific black text override wrapper */}
                    <div className="print:text-black text-slate-100 flex flex-col min-h-[280mm] print:h-[287mm] print:block relative">

                        {/* 1. Header with Authority */}
                        <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-cyan-500/20 pb-6 mb-8 print:border-black print:flex-row print:mb-4 print:pb-2">
                            <div className="flex items-center gap-5">
                                <div className="h-24 w-24 bg-gradient-to-br from-cyan-950/50 to-slate-900/50 border border-cyan-500/30 rounded-full flex items-center justify-center print:border-black print:bg-none shadow-lg shadow-cyan-900/20 print:shadow-none print:h-16 print:w-16">
                                    <ShieldCheck className="h-12 w-12 text-cyan-400 print:text-black print:h-8 print:w-8" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold font-serif tracking-tight text-cyan-100 print:text-black leading-none mb-2">{STUDENT_DATA.schoolName}</h1>
                                    <p className="text-xs text-cyan-500/80 print:text-gray-600 tracking-[0.2em] font-bold uppercase">Excellence in Knowledge</p>
                                    <p className="mt-1 text-xs text-slate-500 print:text-gray-500 font-medium">{STUDENT_DATA.address}</p>
                                </div>
                            </div>
                            <div className="mt-6 md:mt-0 text-right print:mt-0">
                                <h3 className="text-lg font-bold text-white print:text-black uppercase font-serif tracking-wide border-b border-cyan-500/30 print:border-black pb-1 mb-2 inline-block">{STUDENT_DATA.term}</h3>
                                <div className="text-sm text-slate-300 print:text-gray-800 space-y-1.5 text-right font-mono md:font-sans">
                                    <p><span className="text-slate-500 print:text-gray-600 mr-2 text-xs uppercase tracking-wider">Name</span> <span className="font-bold text-base">{STUDENT_DATA.name}</span></p>
                                    <div className="flex justify-end gap-4 text-xs">
                                        <p><span className="text-slate-500 print:text-gray-600 mr-1">Class:</span> <span className="font-bold">{STUDENT_DATA.class}</span></p>
                                        <p><span className="text-slate-500 print:text-gray-600 mr-1">Sex:</span> <span className="font-bold">{STUDENT_DATA.sex}</span></p>
                                        <p><span className="text-slate-500 print:text-gray-600 mr-1">Age:</span> <span className="font-bold">{STUDENT_DATA.age}</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Watermark Logo */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[-1]">
                            <GraduationCap className="w-[600px] h-[600px] text-cyan-500/5 print:text-black/5" />
                        </div>

                        {/* Layout Grid: Table + Analytics */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 print:grid-cols-3 print:gap-4 print:mb-2">

                            {/* 2. Main Academic Table */}
                            <div className="lg:col-span-2 print:col-span-2">
                                <h4 className="flex items-center gap-2 text-cyan-400 font-bold mb-4 uppercase text-xs tracking-widest print:text-black border-l-4 border-cyan-500 pl-3">
                                    Academic Performance
                                </h4>
                                <div className="overflow-x-auto rounded-none border-t-2 border-cyan-500/30 print:border-black scrollbar-hide">
                                    <table className="w-full text-sm border-collapse">
                                        <thead className="bg-cyan-950/20 text-cyan-200 uppercase text-[10px] tracking-wider font-bold print:bg-gray-100 print:text-black">
                                            <tr>
                                                <th className="px-4 py-3 text-left sticky left-0 bg-slate-950 print:bg-white z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] print:shadow-none min-w-[120px]">Subject</th>
                                                <th className="px-1 py-3 text-center w-12 text-[10px] print:text-xs">CA1</th>
                                                <th className="px-1 py-3 text-center w-12 text-[10px] print:text-xs">CA2</th>
                                                <th className="px-1 py-3 text-center w-12 text-[10px] print:text-xs">Exam</th>
                                                <th className="px-2 py-3 text-center w-16 bg-white/5 print:bg-gray-50 text-[10px] print:text-xs">Total</th>
                                                <th className="px-2 py-3 text-center w-12 text-[10px] print:text-xs">Grade</th>
                                                <th className="px-2 py-3 text-center w-16 opacity-70 text-[10px] print:text-xs">Pos</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/[0.05] print:divide-gray-300 font-mono md:font-sans">
                                            {RESULTS_DATA.map((row, idx) => {
                                                const isFailure = row.total < 40;
                                                const isExcellent = row.total >= 75;
                                                return (
                                                    <tr key={idx} className={`
                                                        group transition-colors
                                                        odd:bg-white/[0.02] even:bg-white/[0.04] 
                                                        print:odd:bg-transparent print:even:bg-gray-50
                                                        hover:bg-cyan-500/5 print:hover:bg-transparent
                                                    `}>
                                                        <td className="px-4 py-2.5 font-bold text-slate-200 print:text-black sticky left-0 bg-inherit z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)] print:shadow-none border-r border-white/5 print:border-black text-xs">
                                                            {row.subject}
                                                        </td>
                                                        <td className="px-1 py-2.5 text-center text-slate-400 print:text-black text-xs">{row.ca1}</td>
                                                        <td className="px-1 py-2.5 text-center text-slate-400 print:text-black text-xs">{row.ca2}</td>
                                                        <td className="px-1 py-2.5 text-center text-slate-400 print:text-black text-xs">{row.exam}</td>
                                                        <td className={`px-2 py-2.5 text-center font-bold bg-white/5 print:bg-transparent ${isFailure ? 'text-red-500' : 'text-slate-100'} print:text-black text-xs`}>
                                                            {row.total}
                                                        </td>
                                                        <td className="px-2 py-2.5 text-center">
                                                            <span className={`
                                                                inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold
                                                                ${isExcellent ? 'text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)] bg-cyan-950/30' : ''}
                                                                ${isFailure ? 'text-red-500 bg-red-950/20 border border-red-900/50' : ''}
                                                                ${!isExcellent && !isFailure ? 'text-slate-400' : ''}
                                                                print:shadow-none print:bg-transparent print:border-none print:text-black
                                                            `}>
                                                                {row.grade}
                                                            </span>
                                                        </td>
                                                        <td className="px-2 py-2.5 text-center text-xs text-slate-500 print:text-gray-600">{row.position}</td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* 3. Analytics Sidebar (Radar Chart) */}
                            <div className="lg:col-span-1 print:col-span-1 flex flex-col items-center justify-center bg-white/[0.02] rounded-lg border border-white/5 p-4 print:border-gray-200 print:h-auto print:p-2">
                                <h5 className="text-[10px] uppercase tracking-widest text-slate-500 mb-4 font-bold border-b border-white/10 pb-2 w-full text-center print:text-black print:mb-1">Performance Radar</h5>
                                <div className="w-full h-[250px] print:h-[180px] text-xs relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RESULTS_DATA}>
                                            <PolarGrid stroke="#334155" strokeDasharray="3 3" className="print:stroke-gray-400" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} className="print:fill-black print:text-[8px] print:font-bold" />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                            <Radar
                                                name="Student"
                                                dataKey="total"
                                                stroke="#06b6d4"
                                                strokeWidth={2}
                                                fill="#06b6d4"
                                                fillOpacity={0.3}
                                                isAnimationActive={false}
                                                className="print:fill-none print:stroke-black print:stroke-2"
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 text-center print:hidden">
                                    <p className="text-2xl font-bold text-white print:text-black font-serif">72.6%</p>
                                    <p className="text-[10px] uppercase text-cyan-500 print:text-gray-600 tracking-wider">Average Score</p>
                                </div>
                            </div>
                        </div>

                        {/* Spacer to push narrative down */}
                        <div className="flex-grow print:block hidden h-[40mm]"></div>

                        {/* 4. AI & Signatures */}
                        <div className="mt-auto print:mt-0">
                            <div className="grid md:grid-cols-3 gap-8 items-end print:grid-cols-3 print:gap-4">
                                {/* AI Section */}
                                <div className="md:col-span-2 print:col-span-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="p-1 rounded-md bg-cyan-900/30 print:hidden">
                                            <Sparkles className="h-2.5 w-2.5 text-cyan-400" />
                                        </div>
                                        <h4 className="text-cyan-400 font-bold uppercase text-xs tracking-widest print:text-black font-bold">
                                            Academic Performance Narrative
                                        </h4>
                                    </div>
                                    <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border-l-2 border-cyan-500 p-6 rounded-r-lg relative overflow-hidden print:bg-none print:text-black print:border-l-4 print:border-black print:pl-3 print:p-0 print:text-xs">
                                        {/* Decorative Quote */}
                                        <span className="absolute top-2 left-2 text-4xl text-cyan-500/10 font-serif print:hidden">“</span>
                                        <p className="text-slate-300 font-serif italic text-sm leading-relaxed relative z-10 print:text-black print:text-xs">
                                            "{AI_REMARKS}"
                                        </p>
                                        <p className="mt-2 text-[10px] text-cyan-600/60 font-medium uppercase tracking-wider print:text-gray-500">
                                            Approved by Mr. Adebayo (Class Teacher)
                                        </p>
                                    </div>
                                </div>

                                {/* Stamp & Signature */}
                                <div className="flex flex-col items-center justify-end">
                                    <div className="relative mb-2 group">
                                        {/* Digital Stamp - Corrected for Print Visibility */}
                                        <div className="h-28 w-28 rounded-full border-[3px] border-cyan-600/40 flex flex-col items-center justify-center p-2 rotate-[-12deg] mask-ink print:border-2 print:border-black opacity-80 mix-blend-screen print:mix-blend-normal print:opacity-100 transition-transform group-hover:rotate-0 print:h-20 print:w-20 print:rotate-0">
                                            <span className="text-[8px] uppercase tracking-widest text-cyan-700 font-bold print:text-black text-center print:text-[5px]">Verified Result</span>
                                            <span className="text-[10px] font-black uppercase text-cyan-500 print:text-black text-center my-1 leading-tight print:text-[8px]">Blue Horizon<br />High School</span>
                                            <span className="text-[8px] text-cyan-800 print:text-black font-mono print:text-[5px]">{dateStr}</span>
                                        </div>
                                        {/* Ink Glow */}
                                        <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full print:hidden"></div>
                                    </div>
                                    <div className="w-40 border-b border-slate-600 print:border-black mb-1"></div>
                                    <p className="text-[10px] uppercase tracking-widest text-slate-500 print:text-black font-bold">Principal's Signature</p>
                                </div>
                            </div>
                        </div>

                        {/* Document Footer */}
                        <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-600 uppercase tracking-wider print:border-black print:text-black print:mt-2 print:pt-1">
                            <p className="print:hidden">Generated via School SaaS Portal</p>
                            <p className="hidden print:block font-mono text-[8px]">Official Document • EduFlow • {dateStr}</p>
                            <p>Page 1 of 1</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Optimizations */}
            <style jsx global>{`
                @media print {
                    @page { 
                        size: A4; 
                        margin: 0; 
                    }
                    body { 
                        background: white !important; 
                        color: black !important; 
                        margin: 10mm !important;
                        -webkit-print-color-adjust: exact; 
                        print-color-adjust: exact; 
                    }
                    
                    /* Hide UI elements */
                    header, footer, nav { display: none !important; }

                    /* Container Scaling for Fit - Strict single page */
                    .print\\:text-black {
                        transform: scale(0.9);
                        transform-origin: top center;
                        width: 100%;
                        max-height: 275mm; 
                        overflow: hidden;
                    }

                    /* --- RADAR CHART FIXES --- */
                    .recharts-radar-polygon {
                        fill: none !important;
                        fill-opacity: 0 !important;
                        stroke: #000 !important;
                        stroke-width: 2px !important;
                    }
                    
                    /* Target internal path elements */
                    .recharts-radar-polygon path {
                        fill: none !important;
                        fill-opacity: 0 !important;
                        stroke: #000 !important;
                    }

                    /* Student data selector */
                    path[name="Student"] {
                        fill: none !important;
                        fill-opacity: 0 !important;
                        stroke: #000 !important;
                    }

                    /* Grid Lines */
                    .recharts-polar-grid-angle line, 
                    .recharts-polar-grid-concentric path,
                    .recharts-polar-grid-concentric polygon { 
                        stroke: #ccc !important; 
                        fill: none !important;
                    }

                    /* Axis Labels */
                    .recharts-text { 
                        fill: white !important; /* Forces white then override */
                        fill: black !important; 
                        font-size: 8px !important; 
                        font-weight: bold !important;
                    }
                    /* ------------------------- */
                    
                    .glow-blue { text-shadow: none !important; color: black !important; }
                    /* Remove all dark modes */
                    .bg-slate-950, .bg-slate-900, .bg-cyan-950, .bg-slate-950\\/80 { background: white !important; }
                    * { border-color: black !important; }
                    /* Ensure Radar Chart is visible */
                    .recharts-wrapper { display: block !important; }
                    
                    /* Avoid Breaks */
                    .print\\:text-black > div {
                        break-inside: avoid;
                    }
                }
                /* Ink Mask for Stamp */
                .mask-ink {
                    mask-image: url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E");
                    mask-mode: alpha;
                }
            `}</style>
        </div>
    )
}
