"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const testimonials = [
    {
        name: "Mrs. Adebayo",
        role: "Principal, Kings College",
        content: "EduCare transformed how we handle grades. Result processing that used to take 2 weeks now takes 2 days.",
        initials: "MA"
    },
    {
        name: "Chinedu Okeke",
        role: "IT Admin",
        content: "The offline capability is a game changer for our branch in Badagry where internet is unstable.",
        initials: "CO"
    },
    {
        name: "Sarah Johnson",
        role: "Parent",
        content: "I love getting instant SMS alerts when my son reaches school. It gives me peace of mind.",
        initials: "SJ"
    }
]

export function Testimonials() {
    return (
        <section id="testimonials" className="py-24 bg-white/5 border-y border-white/5">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white mb-4">See What <span className="text-neon-purple">Our Users Are Saying</span></h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <div key={i} className="bg-obsidian border border-white/10 p-6 rounded-xl hover:border-white/20 transition-colors">
                            <p className="text-slate-300 italic mb-6">&quot;{t.content}&quot;</p>
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarFallback className="bg-emerald-green text-white font-bold">{t.initials}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-bold text-white text-sm">{t.name}</h4>
                                    <p className="text-xs text-slate-500">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
