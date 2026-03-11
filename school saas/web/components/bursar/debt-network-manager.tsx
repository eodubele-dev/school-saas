"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShieldAlert, CheckCircle2, AlertTriangle, Plus, Search } from "lucide-react"
import { toast } from "sonner"
import { flagParentAsDebtor, resolveDebtFlag } from "@/lib/actions/debt-network"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export function DebtNetworkManager({ initialFlags = [] }: { initialFlags?: any[] }) {
    const [flags, setFlags] = useState(initialFlags)
    const [loading, setLoading] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Form State
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState("")
    const [parentName, setParentName] = useState("")
    const [studentName, setStudentName] = useState("")
    const [tier, setTier] = useState<'low' | 'medium' | 'high'>('medium')

    const handleFlagSubmission = async () => {
        if (!parentName || !studentName || (!phone && !email)) {
            toast.error("Please provide both names and at least one contact method.")
            return
        }

        setLoading(true)
        const res = await flagParentAsDebtor(phone, email, studentName, parentName, tier)
        setLoading(false)

        if (res.success) {
            toast.success("Debtor flagged successfully on the Global Network.")
            setIsDialogOpen(false)
            // Optimistic update
            setFlags([{
                id: res.id,
                parent_phone_hash: phone ? '***' + phone.slice(-4) : null,
                parent_email_hash: email ? '***@' + email.split('@')[1] : null,
                parent_name_fuzzy: parentName,
                student_name_fuzzy: studentName,
                debt_amount_tier: tier,
                status: 'active',
                created_at: new Date().toISOString()
            }, ...flags])

            // Reset form
            setPhone(""); setEmail(""); setParentName(""); setStudentName(""); setTier("medium");
        } else {
            toast.error(res.error)
        }
    }

    const handleResolve = async (id: string) => {
        const res = await resolveDebtFlag(id)
        if (res.success) {
            toast.success("Debt marked as resolved. The network flag is lifted.")
            setFlags(flags.map(f => f.id === id ? { ...f, status: 'resolved' } : f))
        } else {
            toast.error(res.error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-red-500" />
                        Global Debt Network Manager
                    </h2>
                    <p className="text-sm text-muted-foreground">Flag parents with outstanding debts to warn other schools on the network.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-red-500 hover:bg-red-600 text-foreground border-none">
                            <Plus className="h-4 w-4 mr-2" />
                            Flag New Debtor
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card text-card-foreground border-border text-foreground sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-red-400">
                                <AlertTriangle className="h-5 w-5" />
                                Add Network Flag
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Parent Details</label>
                                <Input
                                    placeholder="Parent Full Name (Required)"
                                    className="bg-slate-950 border-border"
                                    value={parentName} onChange={(e) => setParentName(e.target.value)}
                                />
                                <Input
                                    placeholder="Parent Phone (Crucial for matching)"
                                    className="bg-slate-950 border-border"
                                    value={phone} onChange={(e) => setPhone(e.target.value)}
                                />
                                <Input
                                    placeholder="Parent Email (Optional)"
                                    className="bg-slate-950 border-border"
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Student Details</label>
                                <Input
                                    placeholder="Student Full Name (Anti-Evasion lock)"
                                    className="bg-slate-950 border-border"
                                    value={studentName} onChange={(e) => setStudentName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Debt Tier</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-border bg-slate-950 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                                    value={tier}
                                    onChange={(e) => setTier(e.target.value as any)}
                                >
                                    <option value="low">Low (&lt; ₦50,000)</option>
                                    <option value="medium">Medium (₦50,000 - ₦150,000)</option>
                                    <option value="high">High (&gt; ₦150,000)</option>
                                </select>
                                <p className="text-xs text-amber-500/80 mt-1">
                                    Exact amounts are hidden to comply with NDPR privacy laws.
                                </p>
                            </div>
                            <Button className="w-full bg-red-600 hover:bg-red-700" onClick={handleFlagSubmission} disabled={loading}>
                                {loading ? "Broadcasting to Network..." : "Flag Parent on Network"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-card text-card-foreground border border-border rounded-xl overflow-hidden">
                {flags.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        <ShieldAlert className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No active debt flags reported by your institution.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {flags.map((flag) => (
                            <div key={flag.id} className="p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${flag.status === 'active' ? 'bg-red-500/20 text-red-500 border border-red-500/20' : 'bg-green-500/20 text-green-500 border border-green-500/20'}`}>
                                            {flag.status}
                                        </span>
                                        <span className="text-slate-300 font-medium">{flag.parent_name_fuzzy}</span>
                                        <span className="text-muted-foreground text-sm">({flag.parent_phone_hash || 'No Phone'})</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Owning Student: <span className="text-slate-300">{flag.student_name_fuzzy}</span>
                                        &nbsp;• Tier: <span className="uppercase text-xs">{flag.debt_amount_tier}</span>
                                    </p>
                                </div>

                                {flag.status === 'active' ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-green-500/30 text-green-400 hover:bg-green-500/10 hover:text-green-300"
                                        onClick={() => handleResolve(flag.id)}
                                    >
                                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                                        Mark Paid
                                    </Button>
                                ) : (
                                    <span className="text-sm text-muted-foreground flex items-center">
                                        <CheckCircle2 className="h-4 w-4 mr-1.5 text-green-500/50" />
                                        Resolved
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
