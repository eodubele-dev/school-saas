"use client"

import { Shield, Tent } from "lucide-react"
import { useEffect, useState, forwardRef } from "react"
import QRCode from "qrcode"

export const IdCardView = forwardRef<HTMLDivElement, { student: any, tenant: any }>(({ student, tenant }, ref) => {
    const [qrSrc, setQrSrc] = useState<string>("")

    useEffect(() => {
        if (student) {
            QRCode.toDataURL(`STUDENT:${student.id}:${student.metadata?.admission_number}`)
                .then(url => setQrSrc(url))
                .catch(err => console.error(err))
        }
    }, [student])

    return (
        <div ref={ref} className="w-[350px] h-[550px] bg-white text-black border-2 border-slate-200 rounded-xl overflow-hidden shadow-2xl relative mx-auto my-8 print:shadow-none print:border-0 print:mx-auto print:my-0 break-inside-avoid">

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            />

            {/* Header */}
            <div className="bg-[#0f172a] text-white pt-6 px-4 pb-16 text-center z-10 relative print:bg-[#0f172a] print:text-white print-color-adjust-exact">
                <div className="h-12 w-12 bg-white/10 rounded-full mx-auto mb-2 flex items-center justify-center border border-white/20 overflow-hidden">
                    {tenant?.logo_url ? (
                        <img src={tenant.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                        <Shield className="h-6 w-6 text-white" />
                    )}
                </div>
                <h1 className="text-lg font-bold uppercase tracking-wider leading-tight">{tenant?.name || "School SaaS"}</h1>
                <p className="text-[10px] text-slate-300 uppercase tracking-[0.2em] mt-1">{tenant?.motto || "Excellence & Integrity"}</p>
            </div>

            {/* Photo Area */}
            <div className="flex justify-center -mt-12 relative z-20">
                <div className="h-32 w-32 rounded-full border-4 border-white bg-slate-100 shadow-lg flex items-center justify-center overflow-hidden print:border-slate-200 bg-cover bg-center"
                    style={{ backgroundImage: student.avatar_url ? `url(${student.avatar_url})` : 'none' }}>
                    {/* Fallback Initial only if no image */}
                    {!student.avatar_url && (
                        <span className="text-4xl font-bold text-slate-300">{student.full_name?.charAt(0)}</span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="text-center mt-4 px-6 relative z-10">
                <h2 className="text-xl font-bold text-slate-900 leading-tight">{student.full_name}</h2>
                <span className="inline-block bg-[#0f172a] text-white text-xs font-bold px-3 py-1 rounded-full mt-2 mb-6 print:bg-[#0f172a] print:text-white print-color-adjust-exact">
                    STUDENT
                </span>

                <div className="grid grid-cols-2 gap-y-4 text-left text-sm border-t border-slate-100 pt-4">
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Class</p>
                        <p className="font-semibold text-slate-800">{student.class?.name || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Admission No</p>
                        <p className="font-semibold text-slate-800">{student.metadata?.admission_number}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">House</p>
                        <div className="flex items-center gap-1 font-semibold text-slate-800">
                            <Tent className="h-3 w-3 text-slate-400" />
                            {student.metadata?.house || "N/A"}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Session</p>
                        <p className="font-semibold text-slate-800">2025 / 2026</p>
                    </div>
                </div>
            </div>

            {/* Footer / Barcode */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-slate-50 text-left border-t border-slate-100 flex justify-between items-center">
                <p className="text-[8px] text-slate-400 leading-tight">
                    This card remains the property of<br />
                    <span className="font-bold text-slate-600">{tenant?.name || "School SaaS"}</span>.<br />
                    If found, please return to the school administration.
                </p>
                <div className="flex-shrink-0">
                    {qrSrc && <img src={qrSrc} alt="QR Code" className="h-12 w-12" />}
                </div>
            </div>
        </div>
    )
})

IdCardView.displayName = "IdCardView"
