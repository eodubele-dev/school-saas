"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, Loader2, Lock, Terminal, Activity } from "lucide-react"
import { toast } from "sonner"

export default function SuperAdminLoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            // Verify role
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single()

            if (profileError || profile?.role !== 'super-admin') {
                await supabase.auth.signOut()
                toast.error("Access Denied: You do not have platform-level clearance.")
                return
            }

            toast.success("Identity Verified. Accessing Command Center...")
            router.push('/super-admin')
        } catch (error: any) {
            toast.error(error.message || "Authentication Failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#020203] flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* High-Tech Background Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.1),transparent_70%)] pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            
            {/* Animated Glow Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-blue-500/5 rounded-full animate-[spin_60s_linear_infinite] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-cyan-500/5 rounded-full animate-[spin_40s_linear_infinite_reverse] pointer-events-none" />

            <div className="w-full max-w-md relative group">
                {/* Outer Glow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-cyan-500/20 to-blue-600/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                
                <Card className="bg-[#0A0A0B]/80 backdrop-blur-2xl border-white/5 relative z-10 overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                    
                    <CardHeader className="text-center pt-10 pb-4">
                        <div className="mx-auto mb-6 relative">
                            <div className="h-20 w-20 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                <ShieldCheck className="h-10 w-10 text-blue-500 relative z-10" />
                                <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="absolute -top-1 -right-1">
                                <span className="flex h-4 w-4 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
                                </span>
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-black tracking-tighter text-white uppercase">
                            Platform <span className="text-blue-500 italic">Auth</span>
                        </CardTitle>
                        <CardDescription className="text-slate-500 mt-2 font-mono text-[10px] uppercase tracking-[0.2em]">
                            Restricted Access // System Developer Console
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-8 pb-8 pt-2">
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Secure Identity</Label>
                                <div className="relative group/input">
                                    <Terminal className="absolute left-3 top-3 h-4 w-4 text-slate-600 group-focus-within/input:text-blue-400 transition-colors" />
                                    <Input 
                                        type="email" 
                                        placeholder="system.dev@eduflow.ng" 
                                        className="bg-black/40 border-white/10 pl-10 h-11 text-sm focus:ring-blue-500/50 transition-all"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Access Key</Label>
                                <div className="relative group/input">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-600 group-focus-within/input:text-blue-400 transition-colors" />
                                    <Input 
                                        type="password" 
                                        placeholder="••••••••••••" 
                                        className="bg-black/40 border-white/10 pl-10 h-11 text-sm focus:ring-blue-500/50 transition-all"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all group/btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Initialize Protocol
                                        <Activity className="h-4 w-4 opacity-50 group-hover/btn:opacity-100 transition-opacity" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="bg-black/40 border-t border-white/5 py-4 flex flex-col items-center">
                        <div className="flex items-center gap-2 text-[9px] font-mono text-slate-600 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                            Network Secure // SSL 256-BIT
                        </div>
                    </CardFooter>
                </Card>

                {/* Technical Metadata Footer */}
                <div className="mt-8 text-center space-y-1">
                    <p className="text-[9px] font-mono text-slate-700 uppercase tracking-[0.3em]">
                        EduFlow Architecture © 2026
                    </p>
                    <p className="text-[8px] font-mono text-slate-800 uppercase tracking-[0.1em]">
                        Unauthorized access attempts are monitored and reported.
                    </p>
                </div>
            </div>
        </div>
    )
}
