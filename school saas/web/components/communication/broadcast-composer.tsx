"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Send, MessageSquare, Phone, Mail, Paperclip, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { sendBroadcast, getCommunicationAudience } from "@/lib/actions/communication"
import { generateBroadcastAI } from "@/lib/actions/ai-broadcast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export function BroadcastComposer() {
    const [sending, setSending] = useState(false)
    const [loadingAudience, setLoadingAudience] = useState(true)
    const [classes, setClasses] = useState<any[]>([])
    const [channel, setChannel] = useState<'sms' | 'whatsapp' | 'email'>('sms')

    // AI State
    const [isAIOpen, setIsAIOpen] = useState(false)
    const [aiGenerating, setAiGenerating] = useState(false)
    const [aiTopic, setAiTopic] = useState("")
    const [aiTone, setAiTone] = useState("Professional")
    const [messageDraft, setMessageDraft] = useState("")

    useEffect(() => {
        const loadAudience = async () => {
            const res = await getCommunicationAudience()
            if (res.success && res.classes) {
                setClasses(res.classes)
            }
            setLoadingAudience(false)
        }
        loadAudience()
    }, [])

    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()

    useEffect(() => {
        const urlMessage = searchParams.get('message')
        if (urlMessage) setMessageDraft(urlMessage)
    }, [])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSending(true)

        const form = new FormData(e.currentTarget)
        const message = form.get('message') as string
        const audienceValue = form.get('audience') as string

        try {
            let audienceType: 'all_parents' | 'class' | 'staff' = 'class'
            let audienceId = audienceValue

            if (audienceValue === 'all_parents') {
                audienceType = 'all_parents'
            } else if (audienceValue === 'staff') {
                audienceType = 'staff'
            }

            const res = await sendBroadcast(channel, audienceType, audienceId, message)
            if (res.success) {
                toast.success(`Broadcast queued via ${channel.toUpperCase()}`)
                // Reset form?
            } else {
                toast.error("Failed to send broadcast")
            }
        } catch (_error) {
            toast.error("An error occurred")
        }
        setSending(false)
    }

    const handleAIGenerate = async () => {
        if (!aiTopic.trim()) {
            toast.error("Please enter a topic for the AI to write about.")
            return
        }

        setAiGenerating(true)
        try {
            const res = await generateBroadcastAI(aiTopic, aiTone, channel)
            if (res.success && res.content) {
                setMessageDraft(res.content)
                setIsAIOpen(false)
                toast.success("Message generated successfully!")
            } else {
                toast.error(res.error || "Failed to generate message")
            }
        } catch (e: any) {
            toast.error(e.message || "An error occurred during generation")
        }
        setAiGenerating(false)
    }

    return (
        <Card className="bg-card text-card-foreground border-border/50 p-6 h-full flex flex-col">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                <Send className="h-5 w-5 text-blue-400" />
                Compose Broadcast
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
                <div className="space-y-2">
                    <Label className="text-muted-foreground">Audience</Label>
                    <Select name="audience" defaultValue="all_parents">
                        <SelectTrigger className="bg-slate-950 border-border text-foreground">
                            <SelectValue placeholder={loadingAudience ? "Loading recipients..." : "Select Recipients"} />
                        </SelectTrigger>
                        <SelectContent className="bg-card text-card-foreground border-border text-slate-200">
                            <SelectItem value="all_parents">All Parents</SelectItem>
                            {classes.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name} Parents</SelectItem>
                            ))}
                            <SelectItem value="staff">All Staff</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-muted-foreground">Channel</Label>
                    <div className="grid grid-cols-3 gap-2">
                        <Button
                            type="button"
                            variant={channel === 'sms' ? 'default' : 'outline'}
                            className={`${channel === 'sms' ? 'bg-[var(--school-accent)]' : 'border-border text-muted-foreground'}`}
                            onClick={() => setChannel('sms')}
                        >
                            <MessageSquare className="h-4 w-4 mr-2" /> SMS
                        </Button>
                        <Button
                            type="button"
                            variant={channel === 'whatsapp' ? 'default' : 'outline'}
                            className={`${channel === 'whatsapp' ? 'bg-green-600 hover:bg-green-700' : 'border-border text-muted-foreground'}`}
                            onClick={() => setChannel('whatsapp')}
                        >
                            <Phone className="h-4 w-4 mr-2" /> WhatsApp
                        </Button>
                        <Button
                            type="button"
                            variant={channel === 'email' ? 'default' : 'outline'}
                            className={`${channel === 'email' ? 'bg-slate-100 text-slate-900' : 'border-border text-muted-foreground'}`}
                            onClick={() => setChannel('email')}
                        >
                            <Mail className="h-4 w-4 mr-2" /> Email
                        </Button>
                    </div>
                </div>

                <div className="space-y-4 flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between">
                        <Label className="text-muted-foreground">Message</Label>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 h-8 px-3"
                            onClick={() => setIsAIOpen(true)}
                        >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate with AI
                        </Button>
                    </div>
                    <Textarea
                        name="message"
                        required
                        value={messageDraft}
                        onChange={(e) => setMessageDraft(e.target.value)}
                        className="bg-slate-950 border-border text-foreground resize-none h-full min-h-[150px] flex-1 font-mono text-sm leading-relaxed"
                        placeholder="Type your message here or use AI to draft one..."
                    />
                </div>

                <div className="flex items-center justify-between pt-2">
                    <Button type="button" variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-white/10">
                        <Paperclip className="h-4 w-4 mr-2" /> Attach File
                    </Button>
                    <Button type="submit" disabled={sending || !messageDraft.trim()} className="bg-[var(--school-accent)] text-foreground w-32">
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Now"}
                    </Button>
                </div>
            </form>

            <Dialog open={isAIOpen} onOpenChange={setIsAIOpen}>
                <DialogContent className="sm:max-w-[425px] bg-slate-950 border-border/50 text-foreground">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-amber-500">
                            <Sparkles className="h-5 w-5" />
                            AI Broadcast Writer
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Let Gemini draft your {channel.toUpperCase()} broadcast instantly.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="ai-topic" className="text-slate-300">What is the announcement about?</Label>
                            <Textarea
                                id="ai-topic"
                                placeholder="e.g., Tomorrow is a public holiday, school resumes on Thursday."
                                className="bg-card text-card-foreground border-border text-foreground resize-none"
                                value={aiTopic}
                                onChange={(e) => setAiTopic(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ai-tone" className="text-slate-300">Tone</Label>
                            <Select value={aiTone} onValueChange={setAiTone}>
                                <SelectTrigger className="bg-card text-card-foreground border-border text-foreground">
                                    <SelectValue placeholder="Select a tone" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-border text-foreground">
                                    <SelectItem value="Professional">Professional (Standard)</SelectItem>
                                    <SelectItem value="Urgent">Urgent Warning</SelectItem>
                                    <SelectItem value="Friendly">Friendly & Enthusiastic</SelectItem>
                                    <SelectItem value="Formal">Formal & Academic</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-secondary/50" onClick={() => setIsAIOpen(false)} disabled={aiGenerating}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAIGenerate}
                            disabled={aiGenerating || !aiTopic.trim()}
                            className="bg-amber-500 hover:bg-amber-600 text-foreground shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                        >
                            {aiGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                            {aiGenerating ? "Drafting..." : "Generate Draft"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    )
}
