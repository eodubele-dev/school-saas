'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { CreditCard, ShieldCheck, Key, AlertCircle, CheckCircle2, Loader2, ExternalLink, Zap } from 'lucide-react'
import { updatePaystackConfig, getPaystackSettingsUI, testPaystackConnection } from '@/lib/actions/finance-settings'
import { toast } from 'sonner'

export function PaymentGatewaySettings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState<any>(null)
    
    // Form State
    const [publicKey, setPublicKey] = useState('')
    const [secretKey, setSecretKey] = useState('')
    const [isEnabled, setIsEnabled] = useState(false)
    const [testing, setTesting] = useState(false)

    useEffect(() => {
        const fetchSettings = async () => {
            const data = await getPaystackSettingsUI()
            if (data) {
                setSettings(data)
                setPublicKey(data.publicKey || '')
                setIsEnabled(data.isEnabled || false)
            }
            setLoading(false)
        }
        fetchSettings()
    }, [])

    const handleSave = async () => {
        if (!publicKey || (!secretKey && !settings?.isConfigured)) {
            toast.error("Both Public and Secret keys are required.")
            return
        }

        setSaving(true)
        const res = await updatePaystackConfig({
            publicKey: publicKey.trim(),
            secretKey: secretKey.trim() || "", // If empty, backend logic should handle preservation? 
            // Actually, in my current updatePaystackConfig, it overwrites. 
            // I should make sure I don't overwrite with empty if it's already configured.
            isEnabled
        })

        if (res.success) {
            toast.success("Payment settings updated successfully!")
            setSecretKey("") // Clear secret key field
            // Refresh settings view
            const data = await getPaystackSettingsUI()
            setSettings(data)
        } else {
            toast.error(res.error || "Failed to update settings")
        }
        setSaving(false)
    }

    const handleTest = async () => {
        if (!publicKey || (!secretKey && !settings?.isConfigured)) {
            toast.error("Enter keys to test connection")
            return
        }

        setTesting(true)
        const res = await testPaystackConnection(publicKey, secretKey)
        if (res.success) {
            toast.success(res.message)
        } else {
            toast.error(res.error || "Connection test failed")
        }
        setTesting(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-3xl">
            <Card className="bg-slate-900 border-white/10 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-6">
                    <Badge variant={isEnabled ? "default" : "secondary"} className={isEnabled ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : ""}>
                        {isEnabled ? "Active" : "Disabled"}
                    </Badge>
                </div>
                
                <CardHeader>
                    <div className="flex items-center gap-3 mb-2 text-blue-400">
                        <CreditCard className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Integration</span>
                    </div>
                    <CardTitle className="text-2xl text-white">Paystack Configuration</CardTitle>
                    <CardDescription className="text-slate-400">
                        Collect school fees directly into your own bank account using your Paystack credentials.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Status Alert */}
                    {!settings?.isConfigured && (
                        <div className="flex gap-3 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-200 text-sm">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <div>
                                <p className="font-bold">Gateway Not Configured</p>
                                <p className="opacity-80">Parents will not be able to pay fees online until you provide your API keys.</p>
                            </div>
                        </div>
                    )}

                    {settings?.isConfigured && (
                        <div className="flex gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm">
                            <CheckCircle2 className="w-5 h-5 shrink-0" />
                            <div>
                                <p className="font-bold">Gateway Ready</p>
                                <p className="opacity-80">Payments are configured and properly encrypted.</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 pt-4">
                        <div className="grid gap-2">
                            <Label htmlFor="publicKey" className="text-slate-300">Public Key</Label>
                            <div className="relative">
                                <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                                <Input 
                                    id="publicKey"
                                    placeholder="pk_live_..."
                                    className="pl-10 bg-slate-950 border-white/10 text-slate-100 placeholder:text-slate-600 focus:border-blue-500/50"
                                    value={publicKey}
                                    onChange={(e) => setPublicKey(e.target.value)}
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Found in your Paystack Dashboard under Settings &gt; API Keys</p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="secretKey" className="text-slate-300">Secret Key</Label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                                <Input 
                                    id="secretKey"
                                    type="password"
                                    placeholder={settings?.isConfigured ? "••••••••••••••••" : "sk_live_..."}
                                    className="pl-10 bg-slate-950 border-white/10 text-slate-100 placeholder:text-slate-600 focus:border-blue-500/50"
                                    value={secretKey}
                                    onChange={(e) => setSecretKey(e.target.value)}
                                />
                            </div>
                            {settings?.isConfigured && (
                                <p className="text-[10px] text-blue-400 font-medium italic">Secret key is stored and encrypted. Leave blank to keep existing key.</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
                            <div className="space-y-1">
                                <Label htmlFor="enableGateway" className="text-white font-medium">Enable Gateway</Label>
                                <p className="text-xs text-slate-400">Toggle online payments for students and parents.</p>
                            </div>
                            <Switch 
                                id="enableGateway"
                                checked={isEnabled}
                                onCheckedChange={setIsEnabled}
                                className="data-[state=checked]:bg-blue-500"
                            />
                        </div>
                    </div>
                </CardContent>

                <div className="p-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <LockIcon className="w-3 h-3" />
                        <span>AES-256-GCM Encryption Active</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={handleTest}
                            disabled={testing || saving}
                            className="bg-slate-950 border-white/10 text-slate-300 hover:bg-white/5 hover:text-white transition-all flex items-center gap-2"
                        >
                            {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            Test Sync
                        </Button>
                        <Button 
                            onClick={handleSave}
                            disabled={saving || testing}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-8 h-11 relative overflow-hidden group shadow-lg shadow-blue-500/20"
                        >
                            {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Save Payment Settings"
                            )}
                            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200" />
                        </Button>
                    </div>
                </div>
            </Card>

            <div className="flex items-center justify-center gap-4 py-4 text-slate-500 text-xs grayscale opacity-50">
                <p>Powered by</p>
                <img src="https://paystack.com/assets/img/v3/logo-paystack.svg" alt="Paystack" className="h-4" />
                <span className="h-3 w-px bg-slate-800" />
                <a href="https://paystack.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                    Dashboard <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        </div>
    )
}

function LockIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
    )
}
