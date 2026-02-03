"use client"

import { ResultData } from "@/types/results"
import QRCode from 'qrcode'
import { useEffect, useState } from "react"
import { format } from "date-fns"
import Image from "next/image"

interface ResultSheetProps {
    data: ResultData
    schoolName: string
    schoolLogo: string
}

export function ResultSheet({ data, schoolName, schoolLogo }: ResultSheetProps) {
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

    useEffect(() => {
        // Generate QR Code acting as verification link
        const verificationUrl = `${window.location.origin}/verify/result/${data.student.id}`
        QRCode.toDataURL(verificationUrl, { margin: 1, width: 100 }, (err, url) => {
            if (!err) setQrCodeUrl(url)
        })
    }, [data.student.id])

    return (
        <div className="w-[210mm] min-h-[297mm] mx-auto bg-white p-10 text-slate-900 relative overflow-hidden shadow-2xl printable-sheet">
            {/* Watermark */}
            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                <div className="relative w-[500px] h-[500px]">
                    <Image
                        src={schoolLogo || "/placeholder-logo.png"}
                        alt="Watermark"
                        fill
                        className="object-contain rotate-[-30deg]"
                    />
                </div>
            </div>

            <div className="relative z-10 border-4 border-double border-slate-900 h-full p-8 flex flex-col">

                {/* Header */}
                <header className="flex justify-between items-center border-b-2 border-slate-900 pb-6 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20">
                            {schoolLogo && <Image src={schoolLogo} alt="School Logo" fill className="object-contain" />}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-wider">{schoolName}</h1>
                            <p className="text-sm font-medium text-slate-600 tracking-widest uppercase">Excellence • Integirty • Service</p>
                            <p className="text-xs text-slate-500 mt-1">123 Education Lane, Lagos, Nigeria | www.eduflow.ng</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end text-right">
                        <h2 className="text-2xl font-bold text-slate-800 uppercase">Student Report Sheet</h2>
                        <p className="font-semibold text-lg">{data.term_info.term} Term, {data.term_info.session}</p>
                    </div>
                </header>

                {/* Student Info & Passport */}
                <section className="grid grid-cols-[1fr_auto] gap-8 mb-8">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                        <div className="flex border-b border-slate-200 pb-1">
                            <span className="font-bold w-32 uppercase text-xs text-slate-500">Student Name:</span>
                            <span className="font-bold text-lg">{data.student.full_name}</span>
                        </div>
                        <div className="flex border-b border-slate-200 pb-1">
                            <span className="font-bold w-32 uppercase text-xs text-slate-500">Admission No:</span>
                            <span className="font-mono">{data.student.admission_number}</span>
                        </div>
                        <div className="flex border-b border-slate-200 pb-1">
                            <span className="font-bold w-32 uppercase text-xs text-slate-500">Class:</span>
                            <span>{data.student.class_name}</span>
                        </div>
                        <div className="flex border-b border-slate-200 pb-1">
                            <span className="font-bold w-32 uppercase text-xs text-slate-500">House:</span>
                            <span>{data.student.house || 'N/A'}</span>
                        </div>
                        <div className="flex border-b border-slate-200 pb-1">
                            <span className="font-bold w-32 uppercase text-xs text-slate-500">Next Term:</span>
                            <span>{data.term_info.next_term_begins}</span>
                        </div>
                    </div>

                    {/* Passport Frame */}
                    <div className="w-[120px] h-[120px] relative border-2 border-slate-300 rounded-lg overflow-hidden shadow-sm bg-slate-50">
                        {/* Fallback or valid image */}
                        {data.student.passport_url ? (
                            <Image
                                src={data.student.passport_url}
                                alt="Student Passport"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 uppercase text-center p-2">
                                Passport Photo
                            </div>
                        )}
                    </div>
                </section>

                {/* Attendance Tally */}
                <section className="mb-8">
                    <div className="border border-slate-900 rounded-none overflow-hidden flex">
                        <div className="bg-slate-900 text-white px-4 py-2 text-xs font-bold uppercase w-32 flex items-center">
                            Attendance Record
                        </div>
                        <div className="flex-1 flex divide-x divide-slate-200">
                            <div className="flex-1 px-4 py-2 text-center">
                                <div className="text-xs text-slate-500 uppercase">Days Open</div>
                                <div className="font-bold text-lg">{data.attendance.total_days}</div>
                            </div>
                            <div className="flex-1 px-4 py-2 text-center bg-green-50">
                                <div className="text-xs text-green-700 uppercase">Present</div>
                                <div className="font-bold text-lg text-green-700">{data.attendance.present}</div>
                            </div>
                            <div className="flex-1 px-4 py-2 text-center bg-red-50">
                                <div className="text-xs text-red-700 uppercase">Absent</div>
                                <div className="font-bold text-lg text-red-700">{data.attendance.absent}</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Grades Table */}
                <section className="mb-8 flex-1">
                    <table className="w-full text-sm border-collapse border border-slate-300">
                        <thead>
                            <tr className="bg-slate-100 text-slate-700 uppercase text-xs">
                                <th className="border border-slate-300 px-3 py-2 text-left w-1/3">Subject</th>
                                <th className="border border-slate-300 px-2 py-2 w-16 text-center">CA 1 (20)</th>
                                <th className="border border-slate-300 px-2 py-2 w-16 text-center">CA 2 (20)</th>
                                <th className="border border-slate-300 px-2 py-2 w-16 text-center">Exam (60)</th>
                                <th className="border border-slate-300 px-2 py-2 w-16 text-center font-bold bg-slate-200">Total</th>
                                <th className="border border-slate-300 px-2 py-2 w-16 text-center">Grade</th>
                                <th className="border border-slate-300 px-2 py-2 w-16 text-center">Pos</th>
                                <th className="border border-slate-300 px-3 py-2 text-left">Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.academic.subjects.map((subject, idx) => (
                                <tr key={idx} className="even:bg-slate-50/50">
                                    <td className="border border-slate-300 px-3 py-2 font-medium">{subject.name}</td>
                                    <td className="border border-slate-300 px-2 py-2 text-center text-slate-500">{subject.ca1}</td>
                                    <td className="border border-slate-300 px-2 py-2 text-center text-slate-500">{subject.ca2}</td>
                                    <td className="border border-slate-300 px-2 py-2 text-center font-medium">{subject.exam}</td>
                                    <td className="border border-slate-300 px-2 py-2 text-center font-bold bg-slate-50">{subject.total}</td>
                                    <td className={`border border-slate-300 px-2 py-2 text-center font-bold ${getGradeColor(subject.grade)}`}>{subject.grade}</td>
                                    <td className="border border-slate-300 px-2 py-2 text-center text-xs">{subject.position}</td>
                                    <td className="border border-slate-300 px-3 py-2 text-xs italic text-slate-600">{subject.remarks}</td>
                                </tr>
                            ))}
                            {/* Empty rows filler */}
                            {Array.from({ length: Math.max(0, 10 - data.academic.subjects.length) }).map((_, idx) => (
                                <tr key={`empty-${idx}`}>
                                    <td className="border border-slate-300 p-4"></td>
                                    <td className="border border-slate-300"></td>
                                    <td className="border border-slate-300"></td>
                                    <td className="border border-slate-300"></td>
                                    <td className="border border-slate-300"></td>
                                    <td className="border border-slate-300"></td>
                                    <td className="border border-slate-300"></td>
                                    <td className="border border-slate-300"></td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-900 text-white font-bold">
                                <td className="border border-slate-900 px-3 py-2">OVERALL AVERAGE</td>
                                <td colSpan={3} className="border border-slate-900"></td>
                                <td className="border border-slate-900 px-2 py-2 text-center text-lg">{data.academic.average}%</td>
                                <td colSpan={3} className="border border-slate-900"></td>
                            </tr>
                        </tfoot>
                    </table>
                </section>

                {/* Character & Remarks & QR Footer */}
                <div className="grid grid-cols-[1fr_200px] gap-8 mt-auto">
                    <div className="space-y-6">
                        {/* Remarks */}
                        <div className="bg-slate-50 p-4 border border-slate-200">
                            <h3 className="text-xs font-bold uppercase text-slate-500 mb-1">Class Teacher's Remark</h3>
                            <p className="font-handwriting text-lg text-blue-900 leading-snug">"{data.character.teacher_remark}"</p>
                        </div>
                        <div className="bg-slate-50 p-4 border border-slate-200">
                            <h3 className="text-xs font-bold uppercase text-slate-500 mb-1">Principal's Remark</h3>
                            <p className="font-handwriting text-lg text-slate-900 leading-snug">"{data.character.principal_remark}"</p>
                        </div>

                        <div className="flex gap-8 pt-4">
                            <div className="border-t border-slate-400 w-40 text-center pt-1">
                                <p className="text-xs uppercase font-bold text-slate-500">Principal's Signature</p>
                            </div>
                            <div className="border-t border-slate-400 w-40 text-center pt-1">
                                <p className="text-xs uppercase font-bold text-slate-500">Date Issued</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end justify-end space-y-2">
                        {qrCodeUrl && (
                            <img src={qrCodeUrl} alt="Verification QR" className="w-24 h-24 border border-slate-200 p-1 bg-white" />
                        )}
                        <p className="text-[10px] text-slate-400 text-right w-full leading-tight">
                            Scan to verify authenticity using<br />the EduFlow Secure Portal.
                        </p>
                    </div>
                </div>

            </div>

            {/* Branding Footer */}
            <div className="absolute bottom-0 inset-x-0 h-2 bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600"></div>
        </div>
    )
}

function getGradeColor(grade: string) {
    if (grade?.startsWith('A')) return 'text-green-600'
    if (grade?.startsWith('B')) return 'text-blue-600'
    if (grade?.startsWith('C')) return 'text-yellow-600'
    if (grade?.startsWith('F')) return 'text-red-600'
    return 'text-slate-700'
}
