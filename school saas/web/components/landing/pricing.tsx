import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PricingTable() {
    const plans = [
        {
            name: "Standard",
            price: "1,500",
            period: "/student/term",
            desc: "Essential automated record keeping.",
            features: ["Offline Gradebook", "Automated Report Cards", "Basic Fee Tracking", "Parent Mobile App"],
            cta: "Get Standard",
            highlight: false
        },
        {
            name: "Professional",
            price: "2,500",
            period: "/student/term",
            desc: "For schools scaling up fast.",
            features: ["All Standard features", "CBT & Assignments", "Staff Payroll", "Inventory Management", "SMS & Email Broadcasts"],
            cta: "Get Professional",
            highlight: false
        },
        {
            name: "Platinum Edition",
            price: "4,500",
            period: "/student/term",
            desc: "The complete OS for top-tier schools.",
            features: ["All Professional features", "AI Lesson Planner", "AI Behavioral Remarks", "Executive 'God-View' Dashboard", "Dedicated Account Manager", "Audit & Fraud Logs"],
            cta: "Contact Sales",
            highlight: true
        }
    ]

    return (
        <section id="pricing" className="py-24 bg-slate-950 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white mb-4">Transparent Pricing</h2>
                    <p className="text-slate-400">No hidden fees. Pay only for active students.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
                    {plans.map((plan, i) => (
                        <div
                            key={i}
                            className={`
                                relative rounded-3xl p-8 flex flex-col h-full transition-all duration-300
                                ${plan.highlight
                                    ? 'bg-[#0B1028] border border-cyan-500/50 shadow-[0_0_40px_rgba(0,245,255,0.15)] z-10 scale-105'
                                    : 'bg-[#050B20]/50 border border-white/5 hover:border-white/10 hover:bg-[#050B20]'}
                            `}
                        >
                            {plan.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-cyan-500/20">
                                    Best Value
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className={`text-xl font-bold mb-2 ${plan.highlight ? 'text-cyan-400' : 'text-white'}`}>{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-sm text-slate-500">₦</span>
                                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                                    <span className="text-sm text-slate-500">{plan.period}</span>
                                </div>
                                <p className="text-sm text-slate-400">{plan.desc}</p>
                            </div>

                            <div className="flex-1 space-y-4 mb-8">
                                {plan.features.map(feat => (
                                    <div key={feat} className="flex items-start gap-3 text-sm text-slate-300">
                                        <div className={`mt-0.5 h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${plan.highlight ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}>
                                            <Check className="h-2.5 w-2.5" />
                                        </div>
                                        {feat}
                                    </div>
                                ))}
                            </div>

                            <Button
                                className={`w-full h-12 rounded-xl font-semibold transition-all duration-300 ${plan.highlight
                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-[0_0_20px_rgba(0,245,255,0.4)]'
                                        : 'bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-cyan-500/30'
                                    }`}
                            >
                                {plan.cta}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
