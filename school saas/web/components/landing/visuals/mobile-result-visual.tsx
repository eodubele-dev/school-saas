import { Lock } from "lucide-react"

export function MobileResultVisual() {
    return (
        <div className="relative w-[280px] h-[580px] bg-slate-950 rounded-[3rem] border-[8px] border-slate-900 shadow-2xl overflow-hidden mx-auto">
            {/* Phone Notch/Speaker */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-slate-900 rounded-b-xl z-20"></div>

            {/* Screen Content */}
            <div className="w-full h-full bg-slate-50 relative pt-12 px-4 pb-8 flex flex-col">
                {/* School Header */}
                <div className="flex flex-col items-center mb-6">
                    <div className="h-12 w-12 bg-blue-900 rounded-full mb-2 flex items-center justify-center text-white font-bold">E</div>
                    <h3 className="text-slate-900 font-bold text-sm">EduCare High School</h3>
                    <p className="text-[10px] text-slate-500">Term 2 Result Sheet</p>
                </div>

                {/* Student Info */}
                <div className="flex gap-3 mb-6 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                    <div className="h-12 w-12 bg-slate-200 rounded-lg shrink-0"></div>
                    <div>
                        <div className="text-xs font-bold text-slate-900">Chioma Okeke</div>
                        <div className="text-[10px] text-slate-500">JSS 3 Blue</div>
                        <div className="text-[10px] bg-green-100 text-green-700 px-1.5 rounded-full inline-block mt-1">Promoted</div>
                    </div>
                    <div className="ml-auto h-8 w-8 bg-black shrink-0"></div> {/* QR */}
                </div>

                {/* Result Table (Blurred) */}
                <div className="flex-1 relative mb-4">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden filter blur-[4px]">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="flex justify-between p-3 border-b border-slate-50 last:border-0">
                                <div className="h-3 w-24 bg-slate-200 rounded"></div>
                                <div className="h-3 w-8 bg-slate-200 rounded"></div>
                            </div>
                        ))}
                    </div>

                    {/* Pay Wall Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-6 text-center w-[90%] shadow-xl transform scale-105 border border-white/10">
                            <div className="h-10 w-10 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Lock className="h-5 w-5" />
                            </div>
                            <h4 className="text-white font-bold text-sm mb-1">Result Locked</h4>
                            <p className="text-[10px] text-slate-400 mb-4">
                                Please pay school fees to view full academic results.
                            </p>
                            <button className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-green-900/20 transition-transform hover:scale-105">
                                Pay ₦45,000 Now
                            </button>
                        </div>
                    </div>
                </div>

                {/* Nav Bar */}
                <div className="h-12 bg-white border-t border-slate-100 flex items-center justify-around text-slate-300">
                    <div className="h-5 w-5 bg-slate-200 rounded-full"></div>
                    <div className="h-5 w-5 bg-blue-500 rounded-full"></div>
                    <div className="h-5 w-5 bg-slate-200 rounded-full"></div>
                </div>
            </div>
        </div>
    )
}
