"use client"

import { useState } from "react"
import { Play } from "lucide-react"

export function ResultVideo() {
    const [isPlaying, setIsPlaying] = useState(false)

    return (
        <section className="py-24 bg-black overflow-hidden relative">
            {/* Header Content */}
            <div className="max-w-7xl mx-auto px-6 text-center mb-16 relative z-10">
                <span className="text-blue-500 font-bold tracking-widest text-xs uppercase mb-4 block">Executive Demo</span>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                    Watch the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 italic">Magic</span> Happen
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                    From raw scores to a beautiful, branded report card delivered to a parent's phone.
                </p>
            </div>

            {/* Video Container */}
            <div className="max-w-5xl mx-auto px-4 relative z-10">
                <div
                    className={`aspect-video bg-[#0F1115] rounded-2xl border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)] relative overflow-hidden group transition-all duration-500 ${isPlaying ? 'scale-100' : 'hover:scale-[1.01]'}`}
                >
                    {!isPlaying ? (
                        /* Custom Thumbnail Overlay */
                        <div
                            className="absolute inset-0 flex items-center justify-center bg-slate-900/50 cursor-pointer z-20 group-hover:bg-slate-900/40 transition-colors"
                            onClick={() => setIsPlaying(true)}
                        >
                            <div className="absolute inset-0 z-10 bg-black/40" />
                            <img
                                src="/visuals/exact-mock-black-hand-zoomed-out.png"
                                alt="Report Card App Preview"
                                className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                            />

                            {/* Play Button */}
                            <div className="h-24 w-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                                <Play className="w-10 h-10 text-white fill-white ml-2" />
                            </div>

                            {/* Section Label */}
                            <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-white border border-white/10 flex items-center gap-2">
                                <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                                LIVE PREVIEW
                            </div>
                        </div>
                    ) : (
                        /* YouTube Embed */
                        <iframe
                            width="100%"
                            height="100%"
                            src="https://www.youtube.com/embed/7fnoVD1tYZs?autoplay=1&rel=0&modestbranding=1"
                            title="Eduflow Product Demo"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full rounded-2xl"
                        />
                    )}
                </div>
            </div>

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/10 blur-[120px] -z-10 rounded-full pointer-events-none" />
        </section>
    )
}
