import { Check, X, Clock } from "lucide-react"

export function AttendanceMobileVisual() {
    return (
        <div className="relative w-[300px] h-[600px] bg-slate-900 rounded-[2.5rem] border-[4px] border-slate-800 shadow-2xl overflow-hidden mx-auto rotate-1 hover:rotate-0 transition-transform duration-500">
            {/* Tecno/Infinix Camera Hole */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 h-4 w-4 bg-black rounded-full z-20 shadow-inner ring-1 ring-slate-800"></div>

            {/* Content */}
            <div className="w-full h-full bg-slate-950 pt-10 px-4 pb-4 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-6 text-white">
                    <div className="text-lg font-bold">Class Attendance</div>
                    <div className="text-xs text-slate-400">JSS 2 Blue</div>
                </div>

                <div className="space-y-3 overflow-y-auto no-scrollbar pb-10">
                    {/* Student List */}
                    {[
                        { name: "Adewale Ogunleye", status: "present" },
                        { name: "Bianca Ojukwu", status: "absent" },
                        { name: "Chioma Adebayo", status: "late" },
                        { name: "David Collins", status: "present" },
                        { name: "Emmanuel Kalu", status: "present" },
                        { name: "Faith Eze", status: "present" }
                    ].map((student, i) => (
                        <div key={i} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-slate-800 text-[10px] flex items-center justify-center text-slate-400 font-bold border border-slate-700">
                                    {student.name.charAt(0)}
                                </div>
                                <div className="text-xs text-slate-300 font-medium">{student.name}</div>
                            </div>

                            <div className="flex gap-1.5">
                                <button className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${student.status === 'present' ? 'bg-green-500 text-white shadow-lg shadow-green-900/20' : 'bg-slate-800 text-slate-500'}`}>
                                    <Check className="h-4 w-4" />
                                </button>
                                <button className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${student.status === 'absent' ? 'bg-red-500 text-white shadow-lg shadow-red-900/20' : 'bg-slate-800 text-slate-500'}`}>
                                    <X className="h-4 w-4" />
                                </button>
                                <button className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${student.status === 'late' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-900/20' : 'bg-slate-800 text-slate-500'}`}>
                                    <Clock className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* FAB */}
                <button className="absolute bottom-6 right-6 h-12 w-12 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/30 transition-transform active:scale-95">
                    <Check className="h-6 w-6" />
                </button>
            </div>

            {/* Bottom Chin */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-white/20 rounded-full"></div>
        </div>
    )
}
