"use client"

import { useRef } from "react"
import { useReactToPrint } from "react-to-print"
import { Button } from "@/components/ui/button"
import { Printer, X } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"

export function StaffIDCard({ user, tenant }: { user: any, tenant: any }) {
    const cardRef = useRef<HTMLDivElement>(null)
    const handlePrint = useReactToPrint({
        contentRef: cardRef,
        documentTitle: `${user.full_name}_ID_Card`,
    })

    const primaryColor = tenant?.theme_config?.primary || '#2563eb'

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="flex items-center w-full cursor-pointer hover:bg-white/5 py-1.5 px-2 rounded-sm text-sm">
                    <span className="mr-2 h-4 w-4 items-center justify-center flex border border-current rounded-sm text-[10px] font-bold">ID</span>
                    View Digital ID
                </div>
            </DialogTrigger>
            <DialogContent className="bg-transparent border-none shadow-none text-white max-w-sm p-0 flex flex-col items-center">
                <div
                    ref={cardRef}
                    className="w-[85.6mm] h-[53.98mm] bg-white text-slate-900 overflow-hidden relative shadow-2xl rounded-xl print:rounded-none user-select-none"
                    style={{ fontFamily: "Arial, sans-serif" }}
                >
                    {/* Header Strip */}
                    <div className="h-4 w-full" style={{ backgroundColor: primaryColor }} />

                    <div className="flex h-full pl-4 pr-2 py-4">
                        {/* Photo Area */}
                        <div className="w-[28mm] flex flex-col items-center space-y-2 pt-2">
                            <div className="w-[24mm] h-[28mm] bg-slate-200 overflow-hidden border-2 border-slate-300">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-2xl">
                                        {user.full_name?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="text-center">
                                <p className="text-[6px] font-bold uppercase tracking-wider text-slate-500">Authorized Signature</p>
                                <div className="h-6 w-full mt-1 border-b border-slate-300"></div>
                            </div>
                        </div>

                        {/* Details Area */}
                        <div className="flex-1 pl-4 flex flex-col">
                            {/* School Logo/Name */}
                            <div className="flex items-start gap-2 mb-3">
                                {tenant?.logo_url && (
                                    <img src={tenant.logo_url} className="h-8 w-8 object-contain" alt="" />
                                )}
                                <div className="leading-tight">
                                    <h2 className="text-[9pt] font-black uppercase text-slate-900 leading-none">{tenant?.name || "School Name"}</h2>
                                    <p className="text-[6pt] text-slate-500 font-medium tracking-wide">STAFF IDENTITY CARD</p>
                                </div>
                            </div>

                            <div className="space-y-1.5 mt-1">
                                <div>
                                    <p className="text-[6pt] font-bold text-slate-400 uppercase">Name</p>
                                    <p className="text-[10pt] font-bold leading-none text-slate-900">{user.full_name}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="text-[6pt] font-bold text-slate-400 uppercase">Role</p>
                                        <p className="text-[8pt] font-bold leading-none capitalize" style={{ color: primaryColor }}>{user.role}</p>
                                    </div>
                                    <div>
                                        <p className="text-[6pt] font-bold text-slate-400 uppercase">Department</p>
                                        <p className="text-[8pt] font-bold leading-none capitalize">{user.department || "General"}</p>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <p className="text-[6pt] font-bold text-slate-400 uppercase">ID Number</p>
                                    <p className="font-mono text-[8pt] font-bold">{user.id.substring(0, 8).toUpperCase()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Strip */}
                    <div className="absolute bottom-0 w-full h-2" style={{ backgroundColor: primaryColor }} />
                </div>

                <div className="mt-6 flex gap-4">
                    <Button
                        onClick={() => handlePrint()}
                        className="bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-full"
                    >
                        <Printer className="mr-2 h-4 w-4" /> Print ID Card
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
