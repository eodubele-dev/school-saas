"use client"

import { useState, useEffect } from "react"
import { QrCode, Search, Ticket, Clock, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { validateGatePass } from "@/lib/actions/platinum"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export function GateControlPortal({ initialPasses }: { initialPasses: any[] }) {
    const [passes, setPasses] = useState<any[]>(initialPasses)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedPass, setSelectedPass] = useState<any | null>(null)
    const [isVerifying, setIsVerifying] = useState(false)

    // Supabase Real-time Listener for Gate Passes
    useEffect(() => {
        const supabase = createClient()

        const channel = supabase
            .channel('gate-pass-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'gate_passes'
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        // In reality, we'd want to fetch the joined student data too.
                        // For a quick MVP UI update, we prepend it with basic details.
                        toast.info("New Gate Pass Authorized", { description: `Code: ${payload.new.pass_code}` });
                        setPasses(prev => [payload.new, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setPasses(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
                        if (selectedPass?.id === payload.new.id) {
                            setSelectedPass((prev: any) => ({ ...prev, ...payload.new }));
                        }
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [selectedPass])

    // Filter passes based on search query (pass_code or type)
    const filteredPasses = passes.filter(p =>
        p.status === 'active' &&
        (p.pass_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.type.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleValidate = async (passId: string) => {
        setIsVerifying(true);
        const result = await validateGatePass(passId);
        setIsVerifying(false);

        if (result.success) {
            toast.success("Gate Pass Verified & Consumed");
            setPasses(prev => prev.filter(p => p.id !== passId));
            setSelectedPass(null);
        } else {
            toast.error("Failed to verify gate pass");
        }
    }

    return (
        <div className="flex flex-col lg:flex-row h-[700px] divide-y lg:divide-y-0 lg:divide-x divide-white/5">
            {/* Left Column: Scanner & List */}
            <div className="w-full lg:w-1/3 flex flex-col bg-black/20">
                <div className="p-4 border-b border-white/5 bg-slate-900/40 backdrop-blur-sm">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Scan QR or Enter Code..."
                            className="pl-10 bg-black border-slate-800 text-slate-200 focus:border-indigo-500/50 font-mono"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {filteredPasses.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm italic py-10">
                            <QrCode className="w-12 h-12 mb-3 opacity-20" />
                            No active passes match scan.
                        </div>
                    ) : (
                        filteredPasses.map(pass => (
                            <div
                                key={pass.id}
                                onClick={() => setSelectedPass(pass)}
                                className={`p-4 rounded-xl border transition-all cursor-pointer ${selectedPass?.id === pass.id ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'bg-slate-900/50 border-white/5 hover:border-white/20'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-widest ${pass.type === 'early_dismissal' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>
                                        {pass.type.replace('_', ' ')}
                                    </Badge>
                                    <span className="font-mono font-bold text-white text-sm">{pass.pass_code}</span>
                                </div>
                                <div className="text-xs text-slate-400 flex items-center justify-between mt-3">
                                    <span className="flex items-center gap-1"><Clock size={12} /> Expi: {new Date(pass.valid_until).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Column: Verification Panel */}
            <div className="w-full lg:w-2/3 p-8 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-950/40 to-slate-950/60 backdrop-blur-md">
                {selectedPass ? (
                    <div className="max-w-md mx-auto w-full animate-in zoom-in-95 duration-500">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                                <QrCode className="w-10 h-10 text-indigo-400" />
                            </div>
                            <h2 className="text-3xl font-black text-white font-mono tracking-widest">{selectedPass.pass_code}</h2>
                            <p className="text-indigo-400 font-bold uppercase tracking-widest mt-2">{selectedPass.type.replace('_', ' ')}</p>
                        </div>

                        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8 shadow-2xl space-y-4">
                            {selectedPass.student ? (
                                <div className="flex items-center gap-4 pb-4 border-b border-white/5">
                                    <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-indigo-500/30 overflow-hidden flex items-center justify-center">
                                        {selectedPass.student.photo_url ? (
                                            <img src={selectedPass.student.photo_url} alt="Student" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[10px] text-slate-500 font-mono">PHOTO</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-lg">{selectedPass.student.full_name}</p>
                                        <p className="text-xs text-slate-500 font-mono">{selectedPass.student.admission_number}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                    <span className="text-sm text-slate-500">Target ID</span>
                                    <span className="font-mono text-sm text-white">{selectedPass.student_id}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Reason</span>
                                <span className="font-bold text-sm text-white max-w-[200px] text-right truncate">{selectedPass.reason}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-500">Expiration</span>
                                <span className={`font-mono text-sm font-bold ${new Date(selectedPass.valid_until) < new Date() ? 'text-red-500' : 'text-emerald-400'}`}>
                                    {new Date(selectedPass.valid_until).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {new Date(selectedPass.valid_until) < new Date() ? (
                            <div className="bg-red-950/40 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400">
                                <AlertTriangle size={24} />
                                <div className="text-sm">
                                    <p className="font-bold">Pass Expired</p>
                                    <p className="opacity-80">This pass is no longer valid for exit.</p>
                                </div>
                            </div>
                        ) : (
                            <Button
                                onClick={() => handleValidate(selectedPass.id)}
                                disabled={isVerifying}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] h-14 text-lg font-black uppercase tracking-widest gap-2 group"
                            >
                                {isVerifying ? "Verifying..." : <><ShieldCheck size={24} className="group-hover:scale-110 transition-transform" /> Authorize & Consume Pass</>}
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-center animate-pulse">
                        <Ticket className="w-16 h-16 mb-6 opacity-30" />
                        <p className="font-mono max-w-sm">
                            Awaiting scan... <br /> Select a pass from the queue or input a Pass Code to verify.
                        </p>
                    </div>
                )}

                {/* Background Decor */}
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
            </div>
        </div>
    )
}
