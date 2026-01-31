"use client"

import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const tiers = [
    {
        name: "Basic",
        price: "₦0",
        period: "/month",
        features: ["Up to 50 Students", "Offline Attendance", "Basic Reports", "Email Support"],
        cta: "Start Free",
        highlight: false
    },
    {
        name: "Standard",
        price: "₦1,000",
        period: "/term/student",
        features: ["Unlimited Students", "AI Report Remarks", "Parent Portal", "CBT Module", "Priority Support"],
        cta: "Get Standard",
        highlight: true // Best Value
    },
    {
        name: "Premium",
        price: "₦1,500",
        period: "/term/student",
        features: ["Everything in Standard", "Custom Domain", "Inventory Management", "Dedicated Account Manager", "API Access"],
        cta: "Contact Sales",
        highlight: false
    }
]

export function PricingTable() {
    return (
        <section id="pricing" className="py-24 relative overflow-hidden">
            {/* Background glow for pricing */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-neon-purple/5 rounded-full blur-[100px] -z-10" />

            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white mb-4">Choose your <span className="text-neon-purple">Plan</span></h2>
                    <p className="text-slate-400">Transparent pricing for schools of all sizes.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {tiers.map((tier, i) => (
                        <div
                            key={i}
                            className={`relative rounded-2xl p-8 border ${tier.highlight
                                    ? "bg-white/5 border-neon-purple shadow-glow-purple scale-105 z-10"
                                    : "bg-obsidian border-white/10"
                                }`}
                        >
                            {tier.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-neon-purple text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                    Best Value
                                </div>
                            )}

                            <h3 className="text-lg font-medium text-slate-300 mb-2">{tier.name}</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-bold text-white">{tier.price}</span>
                                <span className="text-sm text-slate-500">{tier.period}</span>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {tier.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-sm text-slate-300">
                                        <div className={`rounded-full p-1 ${tier.highlight ? "bg-neon-purple/20 text-neon-purple" : "bg-emerald-green/10 text-emerald-green"}`}>
                                            <Check className="h-3 w-3" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className={`w-full ${tier.highlight
                                        ? "bg-neon-purple hover:bg-violet-600 text-white"
                                        : "bg-white/10 hover:bg-white/20 text-white"
                                    }`}
                            >
                                {tier.cta}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
