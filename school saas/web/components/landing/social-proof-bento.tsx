"use client"

import { motion } from "framer-motion"
import { Quote, Smartphone, Check, Wifi, Building2 } from "lucide-react"

const testimonials = [
    {
        name: "Mrs. Adebayo",
        role: "Proprietress, Kingsgate College",
        content: "We recovered ₦4.2M in outstanding fees within the first week of turning on the Revenue Engine. The impact was immediate and undeniable.",
        color: "text-blue-400"
    },
    {
        name: "Chinedu Okeke",
        role: "Bursar, Heritage Academy, Badagry",
        content: "Internet is terrible here, but FlowBuilder just works. I sync data once a week and everything stays perfect. It's a lifesaver.",
        color: "text-blue-400"
    },
    {
        name: "Sarah Johnson",
        role: "Parent, Lekki British High",
        content: "I love getting instant SMS alerts when my son arrives at school. It gives me peace of mind that money can't buy.",
        color: "text-blue-400"
    },
    {
        name: "Dr. Ibrahim",
        role: "Director, Crescent Schools",
        content: "The global command center gives me oversight I never thought possible across all 4 campuses in Lagos and Abuja.",
        color: "text-blue-400"
    }
]

export function SocialProofBento() {
    return (
        <section id="testimonials" className="py-24 bg-[#0A0A0B] relative overflow-hidden">
            <div className="container px-4 md:px-6 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                        Join 500+ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Elite Institutions.</span>
                    </h2>
                </div>

                {/* Infinite Slider Implementation */}
                <div className="relative w-full overflow-hidden py-10">
                    <motion.div 
                        className="flex gap-8 whitespace-nowrap"
                        animate={{
                            x: [0, -1200],
                        }}
                        transition={{
                            duration: 30,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    >
                        {/* Duplicate content for seamless loop */}
                        {[...testimonials, ...testimonials, ...testimonials].map((item, idx) => (
                            <div key={idx} className="min-w-[400px] whitespace-normal">
                                <TestimonialCard data={item} />
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

function TestimonialCard({ data }: { data: any }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            whileHover={{ 
                y: -5,
                borderColor: "rgba(59, 130, 246, 0.5)", // Blue border on hover
                boxShadow: "0 20px 40px -15px rgba(37, 99, 235, 0.2)"
            }}
            className="bento-card p-8 group relative overflow-hidden border border-border/50 bg-[#0F1115]/50 backdrop-blur-xl transition-all duration-500"
        >
            {/* Hover Glow - Blue */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 space-y-6">
                <Quote className={`w-8 h-8 ${data.color} opacity-50`} />

                <p className="text-slate-300 text-lg leading-relaxed italic">
                    "{data.content}"
                </p>

                <div className="border-t border-border/50 pt-6 flex items-center justify-between">
                    <div>
                        <div className="text-foreground font-bold">{data.name}</div>
                        <div className="text-xs text-muted-foreground">{data.role}</div>
                    </div>
                    <Building2 className="w-5 h-5 text-blue-500/30" />
                </div>
            </div>
        </motion.div>
    )
}
