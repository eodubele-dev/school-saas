export function LogoStrip() {
    return (
        <div className="w-full border-y border-white/5 bg-[#020410] relative z-20">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <p className="text-center text-xs font-mono uppercase tracking-widest text-slate-500 mb-6">Trusted by Nigeria's Top Educational Institutions</p>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {/* Placeholder Logos - In production Use Actual SVGs */}
                    {['Greensprings', 'Corona Schools', 'Chrisland', 'Grange School', 'Meadow Hall'].map((school, i) => (
                        <div key={i} className="flex items-center gap-2 group cursor-default">
                            <div className="h-8 w-8 rounded bg-slate-800 group-hover:bg-blue-900/50 transition-colors"></div>
                            <span className="text-sm font-bold text-slate-400 group-hover:text-blue-400 transition-colors">{school}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
