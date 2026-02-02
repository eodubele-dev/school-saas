'use client'

import { useEffect, useState } from "react"
import { usePreferencesStore } from "@/lib/stores/preferences-store"
import { getUserPreferences } from "@/lib/actions/preferences"
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
            <DialogContent className="max-w-2xl bg-slate-950/90 backdrop-blur-2xl border-white/10 text-slate-200">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white">User Preferences</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Customize your dashboard experience. Settings are saved automatically.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="visuals" className="space-y-6">
                    <TabsList className="bg-slate-900 border border-white/5">
                        <TabsTrigger value="visuals">Visuals & Layout</TabsTrigger>
                        <TabsTrigger value="notifications">Notification Matrix</TabsTrigger>
                        <TabsTrigger value="privacy">Privacy & Security</TabsTrigger>
                    </TabsList>

                    {/* Visuals Tab */}
                    <TabsContent value="visuals" className="space-y-6 animate-in slide-in-from-left-2">
                        {/* Theme */}
                        <div className="space-y-3">
                            <Label className="text-base text-white">Theme Engine</Label>
                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    onClick={() => preferences.setTheme('light')}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${preferences.theme === 'light' ? 'bg-white text-slate-900 border-white' : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-slate-800'}`}
                                >
                                    <Sun className="h-6 w-6" />
                                    <span className="text-sm font-medium">Light</span>
                                </button>
                                <button
                                    onClick={() => preferences.setTheme('dark')}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${preferences.theme === 'dark' ? 'bg-slate-800 text-white border-blue-500' : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-slate-800'}`}
                                >
                                    <Moon className="h-6 w-6" />
                                    <span className="text-sm font-medium">Obsidian</span>
                                </button>
                                <button
                                    onClick={() => preferences.setTheme('system')}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${preferences.theme === 'system' ? 'bg-slate-800 text-white border-blue-500' : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-slate-800'}`}
                                >
                                    <Monitor className="h-6 w-6" />
                                    <span className="text-sm font-medium">System</span>
                                </button>
                            </div>
                        </div>

                        {/* Accessibility */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-white">Language</Label>
                                <Select value={preferences.language} onValueChange={preferences.setLanguage}>
                                    <SelectTrigger className="w-[180px] bg-slate-900 border-white/10 text-slate-200">
                                        <SelectValue placeholder="Select Language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en-NG">English (Nigeria)</SelectItem>
                                        <SelectItem value="en-UK">English (UK)</SelectItem>
                                        <SelectItem value="fr">French</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-white">Font Size ({preferences.font_size}%)</Label>
                                </div>
                                <Slider
                                    defaultValue={[preferences.font_size]}
                                    max={125}
                                    min={75}
                                    step={5}
                                    onValueChange={(val) => preferences.setFontSize(val[0])}
                                    className="py-2"
                                />
                                <p className="text-xs text-slate-500 text-right">Adjust sliding for larger text readability.</p>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications" className="space-y-4 animate-in slide-in-from-right-2">
                        <div className="rounded-lg border border-white/10 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-900 text-slate-400 font-medium border-b border-white/10">
                                    <tr>
                                        <th className="p-3 pl-4">Category</th>
                                        <th className="p-3 text-center"><Bell className="h-4 w-4 mx-auto" /> In-App</th>
                                        <th className="p-3 text-center"><Mail className="h-4 w-4 mx-auto" /> Email</th>
                                        <th className="p-3 text-center"><Smartphone className="h-4 w-4 mx-auto" /> SMS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 bg-slate-900/50">
                                    {/* Security */}
                                    <tr>
                                        <td className="p-3 pl-4 font-medium text-slate-300">
                                            <div className="flex items-center gap-2">
                                                <ShieldAlert className="h-4 w-4 text-blue-500" /> Security Alerts
                                            </div>
                                        </td>
                                        <td className="p-3 text-center"><Switch checked={preferences.notifications.in_app.security} onCheckedChange={() => preferences.toggleNotification('in_app', 'security')} /></td>
                                        <td className="p-3 text-center"><Switch checked={preferences.notifications.email.security} onCheckedChange={() => preferences.toggleNotification('email', 'security')} /></td>
                                        <td className="p-3 text-center"><Switch checked={preferences.notifications.sms.security} onCheckedChange={() => preferences.toggleNotification('sms', 'security')} /></td>
                                    </tr>
                                    {/* Academic */}
                                    <tr>
                                        <td className="p-3 pl-4 font-medium text-slate-300">Academic Updates</td>
                                        <td className="p-3 text-center"><Switch checked={preferences.notifications.in_app.academic} onCheckedChange={() => preferences.toggleNotification('in_app', 'academic')} /></td>
                                        <td className="p-3 text-center"><Switch checked={preferences.notifications.email.academic} onCheckedChange={() => preferences.toggleNotification('email', 'academic')} /></td>
                                        <td className="p-3 text-center"><Switch checked={preferences.notifications.sms.academic} onCheckedChange={() => preferences.toggleNotification('sms', 'academic')} /></td>
                                    </tr>
                                    {/* Financial */}
                                    <tr>
                                        <td className="p-3 pl-4 font-medium text-slate-300">Financial Alerts</td>
                                        <td className="p-3 text-center"><Switch checked={preferences.notifications.in_app.financial} onCheckedChange={() => preferences.toggleNotification('in_app', 'financial')} /></td>
                                        <td className="p-3 text-center"><Switch checked={preferences.notifications.email.financial} onCheckedChange={() => preferences.toggleNotification('email', 'financial')} /></td>
                                        <td className="p-3 text-center"><Switch checked={preferences.notifications.sms.financial} onCheckedChange={() => preferences.toggleNotification('sms', 'financial')} /></td>
                                    </tr>
                                    {/* Emergency - LOCKED */}
                                    <tr className="bg-red-500/5">
                                        <td className="p-3 pl-4 font-medium text-red-200">Emergency Broadcasts</td>
                                        <td className="p-3 text-center"><Switch checked={true} disabled className="opacity-50 data-[state=checked]:bg-red-500" /></td>
                                        <td className="p-3 text-center"><Switch checked={true} disabled className="opacity-50 data-[state=checked]:bg-red-500" /></td>
                                        <td className="p-3 text-center"><Switch checked={true} disabled className="opacity-50 data-[state=checked]:bg-red-500" /></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-slate-500">Emergency broadcasts cannot be disabled for safety compliance.</p>
                    </TabsContent>

                    {/* Privacy Tab */}
                    <TabsContent value="privacy" className="space-y-6 animate-in slide-in-from-left-2">
                        <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-slate-900/50">
                            <div className="space-y-0.5">
                                <Label className="text-base text-white flex items-center gap-2">
                                    {preferences.hide_financial_figures ? <EyeOff className="h-4 w-4 text-blue-500" /> : <Eye className="h-4 w-4 text-slate-500" />}
                                    Hide Financial Figures
                                </Label>
                                <p className="text-sm text-slate-400">
                                    Blur all monetary values on the dashboard until hovered. Great for open offices.
                                </p>
                            </div>
                            <Switch
                                checked={preferences.hide_financial_figures}
                                onCheckedChange={preferences.toggleFinancialPrivacy}
                            />
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
