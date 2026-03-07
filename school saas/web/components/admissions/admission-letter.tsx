"use client"

import React from 'react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface AdmissionLetterProps {
    data: any
    tenant: any
}

export const AdmissionLetter = React.forwardRef<HTMLDivElement, AdmissionLetterProps>(({ data, tenant }, ref) => {
    const primaryColor = tenant?.theme_config?.primary || '#2563eb'
    const schoolName = tenant?.name || "EduFlow International School"
    const motto = tenant?.motto || "Excellence in Education"
    const logoUrl = tenant?.logo_url

    return (
        <div
            ref={ref}
            className="bg-white text-slate-900 p-[15mm] w-[210mm] h-[297mm] mx-auto relative overflow-hidden print:m-0 print:shadow-none shadow-2xl"
            style={{
                fontFamily: "'Inter', sans-serif",
                '--school-accent': primaryColor
            } as any}
        >
            {/* Double-line Formal Border */}
            <div className="absolute inset-[10mm] border-4 border-[var(--school-accent)] pointer-events-none">
                <div className="absolute inset-[2px] border border-[var(--school-accent)]" />
            </div>

            {/* Watermark Logo */}
            {logoUrl && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] grayscale">
                    <img src={logoUrl} alt="" className="w-96 h-96 object-contain" />
                </div>
            )}

            {/* Header Area */}
            <header className="relative z-10 text-center space-y-3 mb-6 pt-4">
                {logoUrl && (
                    <img
                        src={logoUrl}
                        alt={schoolName}
                        className="mx-auto h-24 w-24 object-contain mb-4"
                    />
                )}
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold tracking-tight text-[var(--school-accent)] uppercase" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {schoolName}
                    </h1>
                    <p className="text-lg italic text-slate-500 font-medium mb-1">
                        {motto}
                    </p>
                    <p className="text-sm font-medium text-slate-600">
                        {tenant?.address || ''} {tenant?.settings?.school_phone ? `| ${tenant.settings.school_phone}` : ''}
                    </p>
                </div>
                <div className="w-32 h-1 bg-[var(--school-accent)] mx-auto mt-4" />
            </header>

            {/* Reference & Date */}
            <div className="relative z-10 flex justify-end mb-6 text-sm font-medium">
                <div className="text-right">
                    <p>Ref: <span className="uppercase">{data.admissionNumber}</span></p>
                    <p>{format(new Date(), 'do MMMM, yyyy')}</p>
                </div>
            </div>

            {/* Subject */}
            <div className="relative z-10 text-center mb-6">
                <h2 className="text-2xl font-black uppercase underline decoration-2 underline-offset-8 decoration-[var(--school-accent)]">
                    Provisional Letter of Admission
                </h2>
            </div>

            {/* Salutation & Body */}
            <div className="relative z-10 space-y-4 text-[11pt] leading-relaxed text-justify">
                <p className="font-bold">Dear Parent/Guardian of {data.firstName} {data.lastName},</p>

                <p>
                    We are pleased to offer <strong>{data.firstName} {data.lastName}</strong> provisional admission into
                    <strong> {data.className || data.classId}</strong> for the <strong>2025/2026</strong> academic session.
                    This offer is a recognition of the potential demonstrated during our assessment process and is
                    subject to the verification of all original documents and fulfillment of the initial financial obligations.
                </p>

                <p>
                    At {schoolName}, we are committed to providing a holistic and rigorous educational experience that
                    fosters both intellectual growth and character development. We look forward to welcoming you to our
                    vibrant academic community.
                </p>
            </div>

            {/* Data Grid */}
            <div className="relative z-10 my-6 bg-slate-50 border border-slate-200 p-5 rounded-lg grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <p className="text-[9pt] uppercase text-slate-500 font-bold">Student ID</p>
                    <p className="font-mono text-lg font-bold">{data.admissionNumber}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[9pt] uppercase text-slate-500 font-bold">House</p>
                    <p className="text-lg font-bold">{data.house || 'Assigned on Arrival'}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[9pt] uppercase text-slate-500 font-bold">Admission Date</p>
                    <p className="text-lg font-bold">{format(new Date(), 'MMM dd, yyyy')}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[9pt] uppercase text-slate-500 font-bold">Class</p>
                    <p className="text-lg font-bold">{data.className || data.classId}</p>
                </div>
            </div>

            {/* Signature Area */}
            <div className="relative z-10 pt-10 flex justify-end">
                <div className="w-64 relative text-center">
                    {/* Seal overlapping */}
                    <div className="absolute -top-16 -left-12 w-32 h-32 opacity-80 pointer-events-none">
                        <svg viewBox="0 0 100 100" className="w-full h-full text-cyan-500">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                            <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="2" />
                            <path id="curve" fill="transparent" d="M 18 50 a 32 32 0 1 1 64 0 a 32 32 0 1 1 -64 0" />
                            <text className="text-[4.5px] font-bold fill-current tracking-widest">
                                <textPath xlinkHref="#curve" startOffset="25%" textAnchor="middle">
                                    {schoolName.toUpperCase()} • PROVISIONAL ADMISSION •
                                </textPath>
                            </text>
                            <g transform="translate(35, 35) scale(0.3)">
                                <path fill="currentColor" d="M20,6L9,11L9,17C9,23.5 13.5,29.5 20,31C26.5,29.5 31,23.5 31,17L31,11L20,6M16,21L12.5,17.5L13.9,16.1L16,18.2L22.1,12.1L23.5,13.5L16,21Z" />
                            </g>
                        </svg>
                    </div>

                    <div className="border-t-2 border-slate-900 pt-2 relative">
                        {tenant?.settings?.principal_signature && (
                            <img
                                src={tenant.settings.principal_signature}
                                alt="Principal Signature"
                                className="absolute bottom-10 left-1/2 -translate-x-1/2 max-h-16 w-auto object-contain z-10 opacity-90 contrast-125 mix-blend-multiply"
                            />
                        )}
                        <p className="font-serif italic text-lg mb-1">{tenant?.settings?.principal_name || 'The Principal'}</p>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Principal's Signature</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="absolute bottom-[10mm] left-[20mm] right-[20mm] border-t border-slate-100 pt-2 flex justify-between text-[8pt] text-slate-400 font-medium no-print">
                <p>Generated via EduFlow Platinum Edition • {format(new Date(), 'yyyy-MM-dd')}</p>
                <p>Page 1 of 1</p>
            </footer>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
                
                @media print {
                    body {
                        background: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    html, body {
                        width: 210mm;
                        height: 297mm;
                    }
                    div {
                        box-shadow: none !important;
                        page-break-inside: avoid;
                    }
                }
            `}</style>
        </div>
    )
})

AdmissionLetter.displayName = 'AdmissionLetter'
