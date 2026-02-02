export function ResultVideo() {
    return (
        <section className="py-24 bg-black overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-6 text-center mb-16 relative z-10">
                <span className="text-blue-500 font-bold tracking-widest text-xs uppercase mb-4 block">Executive Demo</span>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Watch the <span className="text-purple-400 italic">Magic</span> Happen
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    From raw scores to a beautiful, branded report card delivered to a parent's phone.
                </p>
            </div>

            {/* Video Mock/Container */}
            <div className="max-w-5xl mx-auto px-4 relative z-10">
                <div className="aspect-video bg-slate-900 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden group">
                    {/* Placeholder for video - simulating the 'loop' */}
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 group-hover:bg-slate-900/30 transition-colors cursor-pointer">
                        <div className="h-20 w-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:scale-110 transition-transform">
                            <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1" />
                        </div>
                    </div>

                    {/* Overlay UI to make it look like "App" */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none">
                        <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white border border-white/10 flex items-center gap-2">
                            <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                            LIVE PREVIEW
                        </div>
                    </div>

                    {/* Simulated Content Background */}
                    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-800 to-slate-950 flex flex-col items-center justify-center text-slate-600 font-bold text-4xl opacity-20">
                        [ 30s High-Fidelity Loop ]
                    </div>
                </div>
            </div>

            <div className="absolute top-1/2 left-0 w-full h-[500px] -translate-y-1/2 bg-purple-900/10 blur-[100px] -z-10" />
        </section>
    )
}
