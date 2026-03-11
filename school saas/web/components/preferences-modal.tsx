'use client'

import { useEffect, useState } from "react"
import { usePreferencesStore } from "@/lib/stores/preferences-store"
import { getUserPreferences } from "@/lib/actions/preferences"
import { useTranslation } from "@/lib/hooks/use-translation"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Moon, Sun, Monitor, Eye, EyeOff, Bell, Smartphone, Mail, ShieldAlert } from "lucide-react"

interface PreferencesModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function PreferencesModal({ open, onOpenChange }: PreferencesModalProps) {
    const preferences = usePreferencesStore()
    const { t } = useTranslation()

    // Hydrate on mount
    useEffect(() => {
        if (open) {
            getUserPreferences().then(data => {
                if (data) preferences.hydratePreferences(data)
            })
        }
    }, [open])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-slate-950 border-border text-slate-50 shadow-2xl overflow-hidden p-0">
                <div className="relative p-8">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">{t('User Preferences')}</DialogTitle>
                        <DialogDescription className="text-muted-foreground text-base">
                            {t('Customize your dashboard experience. Settings are saved automatically.')}
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="visuals" className="space-y-6">
                        <TabsList className="bg-card text-card-foreground border border-border w-full justify-start p-1 h-auto rounded-lg">
                            <TabsTrigger value="visuals" className="rounded-md data-[state=active]:bg-slate-800 data-[state=active]:text-foreground">{t('Visuals & Layout')}</TabsTrigger>
                            <TabsTrigger value="notifications" className="rounded-md data-[state=active]:bg-slate-800 data-[state=active]:text-foreground">{t('Notification Matrix')}</TabsTrigger>
                            <TabsTrigger value="privacy" className="rounded-md data-[state=active]:bg-slate-800 data-[state=active]:text-foreground">{t('Privacy & Security')}</TabsTrigger>
                        </TabsList>

                        {/* Visuals Tab */}
                        <TabsContent value="visuals" className="space-y-6 pt-2 animate-in slide-in-from-left-2">
                            {/* Theme */}
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold text-foreground">{t('Theme Engine')}</Label>
                                <div className="grid grid-cols-3 gap-4">
                                    <button
                                        onClick={() => preferences.setTheme('light')}
                                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${preferences.theme === 'light' ? 'bg-white text-slate-900 border-white shadow-md' : 'bg-card text-card-foreground/50 border-border text-muted-foreground hover:bg-slate-800 hover:text-foreground'}`}
                                    >
                                        <Sun className="h-5 w-5" />
                                        <span className="text-xs font-semibold">Light</span>
                                    </button>
                                    <button
                                        onClick={() => preferences.setTheme('dark')}
                                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${preferences.theme === 'dark' ? 'bg-blue-500/10 text-blue-400 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-card text-card-foreground/50 border-border text-muted-foreground hover:bg-slate-800 hover:text-foreground'}`}
                                    >
                                        <Moon className="h-5 w-5" />
                                        <span className="text-xs font-semibold">Obsidian</span>
                                    </button>
                                    <button
                                        onClick={() => preferences.setTheme('system')}
                                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${preferences.theme === 'system' ? 'bg-blue-500/10 text-blue-400 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-card text-card-foreground/50 border-border text-muted-foreground hover:bg-slate-800 hover:text-foreground'}`}
                                    >
                                        <Monitor className="h-5 w-5" />
                                        <span className="text-xs font-semibold">System</span>
                                    </button>
                                </div>
                            </div>

                            {/* Accessibility */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card text-card-foreground/30">
                                    <Label className="text-sm font-semibold text-foreground">{t('Interface Language')}</Label>
                                    <Select value={preferences.language} onValueChange={preferences.setLanguage}>
                                        <SelectTrigger className="w-[180px] bg-card text-card-foreground border-slate-700 text-slate-200 focus:ring-blue-500">
                                            <SelectValue placeholder="Select Language" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card text-card-foreground border-border text-slate-200">
                                            <SelectItem value="en-NG">English (Nigeria)</SelectItem>
                                            <SelectItem value="en-UK">English (UK)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="p-4 rounded-xl border border-border bg-card text-card-foreground/30 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-semibold text-foreground">Font Size ({preferences.font_size}%)</Label>
                                    </div>
                                    <Slider
                                        defaultValue={[preferences.font_size]}
                                        max={125}
                                        min={75}
                                        step={5}
                                        onValueChange={(val) => preferences.setFontSize(val[0])}
                                        className="py-2"
                                    />
                                    <p className="text-xs text-muted-foreground text-right">Adjust sliding for larger text readability.</p>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Notifications Tab */}
                        <TabsContent value="notifications" className="space-y-4 pt-2 animate-in slide-in-from-right-2">
                            <div className="rounded-xl border border-border overflow-hidden bg-card text-card-foreground/30">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-card text-card-foreground/80 text-muted-foreground font-medium border-b border-border">
                                        <tr>
                                            <th className="p-4 text-xs tracking-wider uppercase">Category</th>
                                            <th className="p-4 text-center text-xs tracking-wider uppercase"><Bell className="h-4 w-4 mx-auto mb-1 text-muted-foreground" /> In-App</th>
                                            <th className="p-4 text-center text-xs tracking-wider uppercase"><Mail className="h-4 w-4 mx-auto mb-1 text-muted-foreground" /> Email</th>
                                            <th className="p-4 text-center text-xs tracking-wider uppercase"><Smartphone className="h-4 w-4 mx-auto mb-1 text-muted-foreground" /> SMS</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {/* Security */}
                                        <tr className="transition-colors hover:bg-slate-800/20">
                                            <td className="p-4 font-medium text-slate-300">
                                                <div className="flex items-center gap-2">
                                                    <ShieldAlert className="h-4 w-4 text-blue-500" /> Security Alerts
                                                </div>
                                            </td>
                                            <td className="p-4 text-center"><Switch checked={preferences.notifications.in_app.security} onCheckedChange={() => preferences.toggleNotification('in_app', 'security')} className="data-[state=checked]:bg-blue-600" /></td>
                                            <td className="p-4 text-center"><Switch checked={preferences.notifications.email.security} onCheckedChange={() => preferences.toggleNotification('email', 'security')} className="data-[state=checked]:bg-blue-600" /></td>
                                            <td className="p-4 text-center"><Switch checked={preferences.notifications.sms.security} onCheckedChange={() => preferences.toggleNotification('sms', 'security')} className="data-[state=checked]:bg-blue-600" /></td>
                                        </tr>
                                        {/* Academic */}
                                        <tr className="transition-colors hover:bg-slate-800/20">
                                            <td className="p-4 font-medium text-slate-300">Academic Updates</td>
                                            <td className="p-4 text-center"><Switch checked={preferences.notifications.in_app.academic} onCheckedChange={() => preferences.toggleNotification('in_app', 'academic')} className="data-[state=checked]:bg-blue-600" /></td>
                                            <td className="p-4 text-center"><Switch checked={preferences.notifications.email.academic} onCheckedChange={() => preferences.toggleNotification('email', 'academic')} className="data-[state=checked]:bg-blue-600" /></td>
                                            <td className="p-4 text-center"><Switch checked={preferences.notifications.sms.academic} onCheckedChange={() => preferences.toggleNotification('sms', 'academic')} className="data-[state=checked]:bg-blue-600" /></td>
                                        </tr>
                                        {/* Financial */}
                                        <tr className="transition-colors hover:bg-slate-800/20">
                                            <td className="p-4 font-medium text-slate-300">Financial Alerts</td>
                                            <td className="p-4 text-center"><Switch checked={preferences.notifications.in_app.financial} onCheckedChange={() => preferences.toggleNotification('in_app', 'financial')} className="data-[state=checked]:bg-blue-600" /></td>
                                            <td className="p-4 text-center"><Switch checked={preferences.notifications.email.financial} onCheckedChange={() => preferences.toggleNotification('email', 'financial')} className="data-[state=checked]:bg-blue-600" /></td>
                                            <td className="p-4 text-center"><Switch checked={preferences.notifications.sms.financial} onCheckedChange={() => preferences.toggleNotification('sms', 'financial')} className="data-[state=checked]:bg-blue-600" /></td>
                                        </tr>
                                        {/* Emergency - LOCKED */}
                                        <tr className="bg-red-500/5">
                                            <td className="p-4 font-medium text-red-300">Emergency Broadcasts</td>
                                            <td className="p-4 text-center"><Switch checked={true} disabled className="opacity-50 data-[state=checked]:bg-red-500" /></td>
                                            <td className="p-4 text-center"><Switch checked={true} disabled className="opacity-50 data-[state=checked]:bg-red-500" /></td>
                                            <td className="p-4 text-center"><Switch checked={true} disabled className="opacity-50 data-[state=checked]:bg-red-500" /></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-xs text-muted-foreground px-1">Emergency broadcasts cannot be disabled for safety compliance.</p>
                        </TabsContent>

                        {/* Privacy Tab */}
                        <TabsContent value="privacy" className="space-y-6 pt-2 animate-in slide-in-from-left-2">
                            <div className="flex items-center justify-between p-5 rounded-xl border border-border bg-card text-card-foreground/30 transition-colors hover:border-slate-700">
                                <div className="space-y-1">
                                    <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        {preferences.hide_financial_figures ? <EyeOff className="h-4 w-4 text-blue-500" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                                        Hide Financial Figures
                                    </Label>
                                    <p className="text-xs text-muted-foreground">
                                        Blur all monetary values on the dashboard until hovered. Great for open offices.
                                    </p>
                                </div>
                                <Switch
                                    checked={preferences.hide_financial_figures}
                                    onCheckedChange={preferences.toggleFinancialPrivacy}
                                    className="data-[state=checked]:bg-blue-600"
                                />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    )
}
