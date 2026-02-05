"use client"

import { motion } from "framer-motion"
import { Quote, Smartphone, Check, Wifi, Building2 } from "lucide-react"

const testimonials = [
    {
        name: "Mrs. Adebayo",
        role: "Proprietress, Kingsgate College",
        content: "We recovered ₦4.2M in outstanding fees within the first week of turning on the Revenue Engine. The impact was immediate and undeniable.",
        tag: "🏫 Elite School Verified",
        color: "text-blue-400"
    },
    {
        name: "Chinedu Okeke",
        role: "Bursar, Heritage Academy, Badagry",
        content: "Internet is terrible here, but FlowBuilder just works. I sync data once a week and everything stays perfect. It's a lifesaver.",
        icon: <Wifi className="w-4 h-4 text-emerald-400" />,
        extra: "Offline-Sync Active",
        color: "text-emerald-400"
    },
    {
        name: "Sarah Johnson",
        role: "Parent, Lekki British High",
        content: "I love getting instant SMS alerts when my son arrives at school. It gives me peace of mind that money can't buy.",
        icon: <Smartphone className="w-4 h-4 text-purple-400" />,
        color: "text-purple-400"
    }
]

export function SocialProofBento() {
    return (
        <section id="testimonials" className="py-24 bg-[#0A0A0B] relative overflow-hidden">
            {/* Background: Blue Wave Pattern */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='30' viewBox='0 0 60 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 15 20, 30 10 T 60 10' fill='none' stroke='%233B82F6' stroke-width='1.5'/%3E%3C/svg%3E")`,
                        backgroundSize: '60px 30px',
                        maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)'
                    }}
                />
            </div>

            <div className="container px-4 md:px-6 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-400 text-xs font-mono mb-6">
                        <Check className="w-3 h-3 text-emerald-500" />
                        TRUSTED_BY_LEADERS
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Join 500+ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Elite Institutions.</span>
                    </h2>
                </div>

                {/* Staggered Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {/* Column 1 - Mrs. Adebayo (Offset Down) */}
                    <div className="md:pt-12">
                        <TestimonialCard data={testimonials[0]} delay={0} />
                    </div>

                    {/* Column 2 - Chinedu Okeke (Standard) */}
                    <div>
                        <TestimonialCard data={testimonials[1]} delay={0.2} />
                    </div>

                    {/* Column 3 - Sarah Johnson (Offset Down More) */}
                    <div className="md:pt-24">
                        <TestimonialCard data={testimonials[2]} delay={0.4} />
                    </div>
                </div>
            </div>
        </section>
    )
}

function TestimonialCard({ data, delay }: { data: any, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay }}
            whileHover={{ y: -5 }}
            className="bento-card p-8 group relative overflow-hidden"
            style={{
                background: "rgba(0, 0, 0, 0.7)", // Deep Black override
            }}
        >
            {/* Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 space-y-6">
                <Quote className={`w-8 h-8 ${data.color} opacity-50`} />

                <p className="text-slate-300 text-lg leading-relaxed italic">
                    "{data.content}"
                    {data.name === "Sarah Johnson" && (
                        <span className="inline-block ml-2 align-middle">
                            <Smartphone className="w-4 h-4 text-purple-400 animate-pulse" />
                        </span>
                    )}
                </p>

                <div className="border-t border-white/5 pt-6 flex items-center justify-between">
                    <div>
                        <div className="text-white font-bold">{data.name}</div>
                        <div className="text-xs text-slate-500">{data.role}</div>
                    </div>

                    {data.tag && (
                        <div className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] text-blue-400 font-bold animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                            {data.tag}
                        </div>
                    )}

                    {data.extra && (
                        <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-400 font-bold">
                            <Wifi className="w-3 h-3" />
                            {data.extra}
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Animation Wrapper for visual effect if needed via CSS or Framer */}
            <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 }}
                className="absolute inset-0 pointer-events-none"
            />
        </motion.div>
    )
}
